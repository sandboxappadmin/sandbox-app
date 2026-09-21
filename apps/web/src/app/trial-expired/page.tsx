import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { SignOutButton } from '@clerk/nextjs';

export default function TrialExpiredPage() {
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
          Your Free Trial Has Ended
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Subscribe to keep using your workspace. Contact support if you have questions.
        </Typography>
      </Box>

      <SignOutButton redirectUrl="/">
        <Button variant="outlined">Sign Out</Button>
      </SignOutButton>
    </Box>
  );
}