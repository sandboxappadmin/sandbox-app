import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { assertActiveAccount } from '@/lib/account-guard';
import { isSuperAdmin } from '@/lib/super-admin';
import DesktopHeader from '../desktop/DesktopHeader';
import AccountSettingsClient from './AccountSettingsClient';

export default async function AccountSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/desktop');

  await assertActiveAccount(user.accountId);

    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
    redirect('/desktop');
  }

  const admin = await isSuperAdmin();

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

  const smsCredential = await prisma.smsProviderCredential.findUnique({
    where: { accountId: user.accountId },
    select: { id: true },
  });

    const subscription = await prisma.subscription.findUnique({
    where: { accountId: user.accountId },
    select: { status: true, trialEndsAt: true, currentPeriodEnd: true },
  });

    return (
    <>
      <DesktopHeader isSuperAdmin={admin} showBackButton isOwner={user?.role === 'OWNER'} canManageAccount={user?.role === 'OWNER' || user?.role === 'ADMIN'} />
      <AccountSettingsClient
        domains={serialized}
        smsConnected={Boolean(smsCredential)}
        subscription={
          subscription
            ? {
                status: subscription.status,
                trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
                currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
              }
            : null
        }
      />
    </>
  );
}