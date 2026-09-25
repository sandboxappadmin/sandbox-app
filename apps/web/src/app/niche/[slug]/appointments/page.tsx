import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';
import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  const appointments = await prisma.appointment.findMany({
    where: { nicheInstallId: install.id, status: 'CONFIRMED', startsAt: { gte: new Date() } },
    orderBy: { startsAt: 'asc' },
    include: { contact: { select: { firstName: true, lastName: true, email: true, phone: true } } },
  });

  const serialized = appointments.map((a) => ({
    id: a.id,
    startsAt: a.startsAt.toISOString(),
    contactName: `${a.contact.firstName ?? ''} ${a.contact.lastName ?? ''}`.trim() || a.contact.email || a.contact.phone || 'Unknown',
    contactEmail: a.contact.email,
    contactPhone: a.contact.phone,
  }));

  return <AppointmentsClient slug={slug} appointments={serialized} nicheInstallId={install.id} />;
}