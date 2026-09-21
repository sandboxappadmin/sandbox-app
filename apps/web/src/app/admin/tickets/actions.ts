'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@repo/database';
import { isSuperAdmin } from '@/lib/super-admin';

async function assertSuperAdminAndGetUser() {
  if (!(await isSuperAdmin())) {
    throw new Error('Unauthorized');
  }

  const { userId } = await auth();
  const user = await prisma.user.findUnique({ where: { clerkId: userId! } });
  if (!user) throw new Error('No user record found');

  return user;
}

export async function addSupportReply(ticketId: string, body: string) {
  const user = await assertSuperAdminAndGetUser();
  const trimmed = body.trim();
  if (!trimmed) return;

  await prisma.ticketMessage.create({
    data: { ticketId, body: trimmed, authorUserId: user.id, isFromSupport: true },
  });

  await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'IN_PROGRESS' } });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
}

export async function updateTicketStatus(
  ticketId: string,
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
) {
  await assertSuperAdminAndGetUser();

  await prisma.ticket.update({ where: { id: ticketId }, data: { status } });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
}