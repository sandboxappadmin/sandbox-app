import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { assertActiveAccount } from '@/lib/account-guard';
import { isSuperAdmin } from '@/lib/super-admin';
import DesktopHeader from '../desktop/DesktopHeader';
import SupportClient from './SupportClient';

export default async function SupportPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/desktop');

  await assertActiveAccount(user.accountId);

  const admin = await isSuperAdmin();

  const tickets = await prisma.ticket.findMany({
    where: { accountId: user.accountId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true } } },
  });

  const serialized = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    messageCount: t._count.messages,
  }));

  return (
    <>
      <DesktopHeader isSuperAdmin={admin} showBackButton />
      <SupportClient tickets={serialized} />
    </>
  );
}