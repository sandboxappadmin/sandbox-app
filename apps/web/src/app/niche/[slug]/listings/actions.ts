'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';

type ListingInput = {
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  status: string;
  description: string;
  imageUrls: string;
};

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

export async function createListing(slug: string, data: ListingInput) {
  const { install } = await getCurrentNicheInstall(slug);

  await prisma.listing.create({
    data: {
      nicheInstallId: install.id,
      address: data.address.trim(),
      price: toNumberOrNull(data.price),
      bedrooms: toNumberOrNull(data.bedrooms),
      bathrooms: toNumberOrNull(data.bathrooms),
      squareFeet: toNumberOrNull(data.squareFeet),
      status: data.status as any,
      description: data.description.trim() || null,
            imageUrls: data.imageUrls
        ? (data.imageUrls.split('\n').map((u) => u.trim()).filter(Boolean) as any)
        : [],
    },
  });

  revalidatePath(`/niche/${slug}/listings`);
}

export async function updateListing(slug: string, listingId: string, data: ListingInput) {
  const { install } = await getCurrentNicheInstall(slug);

  await prisma.listing.updateMany({
    where: { id: listingId, nicheInstallId: install.id },
    data: {
      address: data.address.trim(),
      price: toNumberOrNull(data.price),
      bedrooms: toNumberOrNull(data.bedrooms),
      bathrooms: toNumberOrNull(data.bathrooms),
      squareFeet: toNumberOrNull(data.squareFeet),
      status: data.status as any,
      description: data.description.trim() || null,
            imageUrls: data.imageUrls
        ? (data.imageUrls.split('\n').map((u) => u.trim()).filter(Boolean) as any)
        : [],
    },
  });

  revalidatePath(`/niche/${slug}/listings`);
}

export async function deleteListing(slug: string, listingId: string) {
  const { install } = await getCurrentNicheInstall(slug);

  try {
    await prisma.listing.deleteMany({ where: { id: listingId, nicheInstallId: install.id } });
  } catch {
    throw new Error('This listing has opportunities linked to it. Unlink or delete those first.');
  }

  revalidatePath(`/niche/${slug}/listings`);
}