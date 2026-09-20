import { getCurrentNicheInstall } from '@/lib/niche-server';
import { getOrCreatePipeline } from '@/lib/pipeline-server';
import { prisma } from '@repo/database';
import PipelineBoard from './PipelineBoardLoader';

export default async function PipelinesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  const { getNicheBySlug } = await import('@/lib/niches');
  const nicheConfig = getNicheBySlug(slug);
  const pipeline = await getOrCreatePipeline(install.id, nicheConfig?.defaultStages ?? []);
  
  const contacts = await prisma.contact.findMany({
    where: { nicheInstallId: install.id },
    orderBy: { createdAt: 'desc' },
  });

    const stages = pipeline.stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    order: stage.order,
    opportunities: stage.opportunities.map((opp) => ({
      id: opp.id,
      name: opp.name,
      value: opp.value ? Number(opp.value) : null,
      contactId: opp.contactId,
      contactName:
        opp.contact ? `${opp.contact.firstName ?? ''} ${opp.contact.lastName ?? ''}`.trim() : '—',
    })),
  }));

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email || 'Unnamed',
  }));

  return (
    <PipelineBoard
      slug={slug}
      pipelineName={pipeline.name}
      stages={stages}
      contacts={contactOptions}
    />
  );
}