import { prisma } from '@repo/database';
import AdminTicketsClient from './AdminTicketsClient';

export default async function AdminTicketsPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      account: { select: { name: true } },
      _count: { select: { messages: true } },
    },
  });

  const rows = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    accountName: t.account.name,
    messageCount: t._count.messages,
    updatedAt: t.updatedAt.toISOString(),
  }));

  return <AdminTicketsClient rows={rows} />;
}