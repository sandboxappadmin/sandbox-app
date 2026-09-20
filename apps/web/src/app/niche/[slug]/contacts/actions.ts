'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { workflowQueue } from '@repo/queue';
import { getCurrentNicheInstall } from '@/lib/niche-server';

type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customFields?: Record<string, unknown>;
};

// Re-validates incoming custom field values against this niche's actual
// CustomFieldDefinition list. Never trust the client blob directly —
// a stale dialog (old defs cached client-side) or a tampered request
// could otherwise write arbitrary keys/types into the JSON column.
async function buildValidatedCustomFields(
  nicheInstallId: string,
  submitted: Record<string, unknown> | undefined
): Promise<Record<string, unknown>> {
  if (!submitted) return {};

  const defs = await prisma.customFieldDefinition.findMany({
    where: { nicheInstallId },
  });

  const validated: Record<string, unknown> = {};

  for (const def of defs) {
    if (!(def.key in submitted)) continue;
    const raw = submitted[def.key];

    if (raw === '' || raw === null || raw === undefined) {
      validated[def.key] = null;
      continue;
    }

    switch (def.type) {
      case 'TEXT':
        validated[def.key] = String(raw);
        break;
      case 'NUMBER': {
        const num = Number(raw);
        validated[def.key] = Number.isNaN(num) ? null : num;
        break;
      }
      case 'DATE': {
        const date = new Date(raw as string);
        validated[def.key] = Number.isNaN(date.getTime()) ? null : date.toISOString();
        break;
      }
      case 'BOOLEAN':
        validated[def.key] = Boolean(raw);
        break;
      case 'DROPDOWN': {
        const options = Array.isArray(def.options) ? (def.options as string[]) : [];
        validated[def.key] = options.includes(raw as string) ? raw : null;
        break;
      }
    }
  }

  return validated;
}

export async function createContact(slug: string, data: ContactFormData) {
  const { install } = await getCurrentNicheInstall(slug);

  const customFields = await buildValidatedCustomFields(install.id, data.customFields);

  const contact = await prisma.contact.create({
    data: {
      nicheInstallId: install.id,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      email: data.email || null,
      phone: data.phone || null,
      customFields,
    },
  });

  // Fire any active "Contact Created" workflows for this workspace
  const matchingWorkflows = await prisma.workflow.findMany({
    where: {
      nicheInstallId: install.id,
      isActive: true,
      triggers: { some: { type: 'CONTACT_CREATED' } },
    },
  });

  console.log(`[trigger] Found ${matchingWorkflows.length} matching workflow(s) for niche ${install.id}`);

  for (const workflow of matchingWorkflows) {
    console.log(`[trigger] Enqueueing workflow ${workflow.id} for contact ${contact.id}`);
    try {
      const job = await workflowQueue.add('run-workflow', {
        workflowId: workflow.id,
        contactId: contact.id,
        nicheInstallId: install.id,
      });
      console.log(`[trigger] Job enqueued successfully, job id: ${job.id}`);
    } catch (err) {
      console.error('[trigger] Failed to enqueue job:', err);
    }
  }

  revalidatePath(`/niche/${slug}/contacts`);
}

export async function updateContact(slug: string, contactId: string, data: ContactFormData) {
  const { install } = await getCurrentNicheInstall(slug);

  const customFields = await buildValidatedCustomFields(install.id, data.customFields);

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      email: data.email || null,
      phone: data.phone || null,
      customFields,
    },
  });

  revalidatePath(`/niche/${slug}/contacts`);
}

export async function deleteContact(slug: string, contactId: string) {
  await getCurrentNicheInstall(slug);

  try {
    await prisma.contact.delete({ where: { id: contactId } });
  } catch {
    throw new Error(
      'This contact has opportunities linked to them. Delete or reassign those first.'
    );
  }

  revalidatePath(`/niche/${slug}/contacts`);
}

export async function addTagToContact(slug: string, contactId: string, tagName: string) {
  const { install } = await getCurrentNicheInstall(slug);
  const trimmed = tagName.trim();
  if (!trimmed) return;

  const tag = await prisma.tag.upsert({
    where: { nicheInstallId_name: { nicheInstallId: install.id, name: trimmed } },
    update: {},
    create: { nicheInstallId: install.id, name: trimmed },
  });

  await prisma.contact.update({
    where: { id: contactId },
    data: { tags: { connect: { id: tag.id } } },
  });

  revalidatePath(`/niche/${slug}/contacts`);
}

export async function removeTagFromContact(slug: string, contactId: string, tagId: string) {
  await getCurrentNicheInstall(slug);

  await prisma.contact.update({
    where: { id: contactId },
    data: { tags: { disconnect: { id: tagId } } },
  });

  revalidatePath(`/niche/${slug}/contacts`);
}