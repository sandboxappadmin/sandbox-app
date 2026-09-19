import { prisma } from '@repo/database';

const DEFAULT_STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

export async function getOrCreatePipeline(nicheInstallId: string) {
  const include = {
    stages: {
      orderBy: { order: 'asc' as const },
      include: {
        opportunities: {
          include: { contact: true },
          orderBy: { createdAt: 'desc' as const },
        },
      },
    },
  };

  let pipeline = await prisma.pipeline.findFirst({
    where: { nicheInstallId },
    include,
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        nicheInstallId,
        name: 'Sales Pipeline',
        stages: {
          create: DEFAULT_STAGES.map((name, index) => ({ name, order: index })),
        },
      },
      include,
    });
  }

  return pipeline;
}