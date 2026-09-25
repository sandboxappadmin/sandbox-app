import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import { assertActiveAccount } from '@/lib/account-guard';
import { isSuperAdmin } from '@/lib/super-admin';
import DesktopHeader from '../../desktop/DesktopHeader';
import TicketThreadClient from './TicketThreadClient';

export default async function TicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/desktop');

  await assertActiveAccount(user.accountId);

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { authorUser: { select: { name: true, email: true } } },
      },
    },
  });

  // Ownership check — a customer can never view another account's ticket,
  // even by guessing/pasting a valid ticket ID into the URL.
  if (!ticket || ticket.accountId !== user.accountId) {
    notFound();
  }

  const admin = await isSuperAdmin();

  const serialized = {
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      body: m.body,
      isFromSupport: m.isFromSupport,
      authorName: m.authorUser.name ?? m.authorUser.email,
      createdAt: m.createdAt.toISOString(),
    })),
  };

  return (
    <>
      <DesktopHeader isSuperAdmin={admin} showBackButton isOwner={user?.role === 'OWNER'} canManageAccount={user?.role === 'OWNER' || user?.role === 'ADMIN'} />
      <TicketThreadClient ticket={serialized} />
    </>
  );
}