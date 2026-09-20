import { prisma } from '@repo/database';

export async function getOrCreatePipeline(nicheInstallId: string, defaultStages: readonly string[]) {
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
          create: defaultStages.map((name, index) => ({ name, order: index })),
        },
      },
      include,
    });
  }

  return pipeline;
}