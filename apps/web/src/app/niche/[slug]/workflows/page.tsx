import { getCurrentNicheInstall } from '@/lib/niche-server';
import { prisma } from '@repo/database';
import WorkflowsClient from './WorkflowsClient';

export default async function WorkflowsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  const workflows = await prisma.workflow.findMany({
    where: { nicheInstallId: install.id },
    include: { triggers: true, steps: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = workflows.map((w) => ({
    id: w.id,
    name: w.name,
    isActive: w.isActive,
    triggerType: w.triggers[0]?.type ?? null,
    steps: w.steps.map((s) => ({ type: s.type, config: s.config as Record<string, any> })),
  }));

  return <WorkflowsClient slug={slug} initialWorkflows={serialized} />;
}