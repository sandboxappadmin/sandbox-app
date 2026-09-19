'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';

export async function createContact(
  slug: string,
  data: { firstName: string; lastName: string; email: string; phone: string }
) {
  const { install } = await getCurrentNicheInstall(slug);

  await prisma.contact.create({
    data: {
      nicheInstallId: install.id,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      email: data.email || null,
      phone: data.phone || null,
    },
  });

  revalidatePath(`/niche/${slug}/contacts`);
}