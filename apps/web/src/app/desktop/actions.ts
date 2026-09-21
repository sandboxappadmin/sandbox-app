'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { getNicheBySlug } from '@/lib/niches';
import { assertActiveAccount } from '@/lib/account-guard';

export async function openNiche(slug: string) {
    const { userId } = await auth();
    if (!userId) {
        redirect('/');
    }

    const niche = getNicheBySlug(slug);
    if (!niche) {
        throw new Error(`Unknown niche: ${slug}`);
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
        throw new Error('No database user found for this Clerk account yet.');
    }

    await assertActiveAccount(user.accountId);

    let install = await prisma.nicheInstall.findFirst({
        where: { accountId: user.accountId, niche: niche.type },
    });

    if (!install) {
        install = await prisma.nicheInstall.create({
            data: {
                accountId: user.accountId,
                niche: niche.type,
                label: niche.label,
            },
        });
    }

    redirect(`/niche/${slug}/dashboard`);
}