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

  await prisma.suggestion.update({ where: { id: suggestionId }, data: { status } });

  revalidatePath('/admin/suggestions');
  revalidatePath('/feedback');
}