import { getCurrentNicheInstall } from '@/lib/niche-server';
import { getNicheBySlug } from '@/lib/niches';
import { prisma } from '@repo/database';
import SettingsClient from './SettingsClient';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  const tags = await prisma.tag.findMany({
    where: { nicheInstallId: install.id },
    orderBy: { name: 'asc' },
  });

  const customFields = await prisma.customFieldDefinition.findMany({
    where: { nicheInstallId: install.id },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <SettingsClient
      slug={slug}
      workspaceName={install.label}
      categoryLabel={getNicheBySlug(slug)?.label ?? ''}
      tags={tags.map((t) => ({ id: t.id, name: t.name }))}
      customFields={customFields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        options: (f.options as string[] | null) ?? [],
      }))}
    />
  );
}