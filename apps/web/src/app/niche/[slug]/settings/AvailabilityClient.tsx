'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { setAvailabilityRules } from './actions';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Rule = { dayOfWeek: number; startTime: string; endTime: string };

export default function AvailabilityClient({ slug, initialRules }: { slug: string; initialRules: Rule[] }) {
  const [enabled, setEnabled] = useState<Record<number, boolean>>(
    Object.fromEntries(DAYS.map((_, i) => [i, initialRules.some((r) => r.dayOfWeek === i)]))
  );
  const [times, setTimes] = useState<Record<number, { start: string; end: string }>>(
    Object.fromEntries(
      DAYS.map((_, i) => {
        const existing = initialRules.find((r) => r.dayOfWeek === i);
        return [i, { start: existing?.startTime ?? '09:00', end: existing?.endTime ?? '17:00' }];
      })
    )
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(false);
    const rules = DAYS.map((_, i) => ({ dayOfWeek: i, startTime: times[i].start, endTime: times[i].end }))
      .filter((_, i) => enabled[i]);

    startTransition(async () => {
      await setAvailabilityRules(slug, rules);
      setSaved(true);
    });
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        Booking Availability
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Set the hours when leads can book a showing through your public booking link.
      </Typography>

      <Stack spacing={1.5}>
        {DAYS.map((day, i) => (
                    <Stack
            key={day}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 2 }}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <FormControlLabel
              sx={{ width: { xs: 'auto', sm: 140 } }}
              control={
                <Checkbox
                  checked={enabled[i]}
                  onChange={(e) => setEnabled({ ...enabled, [i]: e.target.checked })}
                />
              }
              label={day}
            />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pl: { xs: 4, sm: 0 } }}>
              <TextField
                type="time"
                size="small"
                value={times[i].start}
                onChange={(e) => setTimes({ ...times, [i]: { ...times[i], start: e.target.value } })}
                disabled={!enabled[i]}
              />
              <Typography variant="body2">to</Typography>
              <TextField
                type="time"
                size="small"
                value={times[i].end}
                onChange={(e) => setTimes({ ...times, [i]: { ...times[i], end: e.target.value } })}
                disabled={!enabled[i]}
              />
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Button variant="contained" onClick={handleSave} disabled={isPending} sx={{ mt: 2 }}>
        {isPending ? 'Saving...' : 'Save Availability'}
      </Button>
      {saved && (
        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
          Saved.
        </Typography>
      )}
    </Box>
  );
}