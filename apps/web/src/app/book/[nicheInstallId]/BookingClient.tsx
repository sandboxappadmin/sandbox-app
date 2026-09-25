'use client';

import { useState, useEffect, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { fetchSlots, bookAppointment } from './actions';

export default function BookingClient({
  nicheInstallId,
  workspaceLabel,
}: {
  nicheInstallId: string;
  workspaceLabel: string;
}) {
  const [slots, setSlots] = useState<string[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', honeypot: '' });
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchSlots(nicheInstallId).then(setSlots);
  }, [nicheInstallId]);

  const slotsByDay = (slots ?? []).reduce<Record<string, string[]>>((acc, iso) => {
    const dayKey = new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    acc[dayKey] = acc[dayKey] ?? [];
    acc[dayKey].push(iso);
    return acc;
  }, {});

  const handleBook = () => {
    if (!selectedSlot) return;
    setError(null);
    startTransition(async () => {
      try {
        await bookAppointment(nicheInstallId, selectedSlot, form);
        setBooked(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        setSelectedSlot(null);
        fetchSlots(nicheInstallId).then(setSlots); // refresh in case the slot was just taken
      }
    });
  };

  if (booked) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', p: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            You're booked!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedSlot && new Date(selectedSlot).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', p: 3, py: { xs: 4, md: 6 } }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Book a Showing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {workspaceLabel}
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {slots === null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : slots.length === 0 ? (
        <Alert severity="info">No available times right now. Please check back later.</Alert>
      ) : !selectedSlot ? (
        <Stack spacing={2.5}>
          {Object.entries(slotsByDay).map(([day, times]) => (
            <Box key={day}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {day}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {times.map((iso) => (
                  <Chip
                    key={iso}
                    label={new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    onClick={() => setSelectedSlot(iso)}
                    clickable
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Alert severity="info" onClose={() => setSelectedSlot(null)}>
            {new Date(selectedSlot).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
          </Alert>
          <Stack direction="row" spacing={2}>
            <TextField label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} fullWidth />
            <TextField label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} fullWidth />
          </Stack>
          <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
          <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
          <TextField
            label="Leave this field empty"
            value={form.honeypot}
            onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
            sx={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
            tabIndex={-1}
            autoComplete="off"
          />
          <Button variant="contained" size="large" onClick={handleBook} disabled={isPending}>
            {isPending ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </Stack>
      )}
    </Box>
  );
}