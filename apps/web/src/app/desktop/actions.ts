'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { getNicheBySlug } from '@/lib/niches';

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

    // Check if this account already installed this niche
    let install = await prisma.nicheInstall.findFirst({
        where: { accountId: user.accountId, niche: niche.type },
    });

    // First time opening this niche - create the isolated workspace
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