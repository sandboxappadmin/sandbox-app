import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { verifyPaymongoSignature } from '@repo/paymongo';
import { revalidatePath } from 'next/cache';
import { PLAN_PRICE_PHP } from '@repo/paymongo';

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

    const hasRemainingPaidTime =
      existingSubscription?.status === 'ACTIVE' &&
      existingSubscription.currentPeriodEnd &&
      existingSubscription.currentPeriodEnd > new Date();

    const baseDate = hasRemainingPaidTime ? existingSubscription!.currentPeriodEnd! : new Date();
    const currentPeriodEnd = new Date(baseDate);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    const newPlanType = existingSubscription?.pendingCheckoutPlanType ?? existingSubscription?.planType ?? 'SANDBOX_ONLY';
    const isNewGhlUpgrade = newPlanType === 'SANDBOX_PLUS_GHL' && existingSubscription?.planType !== 'SANDBOX_PLUS_GHL';

    await prisma.subscription.upsert({
      where: { accountId: account.id },
      update: {
        status: 'ACTIVE',
        currentPeriodEnd,
        planType: newPlanType,
        pendingCheckoutPlanType: null,
        renewalReminderSentAt: null,
      },
      create: {
        accountId: account.id,
        status: 'ACTIVE',
        currentPeriodEnd,
        planType: newPlanType,
        renewalReminderSentAt: null,
      },
    });

    console.log(
      `[paymongo webhook] ${hasRemainingPaidTime ? 'Renewed' : 'Activated'} subscription for account ${account.id}, plan ${newPlanType}, new period ends ${currentPeriodEnd.toISOString()}`
    );

    if (isNewGhlUpgrade) {
      const pendingGhlRequest = await prisma.ghlRequest.findFirst({
        where: { accountId: account.id, status: 'PENDING_PAYMENT' },
        orderBy: { createdAt: 'desc' },
      });

      if (pendingGhlRequest) {
        await prisma.ghlRequest.update({
          where: { id: pendingGhlRequest.id },
          data: { status: 'PAID', paidAt: new Date() },
        });

        const owner = await prisma.user.findFirst({ where: { accountId: account.id, role: 'OWNER' } });

        await prisma.ticket.create({
          data: {
            subject: `[GHL Sub-Account Request] ${account.name}`,
            accountId: account.id,
            createdByUserId: owner!.id,
            messages: {
              create: {
                body: `Payment received for Sandbox App + GHL bundle (₱799/month).\n\nBusiness name for GHL: ${pendingGhlRequest.businessName}\nAdditional notes: ${pendingGhlRequest.notes ?? 'None'}\n\nPlease provision the sub-account and inform the customer.`,
                authorUserId: owner!.id,
                isFromSupport: false,
              },
            },
          },
        });

        const adminEmails = (process.env.SUPER_ADMIN_EMAILS ?? '')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        const admins = await prisma.user.findMany({ where: { email: { in: adminEmails } } });

        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: 'TICKET_REPLY' as const,
            title: `GHL upgrade paid: ${account.name}`,
            body: `${pendingGhlRequest.businessName} — ready to provision.`,
            linkUrl: '/admin/tickets',
          })),
        });
      }
    }

    revalidatePath('/admin/accounts');
    revalidatePath('/account-settings');

    const owner = await prisma.user.findFirst({ where: { accountId: account.id, role: 'OWNER' } });
    if (owner?.email) {
      const { sendEmail } = await import('@repo/email');
      await sendEmail({
        from: 'Sandbox App <hello@email.snbxpro.com>',
        to: owner.email,
        subject: 'Payment Receipt — Sandbox App',
        text: `Hi,\n\nThis confirms your payment of ₱${PLAN_PRICE_PHP} for Sandbox App.\n\nYour subscription is now active${currentPeriodEnd ? ` through ${currentPeriodEnd.toLocaleDateString()}` : ''}.\n\nThanks for using Sandbox App.`,
      });
    }

    console.log(`[paymongo webhook] Activated subscription for account ${account.id}`);
  }

  return NextResponse.json({ received: true });
}