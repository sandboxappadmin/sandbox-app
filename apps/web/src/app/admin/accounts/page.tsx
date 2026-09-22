import { prisma } from '@repo/database';
import AccountsClient from './AccountsClient';

export default async function AdminAccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      users: true,
      nicheInstalls: true,
      subscription: true,
    },
  });

    const rows = accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    status: acc.status,
    subscriptionStatus: acc.subscription?.status ?? 'NONE',
    trialEndsAt: acc.subscription?.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd: acc.subscription?.currentPeriodEnd?.toISOString() ?? null,
    ownerEmail: acc.users.find((u) => u.role === 'OWNER')?.email ?? acc.users[0]?.email ?? '—',
    userCount: acc.users.length,
    niches: acc.nicheInstalls.map((n) => n.label).join(', ') || '—',
    createdAt: acc.createdAt.toISOString(),
  }));

  return <AccountsClient rows={rows} />;
}