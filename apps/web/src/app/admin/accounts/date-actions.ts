'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { isSuperAdmin } from '@/lib/super-admin';

export async function setRenewalDate(accountId: string, dateString: string) {
  if (!(await isSuperAdmin())) {
    throw new Error('Unauthorized');
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const subscription = await prisma.subscription.findUnique({ where: { accountId } });
  if (!subscription) {
    throw new Error('This account has no subscription record yet');
  }

  // Update whichever date field is actually relevant to this account's
  // current status — editing a date that isn't checked wouldn't do anything.
  const field = subscription.status === 'TRIALING' ? 'trialEndsAt' : 'currentPeriodEnd';

  await prisma.subscription.update({
    where: { accountId },
    data: { [field]: date, renewalReminderSentAt: null },
  });

  revalidatePath('/admin/accounts');
}