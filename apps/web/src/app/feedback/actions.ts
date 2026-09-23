'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
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

export async function createSuggestion(title: string, description: string) {
  const user = await getCurrentUser();

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error('Title is required');
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.suggestion.count({
    where: { authorUserId: user.id, createdAt: { gte: oneDayAgo } },
  });
  if (recentCount >= 5) {
    throw new Error('You have reached the daily limit for suggestions (5/day). Please try again tomorrow.');
  }

  await prisma.suggestion.create({
    data: {
      title: trimmedTitle,
      description: description.trim(),
      authorUserId: user.id,
    },
  });

  revalidatePath('/feedback');
}

export async function toggleVote(suggestionId: string) {
  const user = await getCurrentUser();

  const existing = await prisma.suggestionVote.findUnique({
    where: { suggestionId_userId: { suggestionId, userId: user.id } },
  });

  if (existing) {
    await prisma.suggestionVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.suggestionVote.create({
      data: { suggestionId, userId: user.id },
    });
  }

  revalidatePath('/feedback');
}