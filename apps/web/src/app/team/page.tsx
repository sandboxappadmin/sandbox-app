import { prisma } from '@repo/database';
import { assertOwner } from '@/lib/roles';
import { isSuperAdmin } from '@/lib/super-admin';
import DesktopHeader from '../desktop/DesktopHeader';
import TeamClient from './TeamClient';

export default async function TeamPage() {
  const owner = await assertOwner();
  const admin = await isSuperAdmin();

  const [members, invitations] = await Promise.all([
    prisma.user.findMany({
      where: { accountId: owner.accountId },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.invitation.findMany({
      where: { accountId: owner.accountId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <>
            <DesktopHeader isSuperAdmin={admin} showBackButton isOwner />
      <TeamClient
        currentUserId={owner.id}
        members={members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
        }))}
        invitations={invitations.map((i) => ({
          id: i.id,
          email: i.email,
          role: i.role,
          expiresAt: i.expiresAt.toISOString(),
        }))}
      />
    </>
  );
}