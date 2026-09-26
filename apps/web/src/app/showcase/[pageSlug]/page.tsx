import { notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import ShowcaseClient from './ShowcaseClient';

export default async function ShowcasePage({ params }: { params: Promise<{ pageSlug: string }> }) {
  const { pageSlug } = await params;

  const listingPage = await prisma.listingPage.findUnique({ where: { slug: pageSlug } });
  if (!listingPage) notFound();

  const listingIds = (listingPage.listingIds as string[]) ?? [];
  const listings = listingIds.length
    ? await prisma.listing.findMany({ where: { id: { in: listingIds } } })
    : [];

  const serialized = listings.map((l) => ({
    id: l.id,
    address: l.address,
    price: l.price ? Number(l.price) : null,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    squareFeet: l.squareFeet,
    status: l.status,
    description: l.description,
    imageUrls: (l.imageUrls as string[] | null) ?? [],
  }));

  return <ShowcaseClient title={listingPage.title} description={listingPage.description} listings={serialized} />;
}