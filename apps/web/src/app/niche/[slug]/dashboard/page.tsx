import { getCurrentNicheInstall } from '@/lib/niche-server';
import { prisma } from '@repo/database';
import DashboardClient from './DashboardClient';

export default async function NicheDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  const [pipeline, contactCount, activeWorkflowCount, upcomingAppointmentCount, recentContacts] =
    await Promise.all([
      prisma.pipeline.findFirst({
        where: { nicheInstallId: install.id },
        include: { stages: { include: { opportunities: true }, orderBy: { order: 'asc' } } },
      }),
      prisma.contact.count({ where: { nicheInstallId: install.id } }),
      prisma.workflow.count({ where: { nicheInstallId: install.id, isActive: true } }),
      prisma.appointment.count({
        where: { nicheInstallId: install.id, status: 'CONFIRMED', startsAt: { gte: new Date() } },
      }),
      prisma.contact.findMany({
        where: { nicheInstallId: install.id, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true },
      }),
    ]);

  const stages = (pipeline?.stages ?? []).map((s) => ({
    name: s.name,
    count: s.opportunities.length,
    value: s.opportunities.reduce((sum, o) => sum + (o.value ? Number(o.value) : 0), 0),
  }));

  const totalPipelineValue = stages.reduce((sum, s) => sum + s.value, 0);
  const totalOpenOpportunities = stages.reduce((sum, s) => sum + s.count, 0);

  // Bucket new contacts by day for the last 30 days
  const dayBuckets: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayBuckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const c of recentContacts) {
    const key = c.createdAt.toISOString().slice(0, 10);
    if (key in dayBuckets) dayBuckets[key]++;
  }

  return (
    <DashboardClient
      workspaceLabel={install.label}
      stages={stages}
      totalPipelineValue={totalPipelineValue}
      totalOpenOpportunities={totalOpenOpportunities}
      contactCount={contactCount}
      activeWorkflowCount={activeWorkflowCount}
      upcomingAppointmentCount={upcomingAppointmentCount}
      contactGrowth={Object.entries(dayBuckets).map(([date, count]) => ({ date, count }))}
    />
  );
}