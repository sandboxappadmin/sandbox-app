'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';

export async function renameWorkspace(slug: string, name: string) {
  const { install } = await getCurrentNicheInstall(slug);
  const trimmed = name.trim();
  if (!trimmed) return;

  await prisma.nicheInstall.update({
    where: { id: install.id },
    data: { label: trimmed },
  });

  // 'layout' also invalidates the sidebar (which shows this name)
  // and every page nested under this niche, not just Settings itself.
  revalidatePath(`/niche/${slug}`, 'layout');
}

export async function createTag(slug: string, name: string) {
  const { install } = await getCurrentNicheInstall(slug);
  const trimmed = name.trim();
  if (!trimmed) return;

  await prisma.tag.upsert({
    where: { nicheInstallId_name: { nicheInstallId: install.id, name: trimmed } },
    update: {},
    create: { nicheInstallId: install.id, name: trimmed },
  });

  revalidatePath(`/niche/${slug}/settings`);
}

export async function deleteTag(slug: string, tagId: string) {
  await getCurrentNicheInstall(slug);
  await prisma.tag.delete({ where: { id: tagId } });

  revalidatePath(`/niche/${slug}/settings`);
  revalidatePath(`/niche/${slug}/contacts`);
}

export async function createCustomField(
  slug: string,
  data: { label: string; type: string; options?: string[] }
) {
  const { install } = await getCurrentNicheInstall(slug);
  const label = data.label.trim();
  if (!label) return;

  // Derive a stable machine key from the label automatically —
  // no need to make the user think about "keys" vs "labels".
  const key = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!key) return;

  await prisma.customFieldDefinition.create({
    data: {
      nicheInstallId: install.id,
      key,
      label,
      type: data.type as any,
      options: data.type === 'DROPDOWN' ? (data.options ?? []) : undefined,
    },
  });

  revalidatePath(`/niche/${slug}/settings`);
}

export async function deleteCustomField(slug: string, fieldId: string) {
  await getCurrentNicheInstall(slug);
  await prisma.customFieldDefinition.delete({ where: { id: fieldId } });

  revalidatePath(`/niche/${slug}/settings`);
}