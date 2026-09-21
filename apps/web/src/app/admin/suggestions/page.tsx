import { prisma } from '@repo/database';
import AdminSuggestionsClient from './AdminSuggestionsClient';

export default async function AdminSuggestionsPage() {
  const suggestions = await prisma.suggestion.findMany({
    orderBy: [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }],
    include: {
      authorUser: { select: { name: true, email: true } },
      _count: { select: { votes: true } },
    },
  });

  const rows = suggestions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    status: s.status,
    authorName: s.authorUser.name ?? s.authorUser.email,
    voteCount: s._count.votes,
    createdAt: s.createdAt.toISOString(),
  }));

  return <AdminSuggestionsClient rows={rows} />;
}