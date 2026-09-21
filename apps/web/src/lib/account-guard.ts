import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';

export async function assertActiveAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: {
      status: true,
      subscription: { select: { status: true, trialEndsAt: true } },
    },
  });

  if (!account || account.status !== 'ACTIVE') {
    redirect('/suspended');
  }

  const sub = account.subscription;

  if (!sub) {
    redirect('/trial-expired');
  }

  if (sub.status === 'COMP' || sub.status === 'ACTIVE') {
    return;
  }

  if (sub.status === 'TRIALING') {
    if (sub.trialEndsAt && sub.trialEndsAt > new Date()) {
      return;
    }
    redirect('/trial-expired');
  }

  redirect('/trial-expired');
}