import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import { getNicheBySlug } from '@/lib/niches';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default async function NicheDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/');

  const niche = getNicheBySlug(slug);
  if (!niche) notFound();

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/');

  const install = await prisma.nicheInstall.findFirst({
    where: { accountId: user.accountId, niche: niche.type },
  });

  if (!install) redirect('/desktop');

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">{install.label}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Workspace ID: {install.id}
      </Typography>
      <Typography variant="body1" sx={{ mt: 3 }}>
        This is a real, isolated workspace tied to your account. Contacts, pipelines, and
        workflows will render here next.
      </Typography>
    </Box>
  );
}