'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';

export async function saveListingPage(
  slug: string,
  data: {
    pageSlug: string;
    title: string;
    description: string;
    listingIds: string[];
    agentName: string;
    agentPhone: string;
    agentEmail: string;
    agentPhotoUrl: string;
    agentBio: string;
  }
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

  const shared = {
    slug: cleanSlug,
    title: data.title,
    description: data.description,
    listingIds: data.listingIds as any,
    agentName: data.agentName.trim() || null,
    agentPhone: data.agentPhone.trim() || null,
    agentEmail: data.agentEmail.trim() || null,
    agentPhotoUrl: data.agentPhotoUrl.trim() || null,
    agentBio: data.agentBio.trim() || null,
  };

  await prisma.listingPage.upsert({
    where: { nicheInstallId: install.id },
    update: shared,
    create: { nicheInstallId: install.id, ...shared },
  });

  revalidatePath(`/niche/${slug}/listing-page`);
}