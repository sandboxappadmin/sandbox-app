import { prisma } from '@repo/database';

export async function getOrCreateConversation(contactId: string, nicheInstallId: string) {
  return prisma.conversation.upsert({
    where: { contactId },
    update: {},
    create: { contactId, nicheInstallId },
  });
}