import { notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import LeadFormClient from './LeadFormClient';

export default async function LeadFormPage({ params }: { params: Promise<{ nicheInstallId: string }> }) {
  const { nicheInstallId } = await params;

  const install = await prisma.nicheInstall.findUnique({
    where: { id: nicheInstallId },
    select: { label: true },
  });

  if (!install) {
    notFound();
  }

  return <LeadFormClient nicheInstallId={nicheInstallId} workspaceLabel={install.label} />;
}