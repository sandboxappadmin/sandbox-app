import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import AccountSettingsClient from './AccountSettingsClient';

export default async function AccountSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/desktop');

  const domains = await prisma.sendingDomain.findMany({
    where: { accountId: user.accountId },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = domains.map((d) => ({
    id: d.id,
    domain: d.domain,
    status: d.status,
    records: d.records as any[],
  }));

  return <AccountSettingsClient domains={serialized} />;
}