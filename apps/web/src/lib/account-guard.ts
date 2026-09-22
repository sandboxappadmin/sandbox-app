import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';

export async function assertActiveAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: {
      status: true,
      subscription: { select: { status: true, trialEndsAt: true, currentPeriodEnd: true } },
    },
  });

  if (!account || account.status !== 'ACTIVE') {
    redirect('/suspended');
  }

  const sub = account.subscription;

  if (!sub) {
    redirect('/trial-expired');
  }

  if (sub.status === 'COMP') {
    return; // unrestricted, always — no period to check
  }

  if (sub.status === 'ACTIVE') {
    if (sub.currentPeriodEnd && sub.currentPeriodEnd > new Date()) {
      return; // paid, and still within the period that payment covered
    }
    redirect('/trial-expired?reason=renewal');
  }

  if (sub.status === 'TRIALING') {
    if (sub.trialEndsAt && sub.trialEndsAt > new Date()) {
      return;
    }
    redirect('/trial-expired?reason=trial');
  }

  redirect('/trial-expired');
}