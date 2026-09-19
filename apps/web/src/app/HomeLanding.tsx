'use client';

import { SignInButton } from '@clerk/nextjs';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function HomeLanding() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h3">Sandbox App</Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Digital Marketing Operating System
      </Typography>
      <SignInButton mode="modal">
        <Button variant="contained" size="large">
          Login
        </Button>
      </SignInButton>
    </Box>
  );
}