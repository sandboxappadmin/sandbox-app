'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { assertOwner } from '@/lib/roles';
import { createCheckoutSession } from '@repo/paymongo';

export async function startGhlUpgradeCheckout(businessName: string, notes: string) {
  const user = await assertOwner();

  if (!businessName.trim()) {
    throw new Error('Business name is required');
  }

  await prisma.ghlRequest.create({
    data: {
      accountId: user.accountId,
      businessName: businessName.trim(),
      notes: notes.trim() || null,
    },
  });

  await prisma.subscription.update({
    where: { accountId: user.accountId },
    data: { pendingCheckoutPlanType: 'SANDBOX_PLUS_GHL' },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.snbxpro.com';

  const result = await createCheckoutSession(
    user.accountId,
    user.email,
    `${baseUrl}/billing/success`,
    `${baseUrl}/billing/cancel`,
    { name: 'Sandbox App + GHL Sub-Account — Monthly', amountCentavos: 79900 }
  );

  if (!result.ok) {
    console.error('[ghl-billing] Failed to create checkout session:', result.error, result.raw);
    throw new Error('Could not start checkout. Please try again or contact support.');
  }

  await prisma.subscription.update({
    where: { accountId: user.accountId },
    data: { paymongoCheckoutSessionId: result.sessionId },
  });

  redirect(result.checkoutUrl);
}

export async function scheduleDowngradeToSandboxOnly() {
  const user = await assertOwner();

  await prisma.subscription.update({
    where: { accountId: user.accountId },
    data: { pendingPlanType: 'SANDBOX_ONLY' },
  });

  revalidatePath('/account-settings');
}

export async function cancelPendingDowngrade() {
  const user = await assertOwner();

  await prisma.subscription.update({
    where: { accountId: user.accountId },
    data: { pendingPlanType: null },
  });

  revalidatePath('/account-settings');
}