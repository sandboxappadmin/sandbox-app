import fs from 'fs/promises';
import path from 'path';
import { auth } from '@clerk/nextjs/server';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { SignInButton } from '@clerk/nextjs';
import { isSuperAdmin } from '@/lib/super-admin';
import DesktopHeader from '../desktop/DesktopHeader';

type ReleaseEntry = { date: string; items: string[] };

async function getReleaseNotes(): Promise<ReleaseEntry[]> {
  const filePath = path.join(process.cwd(), 'RELEASE_NOTES.md');
  const raw = await fs.readFile(filePath, 'utf-8');

  const sections = raw.split(/\n##\s+/).slice(1);

  return sections.map((section) => {
    const lines = section.split('\n');
    const date = lines[0].trim();
    const items = lines
      .filter((line) => line.trim().startsWith('- '))
      .map((line) => line.trim().slice(2));
    return { date, items };
  });
}

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

export default async function UpdatesPage() {
  const { userId } = await auth();
  const admin = userId ? await isSuperAdmin() : false;
  const entries = await getReleaseNotes();

  return (
    <>
      {userId ? <DesktopHeader isSuperAdmin={admin} showBackButton /> : <PublicNav />}

      <Box sx={{ maxWidth: 640, mx: 'auto', px: { xs: 3, md: 0 }, py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          What's New
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
          Updates and improvements to Sandbox App, as they ship.
        </Typography>

        <Stack spacing={5}>
          {entries.map((entry) => (
            <Box key={entry.date}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                {entry.date}
              </Typography>
              <Stack spacing={1}>
                {entry.items.map((item, i) => (
                  <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, flexShrink: 0 }} />
                    <Typography variant="body2">{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </>
  );
}