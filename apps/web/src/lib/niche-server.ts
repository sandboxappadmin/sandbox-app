import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import { getNicheBySlug } from './niches';
import { assertActiveAccount } from './account-guard';

export const getCurrentNicheInstall = cache(async (slug: string) => {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const niche = getNicheBySlug(slug);
  if (!niche) notFound();

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/');

  await assertActiveAccount(user.accountId);

  const install = await prisma.nicheInstall.findFirst({
    where: { accountId: user.accountId, niche: niche.type },
  });

  if (!install) redirect('/desktop');

  return { install, niche, user };
});