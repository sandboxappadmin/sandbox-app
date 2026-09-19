import { getCurrentNicheInstall } from '@/lib/niche-server';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default async function NicheDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        {install.label}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Overview for this workspace will go here.
      </Typography>
    </Box>
  );
}