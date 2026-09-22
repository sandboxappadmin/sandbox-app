'use client';

import { useState, useTransition } from 'react';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { triggerRenewalCheckNow } from './accounts/subscription-actions';

export default function RenewalCheckButton() {
  const [isPending, startTransition] = useTransition();
  const [triggered, setTriggered] = useState(false);

  const handleClick = () => {
    setTriggered(false);
    startTransition(async () => {
      await triggerRenewalCheckNow();
      setTriggered(true);
    });
  };

  return (
    <Stack spacing={1.5} sx={{ mb: 4 }}>
      <Button variant="outlined" onClick={handleClick} disabled={isPending} sx={{ alignSelf: 'flex-start' }}>
        {isPending ? 'Queuing check...' : 'Run Renewal Check Now'}
      </Button>
      {triggered && (
        <Alert severity="success" onClose={() => setTriggered(false)} sx={{ maxWidth: 480 }}>
          Queued. Check apps/api's logs in a few seconds for [renewal-check] output, and check the affected account's notification bell.
        </Alert>
      )}
    </Stack>
  );
}