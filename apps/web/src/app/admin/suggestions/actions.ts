'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { isSuperAdmin } from '@/lib/super-admin';

export async function updateSuggestionStatus(
  suggestionId: string,
  status: 'OPEN' | 'PLANNED' | 'IN_PROGRESS' | 'SHIPPED' | 'DECLINED'
) {
  if (!(await isSuperAdmin())) {
    throw new Error('Unauthorized');
  }

  const suggestion = await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status },
  });

  const STATUS_LABELS: Record<string, string> = {
    OPEN: 'Open',
    PLANNED: 'Planned',
    IN_PROGRESS: 'In Progress',
    SHIPPED: 'Shipped',
    DECLINED: 'Declined',
  };

  await prisma.notification.create({
    data: {
      userId: suggestion.authorUserId,
      type: 'SUGGESTION_STATUS_CHANGED',
      title: `"${suggestion.title}" is now ${STATUS_LABELS[status]}`,
      body: 'Tap to see your suggestion.',
      linkUrl: '/feedback',
    },
  });

  revalidatePath('/admin/suggestions');
  revalidatePath('/feedback');
}