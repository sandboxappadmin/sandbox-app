import { auth, currentUser } from '@clerk/nextjs/server';

export async function isSuperAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!email) return false;

    const allowList = (process.env.SUPER_ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    return allowList.includes(email);
  } catch (err) {
    // Never let a failed admin check take down the whole Desktop page —
    // worst case, the shield icon just doesn't show up this one time.
    console.error('[super-admin] Failed to check admin status:', err);
    return false;
  }
}