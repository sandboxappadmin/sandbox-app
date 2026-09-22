import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { SignOutButton } from '@clerk/nextjs';
import { startCheckout } from '../billing/actions';
import { PLAN_PRICE_PHP } from '@repo/paymongo';

export default async function TrialExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const isRenewal = reason === 'renewal';

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
          {isRenewal ? 'Your Subscription Period Has Ended' : 'Your Free Trial Has Ended'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isRenewal
            ? `Renew for ₱${PLAN_PRICE_PHP}/month to keep using your workspace.`
            : `Subscribe for ₱${PLAN_PRICE_PHP}/month to keep using your workspace.`}
        </Typography>
      </Box>

      <form action={startCheckout}>
        <Button type="submit" variant="contained" size="large">
          {isRenewal ? 'Renew Now' : 'Subscribe Now'}
        </Button>
      </form>

      <SignOutButton redirectUrl="/">
        <Button variant="outlined">Sign Out</Button>
      </SignOutButton>
    </Box>
  );
}