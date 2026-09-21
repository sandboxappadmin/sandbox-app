'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@repo/database';
import { isSuperAdmin } from '@/lib/super-admin';

async function assertSuperAdmin() {
  if (!(await isSuperAdmin())) {
    throw new Error('Unauthorized');
  }
}

export async function suspendAccount(accountId: string) {
  await assertSuperAdmin();

  await prisma.account.update({
    where: { id: accountId },
    data: { status: 'SUSPENDED' },
  });

  revalidatePath('/admin/accounts');
}

export async function reactivateAccount(accountId: string) {
  await assertSuperAdmin();

  await prisma.account.update({
    where: { id: accountId },
    data: { status: 'ACTIVE' },
  });

  revalidatePath('/admin/accounts');
}

// Soft delete only — never a real prisma.account.delete(). A hard delete
// would cascade through every NicheInstall, Contact, Pipeline, Workflow,
// etc. underneath this tenant with no way back. Marking DELETED keeps the
// data recoverable and just needs the rest of the app (login, niche
// access) to treat this status as blocked, same as SUSPENDED.
export async function softDeleteAccount(accountId: string) {
  await assertSuperAdmin();

  await prisma.account.update({
    where: { id: accountId },
    data: { status: 'DELETED' },
  });

  revalidatePath('/admin/accounts');
}