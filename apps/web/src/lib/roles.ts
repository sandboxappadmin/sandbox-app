import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@repo/database';

export async function getCurrentUserWithRole() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/desktop');

  return user;
}

// OWNER only — billing, team management
export async function assertOwner() {
  const user = await getCurrentUserWithRole();
  if (user.role !== 'OWNER') {
    redirect('/desktop');
  }
  return user;
}

// OWNER or ADMIN — account-level settings, not billing
export async function assertAdminOrOwner() {
  const user = await getCurrentUserWithRole();
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
    redirect('/desktop');
  }
  return user;
}