import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { SignOutButton } from '@clerk/nextjs';

export default function SuspendedPage() {
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
          Account Unavailable
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This account is currently suspended. Contact support if you believe this is a mistake.
        </Typography>
      </Box>

      <SignOutButton redirectUrl="/">
        <Button variant="outlined">Sign Out</Button>
      </SignOutButton>
    </Box>
  );
}