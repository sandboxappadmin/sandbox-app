'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { createCheckoutSession } from '@repo/paymongo';
import { assertOwner } from '@/lib/roles';

export async function startCheckout() {
  const user = await assertOwner();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.snbxpro.com';

  const result = await createCheckoutSession(
    user.accountId,
    user.email,
    `${baseUrl}/billing/success`,
    `${baseUrl}/billing/cancel`
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