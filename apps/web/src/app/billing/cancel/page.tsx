'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 4,
        gap: 3,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Checkout Canceled
      </Typography>
      <Button component={Link} href="/trial-expired" variant="contained">
        Try Again
      </Button>
    </Box>
  );
}