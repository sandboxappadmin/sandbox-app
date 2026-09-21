'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@repo/database';
import { assertActiveAccount } from '@/lib/account-guard';

async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/desktop');

  await assertActiveAccount(user.accountId);

  return user;
}

export async function createTicket(subject: string, message: string) {
  const user = await getCurrentUser();
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();

  if (!trimmedSubject || !trimmedMessage) {
    throw new Error('Subject and message are required');
  }

  const ticket = await prisma.ticket.create({
    data: {
      subject: trimmedSubject,
      accountId: user.accountId,
      createdByUserId: user.id,
      messages: {
        create: {
          body: trimmedMessage,
          authorUserId: user.id,
          isFromSupport: false,
        },
      },
    },
  });

  revalidatePath('/support');
  redirect(`/support/${ticket.id}`);
}

export async function addCustomerReply(ticketId: string, body: string) {
  const user = await getCurrentUser();
  const trimmed = body.trim();
  if (!trimmed) return;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.accountId !== user.accountId) {
    throw new Error('Ticket not found');
  }

  await prisma.ticketMessage.create({
    data: { ticketId, body: trimmed, authorUserId: user.id, isFromSupport: false },
  });

  // A customer replying to a resolved/closed ticket reopens it automatically
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'OPEN' } });
  }

  revalidatePath(`/support/${ticketId}`);
}