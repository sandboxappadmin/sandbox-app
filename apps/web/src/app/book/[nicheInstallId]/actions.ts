'use server';

import { prisma } from '@repo/database';
import { workflowQueue } from '@repo/queue';
import { getAvailableSlots } from '@/lib/slots';

export async function fetchSlots(nicheInstallId: string) {
  const slots = await getAvailableSlots(nicheInstallId);
  return slots.map((s) => s.toISOString());
}

export async function bookAppointment(
  nicheInstallId: string,
  slotIso: string,
  data: { firstName: string; lastName: string; email: string; phone: string; honeypot: string }
) {
  if (data.honeypot) {
    return { ok: true };
  }

  const install = await prisma.nicheInstall.findUnique({ where: { id: nicheInstallId } });
  if (!install) {
    throw new Error('This booking page is no longer available.');
  }

  const startsAt = new Date(slotIso);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

  // Re-verify the slot is still free right now — the page's list of open
  // slots could be a few minutes stale if two people load it around the
  // same time.
  const conflict = await prisma.appointment.findFirst({
    where: { nicheInstallId, status: 'CONFIRMED', startsAt },
  });
  if (conflict) {
    throw new Error('Sorry, that time was just booked by someone else. Please pick another slot.');
  }

  if (!data.email.trim() && !data.phone.trim()) {
    throw new Error('Please provide an email or phone number.');
  }

  let contact = data.email.trim()
    ? await prisma.contact.findFirst({ where: { nicheInstallId, email: data.email.trim() } })
    : null;

  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        nicheInstallId,
        firstName: data.firstName.trim() || null,
        lastName: data.lastName.trim() || null,
        email: data.email.trim() || null,
        phone: data.phone.trim() || null,
      },
    });
  }

  await prisma.appointment.create({
    data: { nicheInstallId, contactId: contact.id, startsAt, endsAt },
  });

  const matchingWorkflows = await prisma.workflow.findMany({
    where: { nicheInstallId, isActive: true, triggers: { some: { type: 'APPOINTMENT_BOOKED' } } },
  });

  for (const workflow of matchingWorkflows) {
    await workflowQueue.add('run-workflow', { workflowId: workflow.id, contactId: contact.id, nicheInstallId });
  }

  return { ok: true };
}