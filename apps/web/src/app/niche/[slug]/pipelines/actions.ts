'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';

export async function createOpportunity(
  slug: string,
  data: { name: string; value: string; contactId: string; stageId: string }
) {
  await getCurrentNicheInstall(slug);

  await prisma.opportunity.create({
    data: {
      name: data.name,
      value: data.value ? Number(data.value) : null,
      contactId: data.contactId,
      stageId: data.stageId,
    },
  });

  revalidatePath(`/niche/${slug}/pipelines`);
}

export async function updateOpportunity(
  slug: string,
  opportunityId: string,
  data: { name: string; value: string; contactId: string }
) {
  await getCurrentNicheInstall(slug);

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: {
      name: data.name,
      value: data.value ? Number(data.value) : null,
      contactId: data.contactId,
    },
  });

  revalidatePath(`/niche/${slug}/pipelines`);
}

export async function moveOpportunity(slug: string, opportunityId: string, newStageId: string) {
  await getCurrentNicheInstall(slug);

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { stageId: newStageId },
  });

  revalidatePath(`/niche/${slug}/pipelines`);
}

export async function deleteOpportunity(slug: string, opportunityId: string) {
  await getCurrentNicheInstall(slug);

  await prisma.opportunity.delete({ where: { id: opportunityId } });

  revalidatePath(`/niche/${slug}/pipelines`);
}