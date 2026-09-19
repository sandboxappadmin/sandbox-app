import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@repo/database';
import { error } from 'console';
import { Web } from '@mui/icons-material';

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

    let evt: any;
    try {
        evt = wh.verify(body, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        });
    } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (evt.type === 'user.created') {
        const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses?.[0]?.email_address ?? '';

        // Every new signup gets their own Account (tenant) plus a User
        // row marking them as OWNER of it.
        await prisma.account.create({
            data: {
                name: `${first_name ?? ''}'s Workspace`.trim(),
                users: {
                    create: {
                        clerkId,
                        email,
                        name: [first_name, last_name].filter(Boolean).join(''),
                        role: 'OWNER',
                    },
                },
            },
        });
    }

    return NextResponse.json ({ received: true });
}