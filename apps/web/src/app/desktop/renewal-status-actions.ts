'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@repo/database';

export async function getRenewalStatus() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return null;

  const subscription = await prisma.subscription.findUnique({
    where: { accountId: user.accountId },
    select: { status: true, trialEndsAt: true, currentPeriodEnd: true },
  });

  if (!subscription) return null;
  if (subscription.status === 'COMP') return null;

  const relevantDate = subscription.status === 'TRIALING' ? subscription.trialEndsAt : subscription.currentPeriodEnd;
  if (!relevantDate) return null;

  const now = new Date();
  const daysLeft = Math.ceil((relevantDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft > 7 || daysLeft < 0) return null;

  return {
    daysLeft,
    isTrialEnding: subscription.status === 'TRIALING',
    dateString: relevantDate.toLocaleDateString(),
  };
}