'use server';

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@repo/database';
import { createCheckoutSession } from '@repo/paymongo';

export async function startCheckout() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/desktop');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.snbxpro.com';

  const result = await createCheckoutSession(
    user.accountId,
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