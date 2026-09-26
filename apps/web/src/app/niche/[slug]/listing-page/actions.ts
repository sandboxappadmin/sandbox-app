'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';

export async function saveListingPage(
  slug: string,
  data: { pageSlug: string; title: string; description: string; listingIds: string[] }
) {
  const { install } = await getCurrentNicheInstall(slug);

  const cleanSlug = data.pageSlug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');

  if (!cleanSlug) {
    throw new Error('Please choose a page URL.');
  }

  const existing = await prisma.listingPage.findUnique({ where: { slug: cleanSlug } });
  if (existing && existing.nicheInstallId !== install.id) {
    throw new Error('That page URL is already taken. Please choose another.');
  }

  await prisma.listingPage.upsert({
    where: { nicheInstallId: install.id },
    update: { slug: cleanSlug, title: data.title, description: data.description, listingIds: data.listingIds as any },
    create: {
      nicheInstallId: install.id,
      slug: cleanSlug,
      title: data.title,
      description: data.description,
      listingIds: data.listingIds as any,
    },
  });

  revalidatePath(`/niche/${slug}/listing-page`);
}