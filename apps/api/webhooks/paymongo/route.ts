import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { verifyPaymongoSignature } from '@repo/paymongo';

export async function POST(req: Request) {
  const signatureHeader = req.headers.get('paymongo-signature') ?? req.headers.get('x-paymongo-signature');

  if (!signatureHeader) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  const rawBody = await req.text();

  if (!verifyPaymongoSignature(rawBody, signatureHeader)) {
    console.error('[paymongo webhook] Signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventType = event?.data?.attributes?.type;

  // Log the full raw event on first real receipt — we need this to confirm
  // our assumptions about payload shape and where reference_number lives.
  console.log('[paymongo webhook] Received event:', eventType, JSON.stringify(event));

  if (eventType === 'checkout_session.payment.paid' || eventType === 'payment.paid') {
    const referenceNumber =
      event?.data?.attributes?.data?.attributes?.reference_number ??
      event?.data?.attributes?.data?.attributes?.external_reference_number ??
      event?.data?.attributes?.data?.attributes?.data?.attributes?.reference_number;

    if (!referenceNumber) {
      console.error('[paymongo webhook] Could not find reference_number in event payload — check logged shape above');
      return NextResponse.json({ received: true, warning: 'no reference_number found' });
    }

    const account = await prisma.account.findUnique({ where: { id: referenceNumber } });
    if (!account) {
      console.error(`[paymongo webhook] No account found for reference_number ${referenceNumber}`);
      return NextResponse.json({ received: true, warning: 'account not found' });
    }

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    await prisma.subscription.upsert({
      where: { accountId: account.id },
      update: { status: 'ACTIVE', currentPeriodEnd },
      create: { accountId: account.id, status: 'ACTIVE', currentPeriodEnd },
    });

    console.log(`[paymongo webhook] Activated subscription for account ${account.id}`);
  }

  return NextResponse.json({ received: true });
}