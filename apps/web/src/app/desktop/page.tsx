import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { isSuperAdmin } from '@/lib/super-admin';
import { assertActiveAccount } from '@/lib/account-guard';
import DesktopGrid from './DesktopGrid';

export default async function DesktopPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (user) {
    await assertActiveAccount(user.accountId);
  }

  const admin = await isSuperAdmin();

  const installedNiches = user
    ? await prisma.nicheInstall.findMany({
        where: { accountId: user.accountId },
        select: { niche: true, id: true, label: true },
      })
    : [];

  return (
    <DesktopGrid
      isSuperAdmin={admin}
      isOwner={user?.role === 'OWNER'}
      canManageAccount={user?.role === 'OWNER' || user?.role === 'ADMIN'}
      installedNiches={installedNiches}
    />
  );
}