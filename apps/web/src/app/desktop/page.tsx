import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DesktopGrid from './DesktopGrid';

export default async function DesktopPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/');
    }

    return <DesktopGrid />;
}