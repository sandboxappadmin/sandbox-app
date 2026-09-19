'use client';

import { SignInButton, Show, UserButton } from '@clerk/nextjs';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
      <Typography variant="h3">Sandbox App</Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Digital Marketing Operating System
      </Typography>

      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="contained" size="large">
            Login
          </Button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <Button component={Link} href="/desktop" variant="contained" size="large">
          Go to Desktop
        </Button>
        <UserButton />
      </Show>
    </Box>
  );
}