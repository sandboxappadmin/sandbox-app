import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isSuperAdmin } from '@/lib/super-admin';
import DesktopGrid from './DesktopGrid';

export default async function DesktopPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const admin = await isSuperAdmin();

  return <DesktopGrid isSuperAdmin={admin} />;
}