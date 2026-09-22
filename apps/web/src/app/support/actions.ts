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

  const adminEmails = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const admins = await prisma.user.findMany({ where: { email: { in: adminEmails } } });

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: 'TICKET_REPLY' as const,
      title: `New ticket: ${trimmedSubject}`,
      body: trimmedMessage.length > 100 ? `${trimmedMessage.slice(0, 100)}…` : trimmedMessage,
      linkUrl: `/admin/tickets/${ticket.id}`,
    })),
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

  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'OPEN' } });
  }

  const adminEmails = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const admins = await prisma.user.findMany({ where: { email: { in: adminEmails } } });

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: 'TICKET_REPLY' as const,
      title: `New reply: ${ticket.subject}`,
      body: trimmed.length > 100 ? `${trimmed.slice(0, 100)}…` : trimmed,
      linkUrl: `/admin/tickets/${ticketId}`,
    })),
  });

  revalidatePath(`/support/${ticketId}`);
}