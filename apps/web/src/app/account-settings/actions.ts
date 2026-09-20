'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@repo/database';
import {
  createResendDomain,
  getResendDomain,
  deleteResendDomain,
  mapResendStatus,
} from '@repo/email';

async function getCurrentAccountId() {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error('No account found for this user');

  return user.accountId;
}

export async function addSendingDomain(domain: string) {
  const accountId = await getCurrentAccountId();
  const trimmed = domain.trim().toLowerCase();
  if (!trimmed) return;

  const { data, error } = await createResendDomain(trimmed);
  if (error || !data) {
    throw new Error(error?.message ?? 'Resend rejected this domain');
  }

  await prisma.sendingDomain.create({
    data: {
      accountId,
      domain: trimmed,
      resendDomainId: data.id,
      status: 'PENDING',
      records: data.records ?? [],
    },
  });

  revalidatePath('/account-settings');
}

export async function refreshDomainStatus(sendingDomainId: string) {
  const accountId = await getCurrentAccountId();

  const record = await prisma.sendingDomain.findFirst({
    where: { id: sendingDomainId, accountId },
  });
  if (!record) return;

  const { data } = await getResendDomain(record.resendDomainId);
  if (!data) return;

  await prisma.sendingDomain.update({
    where: { id: record.id },
    data: {
      status: mapResendStatus(data.status),
      records: data.records ?? record.records,
    },
  });

  revalidatePath('/account-settings');
}

export async function removeSendingDomain(sendingDomainId: string) {
  const accountId = await getCurrentAccountId();

  const record = await prisma.sendingDomain.findFirst({
    where: { id: sendingDomainId, accountId },
  });
  if (!record) return;

  try {
    await deleteResendDomain(record.resendDomainId);
  } catch (err) {
    console.error('[account-settings] Failed to remove domain from Resend (removing locally anyway):', err);
  }

  await prisma.sendingDomain.delete({ where: { id: record.id } });

  revalidatePath('/account-settings');
}