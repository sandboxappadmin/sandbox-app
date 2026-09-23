'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { sendEmail } from '@repo/email';
import { sendSmsGateMessage } from '@repo/sms';
import { decryptSecret } from '@repo/crypto';
import { getCurrentNicheInstall } from '@/lib/niche-server';
import { getOrCreateConversation } from '@/lib/conversation-helpers';

export async function sendManualEmail(slug: string, contactId: string, subject: string, body: string) {
  const { install } = await getCurrentNicheInstall(slug);

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact || contact.nicheInstallId !== install.id) {
    throw new Error('Contact not found');
  }
  if (!contact.email) {
    throw new Error('This contact has no email address on file');
  }

  const verifiedDomain = await prisma.sendingDomain.findFirst({
    where: { accountId: install.accountId, status: 'VERIFIED' },
  });
  const fromAddress = verifiedDomain
    ? `Sandbox App <hello@${verifiedDomain.domain}>`
    : process.env.EMAIL_FROM_ADDRESS || 'Sandbox App <onboarding@resend.dev>';

  const result = await sendEmail({ from: fromAddress, to: contact.email, subject, text: body });

  const conversation = await getOrCreateConversation(contactId, install.id);
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      channel: 'EMAIL',
      direction: 'OUTBOUND',
      subject,
      body,
      status: result.ok ? 'SENT' : 'FAILED',
    },
  });

  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath(`/niche/${slug}/contacts/${contactId}`);
}

export async function sendManualSms(slug: string, contactId: string, body: string) {
  const { install } = await getCurrentNicheInstall(slug);

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact || contact.nicheInstallId !== install.id) {
    throw new Error('Contact not found');
  }
  if (!contact.phone) {
    throw new Error('This contact has no phone number on file');
  }

  const credential = await prisma.smsProviderCredential.findUnique({
    where: { accountId: install.accountId },
  });
  if (!credential) {
    throw new Error('Connect SMSGate in Account Settings before sending SMS');
  }

  const apiKey = decryptSecret(credential.encryptedApiKey);
  const result = await sendSmsGateMessage(apiKey, contact.phone, body);

  const conversation = await getOrCreateConversation(contactId, install.id);
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      channel: 'SMS',
      direction: 'OUTBOUND',
      body,
      status: result.ok ? 'SENT' : 'FAILED',
    },
  });

  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath(`/niche/${slug}/contacts/${contactId}`);
}