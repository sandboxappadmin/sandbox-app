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

export async function updateContact(
  slug: string,
  contactId: string,
  data: { firstName: string; lastName: string; email: string; phone: string }
) {
  await getCurrentNicheInstall(slug);

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      email: data.email || null,
      phone: data.phone || null,
    },
  });

  revalidatePath(`/niche/${slug}/contacts`);
}

export async function deleteContact(slug: string, contactId: string) {
  await getCurrentNicheInstall(slug);

  try {
    await prisma.contact.delete({ where: { id: contactId } });
  } catch {
    // Prisma blocks this delete if the contact still has linked
    // Opportunities (a required relation) — surface a clear reason
    // instead of a raw database error.
    throw new Error(
      'This contact has opportunities linked to them. Delete or reassign those first.'
    );
  }

  revalidatePath(`/niche/${slug}/contacts`);
}