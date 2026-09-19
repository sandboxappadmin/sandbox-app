import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@repo/database';

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  try {
    // Newer svix versions only verify the signature — they no longer
    // parse and return the JSON payload, so we parse `body` ourselves below.
    wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const evt = JSON.parse(body);

  if (evt.type === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address ?? '';

    await prisma.account.create({
      data: {
        name: `${first_name ?? ''}'s Workspace`.trim(),
        users: {
          create: {
            clerkId,
            email,
            name: [first_name, last_name].filter(Boolean).join(' '),
            role: 'OWNER',
          },
        },
      },
    });
  }

  return NextResponse.json({ received: true });
}