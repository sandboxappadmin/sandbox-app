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

export default async function PrivacyPage() {
    const { userId } = await auth();
  const admin = userId ? await isSuperAdmin() : false;
  const user = userId ? await prisma.user.findUnique({ where: { clerkId: userId } }) : null;

  return (
    <>
            {userId ? <DesktopHeader isSuperAdmin={admin} showBackButton isOwner={user?.role === 'OWNER'} /> : <PublicNav />}

      <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 3, md: 0 }, py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
          Last updated: September 22, 2026
        </Typography>

        <Stack spacing={4}>
          <Box>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              Sandbox App ("we," "us") is committed to protecting your personal data in
              accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its
              Implementing Rules and Regulations, as enforced by the National Privacy Commission
              (NPC) of the Philippines.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              1. Information We Collect
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 1 }}>
              <strong>Account information:</strong> name and email address, collected via our
              authentication provider, Clerk, when you sign up.
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 1 }}>
              <strong>Business/CRM data:</strong> contact names, emails, phone numbers, and other
              details you choose to enter about your own customers or leads while using the
              Service.
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              <strong>Payment information:</strong> processed directly by PayMongo, our payment
              processor. We do not receive or store your card or e-wallet credentials — we only
              receive confirmation that a payment succeeded.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              2. How We Use Your Information
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              We use collected information to provide and maintain the Service, process payments,
              send transactional communications (such as workflow emails/SMS you configure,
              billing notices, and support responses), and improve the product.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              3. Third-Party Service Providers
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 1 }}>
              We share limited data with the following providers, solely to operate the Service:
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>• Clerk — authentication</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>• Neon — database hosting</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>• Render — application hosting</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>• Resend — transactional email delivery</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>• PayMongo — payment processing</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 1 }}>
              • SMSGate — SMS delivery, sent via a phone number and SIM card you or we connect to
              your account
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              We do not sell your personal data to third parties.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              4. Data Security
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              We take reasonable technical measures to protect your data, including encrypting
              sensitive credentials (such as connected SMS provider API keys) at rest, and
              restricting administrative access to authorized personnel only.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              5. Data Retention
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              We retain your account and business data for as long as your account remains active,
              or as needed to comply with legal obligations. You may request deletion of your data
              by contacting us.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              6. Your Rights Under the Data Privacy Act
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 1 }}>
              As a data subject under Philippine law, you have the right to:
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>• Be informed of how your data is processed</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>• Access your personal data</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>• Correct inaccurate data</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>• Object to processing</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 1 }}>• Request erasure or blocking of your data, subject to legal exceptions</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              To exercise any of these rights, contact us at sandboxapp.admin@gmail.com.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              7. Cookies
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              We use essential cookies required for authentication (via Clerk) to keep you logged
              in. We do not use third-party advertising or tracking cookies.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              8. Children's Privacy
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              The Service is not directed at individuals under 18, and we do not knowingly collect
              data from minors.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              9. Changes to This Policy
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              We may update this Privacy Policy from time to time. Material changes will be
              communicated via the Service or by email.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              10. Contact
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              For privacy questions or requests, contact us at sandboxapp.admin@gmail.com.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </>
  );
}