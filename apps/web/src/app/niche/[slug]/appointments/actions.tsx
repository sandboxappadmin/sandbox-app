'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';

export async function cancelAppointment(slug: string, appointmentId: string) {
  const { install } = await getCurrentNicheInstall(slug);

  await prisma.appointment.updateMany({
    where: { id: appointmentId, nicheInstallId: install.id },
    data: { status: 'CANCELED' },
  });

  revalidatePath(`/niche/${slug}/appointments`);
}