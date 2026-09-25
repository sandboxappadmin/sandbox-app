import { notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import BookingClient from './BookingClient';

export default async function BookingPage({ params }: { params: Promise<{ nicheInstallId: string }> }) {
  const { nicheInstallId } = await params;

  const install = await prisma.nicheInstall.findUnique({
    where: { id: nicheInstallId },
    select: { label: true },
  });

  if (!install) {
    notFound();
  }

  return <BookingClient nicheInstallId={nicheInstallId} workspaceLabel={install.label} />;
}