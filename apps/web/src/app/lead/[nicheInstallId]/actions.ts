'use server';

import { prisma } from '@repo/database';
import { workflowQueue } from '@repo/queue';

export async function submitLead(
  nicheInstallId: string,
  data: { firstName: string; lastName: string; email: string; phone: string; message: string; honeypot: string }
) {
  // Honeypot: real visitors never see or fill this field. Any bot that
  // blindly fills every input on the page will trip it.
  if (data.honeypot) {
    return { ok: true }; // pretend success, don't tip off the bot
  }

  const install = await prisma.nicheInstall.findUnique({ where: { id: nicheInstallId } });
  if (!install) {
    throw new Error('This form is no longer available.');
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.contact.count({
    where: { nicheInstallId, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= 30) {
    throw new Error('This form is receiving too many submissions right now. Please try again later.');
  }

  if (!data.firstName.trim() && !data.email.trim() && !data.phone.trim()) {
    throw new Error('Please provide at least a name, email, or phone number.');
  }

  const contact = await prisma.contact.create({
    data: {
      nicheInstallId,
      firstName: data.firstName.trim() || null,
      lastName: data.lastName.trim() || null,
      email: data.email.trim() || null,
      phone: data.phone.trim() || null,
      customFields: data.message.trim() ? { _leadMessage: data.message.trim() } : {},
    },
  });

  const matchingWorkflows = await prisma.workflow.findMany({
    where: {
      nicheInstallId,
      isActive: true,
      triggers: { some: { type: 'FORM_SUBMITTED' } },
    },
  });

  for (const workflow of matchingWorkflows) {
    await workflowQueue.add('run-workflow', {
      workflowId: workflow.id,
      contactId: contact.id,
      nicheInstallId,
    });
  }

  return { ok: true };
}