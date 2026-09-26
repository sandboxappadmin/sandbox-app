'use server';

import { prisma } from '@repo/database';
import { assertOwner } from '@/lib/roles';

export async function requestGhlSubAccount(businessName: string, notes: string) {
  const user = await assertOwner();

  const account = await prisma.account.findUnique({ where: { id: user.accountId } });

  await prisma.ticket.create({
    data: {
      subject: `[GHL Sub-Account Request] ${account?.name}`,
      accountId: user.accountId,
      createdByUserId: user.id,
      messages: {
        create: {
          body: `This account has requested a GHL sub-account (₱799/month, billed separately).\n\nRequested by: ${user.name} (${user.email})\nBusiness name for GHL: ${businessName}\nAdditional notes: ${notes || 'None'}\n\nPlease reach out to set up billing and provision the sub-account.`,
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
      title: `GHL sub-account requested: ${account?.name}`,
      body: `${businessName} — review in the admin ticket queue.`,
      linkUrl: '/admin/tickets',
    })),
  });
}