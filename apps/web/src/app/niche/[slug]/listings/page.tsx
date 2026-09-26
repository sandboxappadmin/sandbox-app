import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';
import ListingsClient from './ListingsClient';

export default async function ListingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  const listings = await prisma.listing.findMany({
    where: { nicheInstallId: install.id },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = listings.map((l) => ({
    id: l.id,
    address: l.address,
    price: l.price ? Number(l.price) : null,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    squareFeet: l.squareFeet,
    status: l.status,
    description: l.description,
    createdAt: l.createdAt.toISOString(),
  }));

  return <ListingsClient slug={slug} initialListings={serialized} />;
}