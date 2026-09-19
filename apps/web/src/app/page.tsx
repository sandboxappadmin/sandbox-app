import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import HomeLanding from './HomeLanding';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/desktop');
  }

  return <HomeLanding />;
}