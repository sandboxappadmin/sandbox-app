'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { submitLead } from './actions';

export default function LeadFormClient({
  nicheInstallId,
  workspaceLabel,
}: {
  nicheInstallId: string;
  workspaceLabel: string;
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    honeypot: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await submitLead(nicheInstallId, form);
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    });
  };

  if (submitted) {
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
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Thank you!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your information has been received. Someone will be in touch soon.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Get in touch
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {workspaceLabel}
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              fullWidth
            />
          </Stack>
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            fullWidth
          />
          <TextField
            label="Message (optional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            fullWidth
            multiline
            minRows={3}
          />

          {/* Honeypot — hidden from real visitors via CSS, never shown, never intentionally filled */}
          <TextField
            label="Leave this field empty"
            value={form.honeypot}
            onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
            sx={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
            tabIndex={-1}
            autoComplete="off"
          />

          <Button variant="contained" size="large" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}