import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';

// Single chokepoint for "is this account allowed to use the app right now."
// redirect() works safely from both Server Components and Server Actions —
// call this anywhere a request resolves a real accountId, right after that
// lookup, before any data for that account is read or written.
export async function assertActiveAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { status: true },
  });

  if (!account || account.status !== 'ACTIVE') {
    redirect('/suspended');
  }
}