'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { createCheckoutSession, PLAN_PRICE_CENTAVOS } from '@repo/paymongo';
import { assertOwner } from '@/lib/roles';

const GHL_BUNDLE_CENTAVOS = 79900;

export async function startCheckout() {
  const user = await assertOwner();

  const subscription = await prisma.subscription.findUnique({
    where: { accountId: user.accountId },
    select: { planType: true },
  });

  const isGhlBundle = subscription?.planType === 'SANDBOX_PLUS_GHL';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.snbxpro.com';

  const result = await createCheckoutSession(
    user.accountId,
    user.email,
    `${baseUrl}/billing/success`,
    `${baseUrl}/billing/cancel`,
    isGhlBundle
      ? { name: 'Sandbox App + GHL Sub-Account — Monthly', amountCentavos: GHL_BUNDLE_CENTAVOS }
      : undefined
  );

  if (!result.ok) {
    console.error('[billing] Failed to create checkout session:', result.error, result.raw);
    throw new Error('Could not start checkout. Please try again or contact support.');
  }

  await prisma.subscription.upsert({
    where: { accountId: user.accountId },
    update: { paymongoCheckoutSessionId: result.sessionId },
    create: { accountId: user.accountId, paymongoCheckoutSessionId: result.sessionId },
  });

  redirect(result.checkoutUrl);
}