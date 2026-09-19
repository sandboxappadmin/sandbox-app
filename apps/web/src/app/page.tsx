'use client';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
      <Typography variant="h3">Sandbox App</Typography>
      <Typography variant="subtitle1" color="text.secondary">Digital Marketing Operating System</Typography>
      <Button variant="contained" size="large">Login</Button>
    </Box>
  );
}