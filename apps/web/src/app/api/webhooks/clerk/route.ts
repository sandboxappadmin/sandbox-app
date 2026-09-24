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

    const existing = await prisma.user.findUnique({ where: { clerkId } });

    if (!existing) {
      const pendingInvitation = await prisma.invitation.findFirst({
        where: { email: email.toLowerCase(), status: 'PENDING', expiresAt: { gt: new Date() } },
      });

      if (pendingInvitation) {
        await prisma.user.create({
          data: {
            clerkId,
            email,
            name: [first_name, last_name].filter(Boolean).join(' '),
            role: pendingInvitation.role,
            accountId: pendingInvitation.accountId,
          },
        });

        await prisma.invitation.update({
          where: { id: pendingInvitation.id },
          data: { status: 'ACCEPTED' },
        });
      } else {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

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
            subscription: {
              create: {
                status: 'TRIALING',
                trialEndsAt,
              },
            },
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}