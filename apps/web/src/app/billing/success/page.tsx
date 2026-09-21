'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function BillingSuccessPage() {
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
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Payment Received
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We're confirming your payment now — this usually takes just a few seconds.
          Your account will unlock automatically once confirmed.
        </Typography>
      </Box>
      <Button component={Link} href="/desktop" variant="contained">
        Go to Desktop
      </Button>
    </Box>
  );
}