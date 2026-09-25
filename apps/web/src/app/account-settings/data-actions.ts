'use server';

import { prisma } from '@repo/database';
import { assertAdminOrOwner } from '@/lib/roles';

export async function exportAccountData() {
  const user = await assertAdminOrOwner();

  const account = await prisma.account.findUnique({
    where: { id: user.accountId },
    include: {
      users: { select: { name: true, email: true, role: true, createdAt: true } },
      nicheInstalls: {
        include: {
          contacts: {
            include: {
              tags: true,
              conversation: { include: { messages: true } },
            },
          },
          tags: true,
          pipelines: { include: { stages: { include: { opportunities: true } } } },
          workflows: { include: { triggers: true, steps: true } },
        },
      },
      tickets: { include: { messages: true } },
    },
  });

  const suggestions = await prisma.suggestion.findMany({
    where: { authorUserId: { in: (await prisma.user.findMany({ where: { accountId: user.accountId }, select: { id: true } })).map((u) => u.id) } },
  });

  return JSON.stringify({ exportedAt: new Date().toISOString(), account, suggestions }, null, 2);
}

export async function requestAccountDeletion(reason: string) {
  const user = await assertAdminOrOwner();

  const account = await prisma.account.findUnique({ where: { id: user.accountId } });

  await prisma.ticket.create({
    data: {
      subject: `[Data Deletion Request] ${account?.name}`,
      accountId: user.accountId,
      createdByUserId: user.id,
      messages: {
        create: {
          body: `This account has requested full data deletion under the Data Privacy Act.\n\nRequested by: ${user.name} (${user.email})\nReason given: ${reason || 'No reason provided'}\n\nPlease process this request and permanently delete this account's data once verified.`,
          authorUserId: user.id,
          isFromSupport: false,
        },
      },
    },
  });

  const adminEmails = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const admins = await prisma.user.findMany({ where: { email: { in: adminEmails } } });

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: 'TICKET_REPLY' as const,
      title: `Data deletion requested: ${account?.name}`,
      body: 'A customer has requested full account data deletion. Review in the admin ticket queue.',
      linkUrl: '/admin/tickets',
    })),
  });
}