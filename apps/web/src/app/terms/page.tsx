import { auth } from '@clerk/nextjs/server';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { SignInButton } from '@clerk/nextjs';
import { isSuperAdmin } from '@/lib/super-admin';
import DesktopHeader from '../desktop/DesktopHeader';
import { prisma } from '@repo/database';

function PublicNav() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1160,
        mx: 'auto',
        px: { xs: 3, md: 5 },
        py: 3,
      }}
    >
      <Typography variant="h6" component={Link} href="/" sx={{ fontWeight: 700, textDecoration: 'none', color: 'inherit' }}>
        Sandbox App
      </Typography>
      <SignInButton mode="modal">
        <Button variant="text">Log in</Button>
      </SignInButton>
    </Box>
  );
}

export default async function TermsPage() {
    const { userId } = await auth();
  const admin = userId ? await isSuperAdmin() : false;
  const user = userId ? await prisma.user.findUnique({ where: { clerkId: userId } }) : null;

  return (
    <>
            {userId ? <DesktopHeader isSuperAdmin={admin} showBackButton isOwner={user?.role === 'OWNER'} /> : <PublicNav />}

      <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 3, md: 0 }, py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Terms of Service
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
          Last updated: September 22, 2026
        </Typography>

        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              By creating an account or using Sandbox App ("we," "us," "the Service"), you agree
              to these Terms of Service. If you do not agree, please do not use the Service.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              2. Description of Service
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              Sandbox App is a digital marketing operating system providing industry-specific
              CRM workspaces, pipeline management, and automation tools, including the ability
              to send email and SMS messages to contacts you add to the platform.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              3. Accounts
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity under your account. You must provide accurate information when
              creating an account.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              4. Subscriptions, Trials, and Billing
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 1.5 }}>
              New accounts receive a 14-day free trial. After the trial ends, continued use of the
              Service requires a paid subscription (currently ₱299/month, subject to change with
              notice). Payments are processed by PayMongo; we do not store your payment card or
              e-wallet credentials.
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 1.5 }}>
              Subscriptions do not renew automatically. You are responsible for renewing your
              subscription before your current period ends to avoid interruption of access.
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              All payments are final. We do not offer refunds except at our sole discretion on a
              case-by-case basis.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              5. Acceptable Use
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              You agree not to use the Service to send unsolicited, harassing, fraudulent, or
              illegal messages via email or SMS. You are solely responsible for ensuring you have
              lawful permission to contact the individuals in your workspace, and for complying
              with applicable laws regarding electronic communications, including the Philippines'
              Data Privacy Act of 2012. We reserve the right to suspend or terminate accounts used
              for spam, abuse, or illegal activity.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              6. Your Data
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              You retain ownership of the contact and business data you enter into the Service.
              See our Privacy Policy for details on how we handle and protect this data.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              7. Suspension and Termination
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              We may suspend or terminate your account for violation of these Terms, non-payment,
              or suspected abuse of the Service. You may stop using the Service at any time.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              8. Disclaimer and Limitation of Liability
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              The Service is provided "as is" without warranties of any kind. To the maximum
              extent permitted by law, we are not liable for any indirect, incidental, or
              consequential damages arising from your use of the Service.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              9. Changes to These Terms
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              We may update these Terms from time to time. Continued use of the Service after
              changes take effect constitutes acceptance of the updated Terms.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              10. Governing Law
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              These Terms are governed by the laws of the Republic of the Philippines.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              11. Contact
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              Questions about these Terms can be sent to sandboxapp.admin@gmail.com.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </>
  );
}