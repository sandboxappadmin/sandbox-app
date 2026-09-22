import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { verifyPaymongoSignature } from '@repo/paymongo';
import { revalidatePath } from 'next/cache';

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

        const existingSubscription = await prisma.subscription.findUnique({
      where: { accountId: account.id },
    });

    // If they're already ACTIVE with time remaining, stack 30 fresh days
    // onto whatever's left rather than discarding it. Trialing (or lapsed/
    // no existing period) always starts the real 30 days from right now —
    // paying early during a trial converts immediately, it doesn't wait
    // out the rest of the free period.
    const hasRemainingPaidTime =
      existingSubscription?.status === 'ACTIVE' &&
      existingSubscription.currentPeriodEnd &&
      existingSubscription.currentPeriodEnd > new Date();

    const baseDate = hasRemainingPaidTime ? existingSubscription!.currentPeriodEnd! : new Date();
    const currentPeriodEnd = new Date(baseDate);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    await prisma.subscription.upsert({
      where: { accountId: account.id },
      update: { status: 'ACTIVE', currentPeriodEnd, renewalReminderSentAt: null },
      create: { accountId: account.id, status: 'ACTIVE', currentPeriodEnd, renewalReminderSentAt: null },
    });

    console.log(
      `[paymongo webhook] ${hasRemainingPaidTime ? 'Renewed' : 'Activated'} subscription for account ${account.id}, new period ends ${currentPeriodEnd.toISOString()}`
    );

        revalidatePath('/admin/accounts');
    revalidatePath('/account-settings');

    console.log(`[paymongo webhook] Activated subscription for account ${account.id}`);
  }

  return NextResponse.json({ received: true });
}