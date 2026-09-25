'use client';

import { useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

type Appointment = {
  id: string;
  startsAt: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
};

export default function AppointmentsClient({
  slug,
  appointments,
  nicheInstallId,
}: {
  slug: string;
  appointments: Appointment[];
  nicheInstallId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this appointment?')) return;
    const { cancelAppointment } = await import('./actions');
    startTransition(() => cancelAppointment(slug, id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Appointments
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${nicheInstallId}`)}
        >
          Copy Booking Link
        </Button>
      </Box>

      {appointments.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No upcoming appointments.</Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {appointments.map((a) => (
          <Paper key={a.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {new Date(a.startsAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {a.contactName} · {a.contactEmail ?? a.contactPhone ?? ''}
              </Typography>
            </Box>
            <Button size="small" color="error" onClick={() => handleCancel(a.id)} disabled={isPending}>
              Cancel
            </Button>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}