'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';
import { workflowQueue } from '@repo/queue';

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
  const { install } = await getCurrentNicheInstall(slug);

  const opportunity = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { stageId: newStageId },
  });

  const matchingWorkflows = await prisma.workflow.findMany({
    where: {
      nicheInstallId: install.id,
      isActive: true,
      triggers: { some: { type: 'STAGE_CHANGED' } },
    },
    include: { triggers: true },
  });

  for (const workflow of matchingWorkflows) {
    const trigger = workflow.triggers.find((t) => t.type === 'STAGE_CHANGED');
    const requiredStageId = (trigger?.config as any)?.stageId;

    // Fire if no specific stage was set (fires on any move),
    // or if the destination stage matches exactly what was configured.
    if (!requiredStageId || requiredStageId === newStageId) {
      await workflowQueue.add('run-workflow', {
        workflowId: workflow.id,
        contactId: opportunity.contactId,
        nicheInstallId: install.id,
      });
    }
  }

  revalidatePath(`/niche/${slug}/pipelines`);
}

export async function deleteOpportunity(slug: string, opportunityId: string) {
  await getCurrentNicheInstall(slug);

  await prisma.opportunity.delete({ where: { id: opportunityId } });

  revalidatePath(`/niche/${slug}/pipelines`);
}