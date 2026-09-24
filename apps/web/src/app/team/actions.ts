'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { sendEmail } from '@repo/email';
import { assertOwner } from '@/lib/roles';

export async function sendInvitation(email: string, role: 'ADMIN' | 'AGENT') {
  const owner = await assertOwner();
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    throw new Error('Email is required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (existingUser) {
    throw new Error('This email is already associated with an account and cannot be invited.');
  }

  const token = randomBytes(24).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.invitation.upsert({
    where: { accountId_email: { accountId: owner.accountId, email: trimmedEmail } },
    update: { role, status: 'PENDING', token, expiresAt, invitedByUserId: owner.id },
    create: {
      accountId: owner.accountId,
      email: trimmedEmail,
      role,
      token,
      expiresAt,
      invitedByUserId: owner.id,
    },
  });

  const account = await prisma.account.findUnique({ where: { id: owner.accountId } });
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

  await sendEmail({
    from: 'Sandbox App <hello@email.snbxpro.com>',
    to: trimmedEmail,
    subject: `You've been invited to join ${account?.name} on Sandbox App`,
    text: `You've been invited to join ${account?.name} as a${role === 'ADMIN' ? 'n' : ''} ${role}.\n\nAccept your invite here: ${inviteUrl}\n\nThis invite expires in 7 days.`,
  });

  revalidatePath('/team');
}

export async function revokeInvitation(invitationId: string) {
  const owner = await assertOwner();

  await prisma.invitation.updateMany({
    where: { id: invitationId, accountId: owner.accountId },
    data: { status: 'REVOKED' },
  });

  revalidatePath('/team');
}

export async function updateMemberRole(userId: string, role: 'ADMIN' | 'AGENT') {
  const owner = await assertOwner();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.accountId !== owner.accountId || target.role === 'OWNER') {
    throw new Error('Cannot change this user\'s role');
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/team');
}

export async function removeMember(userId: string) {
  const owner = await assertOwner();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.accountId !== owner.accountId || target.role === 'OWNER') {
    throw new Error('Cannot remove this user');
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/team');
}