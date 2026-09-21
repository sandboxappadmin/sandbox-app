import { notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import AdminTicketThreadClient from './AdminTicketThreadClient';

export default async function AdminTicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      account: { select: { name: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { authorUser: { select: { name: true, email: true } } },
      },
    },
  });

  if (!ticket) notFound();

  const serialized = {
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    accountName: ticket.account.name,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      body: m.body,
      isFromSupport: m.isFromSupport,
      authorName: m.authorUser.name ?? m.authorUser.email,
      createdAt: m.createdAt.toISOString(),
    })),
  };

  return <AdminTicketThreadClient ticket={serialized} />;
}