import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';
import ListingPageClient from './ListingPageClient';

export default async function ListingPageSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  const [listingPage, listings] = await Promise.all([
    prisma.listingPage.findUnique({ where: { nicheInstallId: install.id } }),
    prisma.listing.findMany({ where: { nicheInstallId: install.id }, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <ListingPageClient
      slug={slug}
      initialPage={
        listingPage
          ? {
              pageSlug: listingPage.slug,
              title: listingPage.title,
              description: listingPage.description ?? '',
              listingIds: (listingPage.listingIds as string[]) ?? [],
            }
          : null
      }
      listings={listings.map((l) => ({ id: l.id, address: l.address, status: l.status }))}
    />
  );
}