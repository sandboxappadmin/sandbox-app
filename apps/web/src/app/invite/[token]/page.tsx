import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@repo/database';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { SignUpButton } from '@clerk/nextjs';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { userId } = await auth();

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { account: { select: { name: true } } },
  });

  if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
    notFound();
  }

  // If someone is already signed into Clerk when they open this link, that
  // means the invited email already has a Clerk identity from somewhere —
  // signing up "again" here would just log them into their existing
  // account, not create the new membership this invite is meant to grant.
  if (userId) {
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
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          This invite can't be completed
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          You're currently signed in with an account that already exists. This invite is for{' '}
          <strong>{invitation.email}</strong>, and joining a team requires a brand new sign-up
          with that exact email. Please sign out first, then open this link again and sign up
          fresh with <strong>{invitation.email}</strong>.
        </Typography>
      </Box>
    );
  }

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
          You're invited!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Join {invitation.account.name} on Sandbox App as {invitation.role === 'ADMIN' ? 'an' : 'a'}{' '}
          {invitation.role}.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sign up using <strong>{invitation.email}</strong> to automatically join.
        </Typography>
      </Box>
      <SignUpButton mode="modal">
        <Button variant="contained" size="large">
          Sign Up to Accept
        </Button>
      </SignUpButton>
    </Box>
  );
}