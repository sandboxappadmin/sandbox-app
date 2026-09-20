import { prisma } from '@repo/database';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

export default async function AdminOverviewPage() {
  const [accountCount, userCount, nicheInstallCount, contactCount, workflowCount] =
    await Promise.all([
      prisma.account.count(),
      prisma.user.count(),
      prisma.nicheInstall.count(),
      prisma.contact.count(),
      prisma.workflow.count(),
    ]);

  const nicheBreakdown = await prisma.nicheInstall.groupBy({
    by: ['niche'],
    _count: { _all: true },
  });

  const stats = [
    { label: 'Total Accounts', value: accountCount },
    { label: 'Total Users', value: userCount },
    { label: 'Niche Workspaces', value: nicheInstallCount },
    { label: 'Total Contacts', value: contactCount },
    { label: 'Total Workflows', value: workflowCount },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Platform Overview
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Paper variant="outlined" sx={{ p: 2.5, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        Niche Workspace Breakdown
      </Typography>
      <Paper variant="outlined">
        {nicheBreakdown.map((row, i) => (
          <Box
            key={row.niche}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              px: 2.5,
              py: 1.5,
              borderTop: i > 0 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2">{row.niche}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row._count._all}
            </Typography>
          </Box>
        ))}
        {nicheBreakdown.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ p: 2.5 }}>
            No niche workspaces created yet.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}