'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';

type StepInput = { type: string; config: Record<string, any> };

export async function createWorkflow(
  slug: string,
  data: { name: string; triggerType: string; triggerConfig?: Record<string, any>; steps: StepInput[] }
) {
  const { install } = await getCurrentNicheInstall(slug);

  await prisma.workflow.create({
    data: {
      nicheInstallId: install.id,
      name: data.name,
      isActive: false,
      triggers: {
        create: [{ type: data.triggerType as any, config: data.triggerConfig ?? {} }],
      },
      steps: {
        create: data.steps.map((step, index) => ({
          order: index,
          type: step.type as any,
          config: step.config,
        })),
      },
    },
  });

  revalidatePath(`/niche/${slug}/workflows`);
}

export async function toggleWorkflowActive(slug: string, workflowId: string, isActive: boolean) {
  await getCurrentNicheInstall(slug);

  await prisma.workflow.update({
    where: { id: workflowId },
    data: { isActive },
  });

  revalidatePath(`/niche/${slug}/workflows`);
}

export async function deleteWorkflow(slug: string, workflowId: string) {
  await getCurrentNicheInstall(slug);

  await prisma.workflow.delete({ where: { id: workflowId } });

  revalidatePath(`/niche/${slug}/workflows`);
}