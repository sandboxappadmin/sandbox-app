import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { assertActiveAccount } from '@/lib/account-guard';
import { isSuperAdmin } from '@/lib/super-admin';
import DesktopHeader from '../desktop/DesktopHeader';
import FeedbackClient from './FeedbackClient';

export default async function FeedbackPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/desktop');

  await assertActiveAccount(user.accountId);

  const admin = await isSuperAdmin();

  const suggestions = await prisma.suggestion.findMany({
    orderBy: [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }],
    include: {
      authorUser: { select: { name: true, email: true } },
      _count: { select: { votes: true } },
      votes: { where: { userId: user.id }, select: { id: true } },
    },
  });

  const serialized = suggestions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    authorName: s.authorUser.name ?? s.authorUser.email,
    voteCount: s._count.votes,
    hasVoted: s.votes.length > 0,
  }));

  return (
    <>
              return <DesktopGrid isSuperAdmin={admin} isOwner={user?.role === 'OWNER'} canManageAccount={user?.role === 'OWNER' || user?.role === 'ADMIN'} />;
      <FeedbackClient initialSuggestions={serialized} />
    </>
  );
}