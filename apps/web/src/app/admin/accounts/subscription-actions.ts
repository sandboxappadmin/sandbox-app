'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { isSuperAdmin } from '@/lib/super-admin';

export async function grantFreeAccess(accountId: string) {
  if (!(await isSuperAdmin())) {
    throw new Error('Unauthorized');
  }

  await prisma.subscription.upsert({
    where: { accountId },
    update: { status: 'COMP' },
    create: { accountId, status: 'COMP' },
  });

  revalidatePath('/admin/accounts');
}

export async function revertToTrialTracking(accountId: string) {
  if (!(await isSuperAdmin())) {
    throw new Error('Unauthorized');
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await prisma.subscription.upsert({
    where: { accountId },
    update: { status: 'TRIALING', trialEndsAt },
    create: { accountId, status: 'TRIALING', trialEndsAt },
  });

  revalidatePath('/admin/accounts');
}