'use client';

import { useState } from 'react';
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';
import { SignInButton } from '@clerk/nextjs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], display: 'swap' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' });

const INK = '#14181F';
const PAPER = '#F6F5F1';
const SIGNAL = '#2F6F4F';
const SLATE = '#5B6472';

type NicheDemo = {
  label: string;
  color: string;
  stages: string[];
};

// Real default stage sets from the actual product config — this demo
// shows the real differentiator instead of describing it abstractly.
const NICHE_DEMOS: NicheDemo[] = [
  {
    label: 'Real Estate',
    color: '#B45B3C',
    stages: ['New Lead', 'Contacted', 'Showing Scheduled', 'Offer Made', 'Closed Won'],
  },
  {
    label: 'Coaches & Consultants',
    color: '#6B4A8A',
    stages: ['New Lead', 'Discovery Call Booked', 'Discovery Call Completed', 'Proposal Sent', 'Enrolled'],
  },
  {
    label: 'Dental & Med Spa',
    color: '#2E7D6B',
    stages: ['New Inquiry', 'Consultation Scheduled', 'Consultation Completed', 'Treatment Plan Sent', 'Booked'],
  },
  {
    label: 'E-commerce',
    color: '#B8862E',
    stages: ['New Lead', 'Quote Requested', 'Quote Sent', 'Negotiating', 'Won'],
  },
];

const ALL_NICHES = [
  'Real Estate',
  'Dental & Med Spa',
  'Coaches & Consultants',
  'E-commerce',
  'Marketing Agency',
  'Fitness & Gyms',
  'Home Services',
];

function DesktopMock() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = NICHE_DEMOS[activeIndex];

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        bgcolor: '#1B2029',
        width: '100%',
        maxWidth: 560,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 2,
          py: 1.25,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {['#E0645A', '#E0B054', '#5FB07A'].map((c) => (
          <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
        ))}
        <Typography
          className={body.className}
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.5)', ml: 1.5 }}
        >
          workspace — {active.label}
        </Typography>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {NICHE_DEMOS.map((n, i) => (
            <Chip
              key={n.label}
              label={n.label}
              onClick={() => setActiveIndex(i)}
              sx={{
                fontFamily: body.style.fontFamily,
                fontWeight: 500,
                fontSize: 13,
                bgcolor: i === activeIndex ? n.color : 'rgba(255,255,255,0.06)',
                color: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.65)',
                cursor: 'pointer',
                '&:hover': { bgcolor: i === activeIndex ? n.color : 'rgba(255,255,255,0.12)' },
              }}
            />
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: 'auto',
            pb: 1,
            transition: 'opacity 0.25s ease',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
          key={active.label}
        >
          {active.stages.map((stage, i) => (
            <Box
              key={stage}
              sx={{
                minWidth: 132,
                flexShrink: 0,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                p: 1.25,
              }}
            >
              <Typography
                className={body.className}
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5 }}
              >
                Stage {i + 1}
              </Typography>
              <Typography
                className={body.className}
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}
              >
                {stage}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default function HomeLanding() {
  return (
    <Box sx={{ bgcolor: PAPER, color: INK, minHeight: '100vh' }}>
      {/* Nav */}
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
        <Typography className={display.className} variant="h6" sx={{ fontWeight: 700 }}>
          Sandbox App
        </Typography>
        <SignInButton mode="modal">
          <Button
            variant="text"
            sx={{ color: INK, fontFamily: body.style.fontFamily, fontWeight: 500 }}
          >
            Log in
          </Button>
        </SignInButton>
      </Box>

      {/* Hero */}
      <Box
        sx={{
          maxWidth: 1160,
          mx: 'auto',
          px: { xs: 3, md: 5 },
          pt: { xs: 4, md: 8 },
          pb: { xs: 8, md: 12 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: { xs: 6, md: 8 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            className={display.className}
            sx={{
              fontWeight: 700,
              fontSize: { xs: 36, md: 52 },
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
              maxWidth: 520,
              mb: 3,
            }}
          >
            One workspace. A different tool for every business it's built for.
          </Typography>
          <Typography
            className={body.className}
            sx={{ fontSize: 18, color: SLATE, maxWidth: 460, mb: 4, lineHeight: 1.6 }}
          >
            Sandbox App gives real estate agents, coaches, dentists, and six other
            industries their own tailored CRM and automation engine — not a
            one-size-fits-all dashboard with your industry's name pasted on top.
          </Typography>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <SignInButton mode="modal">
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: SIGNAL,
                  fontFamily: body.style.fontFamily,
                  fontWeight: 600,
                  px: 3.5,
                  py: 1.25,
                  '&:hover': { bgcolor: '#25573F' },
                }}
              >
                Start your free trial
              </Button>
            </SignInButton>
            <Typography className={body.className} variant="body2" sx={{ color: SLATE }}>
              14 days free. No payment required to start.
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
          <DesktopMock />
        </Box>
      </Box>

      {/* Positioning statement */}
      <Box sx={{ bgcolor: INK, color: PAPER, py: { xs: 8, md: 11 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 3, md: 5 }, textAlign: 'center' }}>
          <Typography
            className={display.className}
            sx={{
              fontWeight: 500,
              fontSize: { xs: 24, md: 32 },
              lineHeight: 1.35,
            }}
          >
            Every marketing platform out there is racing to bolt on AI features.
            Meanwhile, the bugs their customers actually reported are still open,
            and the workflows still don't fit the business using them.
          </Typography>
          <Typography
            className={body.className}
            sx={{ mt: 3, color: 'rgba(246,245,241,0.6)', fontSize: 15 }}
          >
            We're building the opposite kind of tool.
          </Typography>
        </Box>
      </Box>

      {/* Niches grid */}
      <Box sx={{ maxWidth: 1160, mx: 'auto', px: { xs: 3, md: 5 }, py: { xs: 8, md: 11 } }}>
        <Typography
          className={display.className}
          sx={{ fontWeight: 700, fontSize: { xs: 26, md: 34 }, mb: 1.5, maxWidth: 560 }}
        >
          Seven industries. Seven genuinely different workspaces.
        </Typography>
        <Typography className={body.className} sx={{ color: SLATE, maxWidth: 560, mb: 5 }}>
          Pick your industry when you sign up, and your pipeline stages, default
          workflows, and terminology are already set up the way your business
          actually runs.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          {ALL_NICHES.map((n) => (
            <Box
              key={n}
              sx={{
                border: '1px solid rgba(20,24,31,0.12)',
                borderRadius: 1.5,
                p: 2,
                bgcolor: '#fff',
              }}
            >
              <Typography
                className={body.className}
                variant="body2"
                sx={{ fontWeight: 600 }}
              >
                {n}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* How it works */}
      <Box sx={{ maxWidth: 1160, mx: 'auto', px: { xs: 3, md: 5 }, py: { xs: 8, md: 11 } }}>
        <Typography
          className={display.className}
          sx={{ fontWeight: 700, fontSize: { xs: 26, md: 34 }, mb: 5, maxWidth: 560 }}
        >
          Set up once, the first time you sign in.
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 3 }}
          divider={
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                width: '1px',
                bgcolor: 'rgba(20,24,31,0.12)',
              }}
            />
          }
        >
          {[
            {
              n: '1',
              t: 'Create your account',
              d: 'Sign up and start your 14-day trial. No card, no commitment.',
            },
            {
              n: '2',
              t: 'Pick your industry',
              d: 'Choose from real estate, coaching, dental, e-commerce, and more.',
            },
            {
              n: '3',
              t: 'Your workspace is ready',
              d: 'Pipeline stages, workflows, and terminology already match your business.',
            },
          ].map((step) => (
            <Box key={step.n} sx={{ flex: 1 }}>
              <Typography
                className={display.className}
                sx={{ fontSize: 14, color: SIGNAL, fontWeight: 700, mb: 1 }}
              >
                {step.n}
              </Typography>
              <Typography className={body.className} sx={{ fontWeight: 600, mb: 0.75 }}>
                {step.t}
              </Typography>
              <Typography className={body.className} sx={{ color: SLATE, fontSize: 14 }}>
                {step.d}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Pricing */}
      <Box sx={{ bgcolor: '#EFEDE6', py: { xs: 8, md: 11 } }}>
        <Box sx={{ maxWidth: 480, mx: 'auto', px: { xs: 3, md: 0 } }}>
          <Box
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid rgba(20,24,31,0.12)',
              bgcolor: '#fff',
              boxShadow: '0 20px 45px rgba(20,24,31,0.08)',
            }}
          >
            <Box sx={{ px: 4, pt: 4, pb: 3 }}>
              <Typography className={body.className} sx={{ color: SLATE, fontWeight: 500, mb: 1 }}>
                One plan. Everything included.
              </Typography>
                            <Stack direction="row" spacing={0.5} sx={{ mb: 3, alignItems: 'baseline' }}>
                <Typography className={display.className} sx={{ fontSize: 44, fontWeight: 700 }}>
                  ₱299
                </Typography>
                <Typography className={body.className} sx={{ color: SLATE }}>
                  / month
                </Typography>
              </Stack>
              <Stack spacing={1.25} sx={{ mb: 4 }}>
                {[
                  'Every niche workspace, switch anytime',
                  'Unlimited contacts and pipelines',
                  'Automation engine — email and SMS',
                  'Your own sending domain',
                  '14-day free trial',
                ].map((f) => (
                                    <Stack key={f} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: SIGNAL, flexShrink: 0 }} />
                    <Typography className={body.className} variant="body2">
                      {f}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <SignInButton mode="modal">
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: SIGNAL,
                    fontFamily: body.style.fontFamily,
                    fontWeight: 600,
                    py: 1.25,
                    '&:hover': { bgcolor: '#25573F' },
                  }}
                >
                  Start your free trial
                </Button>
              </SignInButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Build in public note */}
      <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 3, md: 5 }, py: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Typography className={body.className} sx={{ color: SLATE, fontSize: 15, lineHeight: 1.7 }}>
          This product is being built and improved in the open, week by week.
          Every account gets a feedback board and a support line straight to the
          person building it — not a ticket queue that disappears into a
          support team.
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid rgba(20,24,31,0.1)', py: 4 }}>
        <Box
                    sx={{
            maxWidth: 1160,
            mx: 'auto',
            px: { xs: 3, md: 5 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography className={body.className} variant="body2" sx={{ color: SLATE }}>
            Sandbox App
          </Typography>
          <SignInButton mode="modal">
            <Button
              variant="text"
              size="small"
              sx={{ color: SLATE, fontFamily: body.style.fontFamily }}
            >
              Log in
            </Button>
          </SignInButton>
        </Box>
      </Box>
    </Box>
  );
}``