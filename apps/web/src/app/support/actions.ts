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

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.ticket.count({
    where: { createdByUserId: user.id, createdAt: { gte: oneDayAgo } },
  });
  if (recentCount >= 5) {
    throw new Error('You have reached the daily limit for new tickets (5/day). Please add to an existing ticket instead, or try again tomorrow.');
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

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.ticketMessage.count({
    where: { authorUserId: user.id, isFromSupport: false, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= 20) {
    throw new Error('You are sending messages too quickly. Please wait a bit before sending more.');
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