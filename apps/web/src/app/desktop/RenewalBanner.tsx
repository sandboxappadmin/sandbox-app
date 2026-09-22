'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { getRenewalStatus } from './renewal-status-actions';

export default function RenewalBanner() {
  const router = useRouter();
  const [status, setStatus] = useState<{ daysLeft: number; isTrialEnding: boolean; dateString: string } | null>(null);
  const [dismissed, setDismissed] = useState(true); // start hidden until we know

  useEffect(() => {
    getRenewalStatus().then((result) => {
      if (!result) return;
      const key = `renewal-banner-dismissed-${result.dateString}`;
      const wasDismissed = sessionStorage.getItem(key) === 'true';
      setStatus(result);
      setDismissed(wasDismissed);
    });
  }, []);

  const handleDismiss = () => {
    if (status) {
      sessionStorage.setItem(`renewal-banner-dismissed-${status.dateString}`, 'true');
    }
    setDismissed(true);
  };

  if (!status) return null;

  const label =
    status.daysLeft <= 0
      ? status.isTrialEnding
        ? 'Your free trial ends today.'
        : 'Your subscription ends today.'
      : status.isTrialEnding
        ? `Your free trial ends in ${status.daysLeft} day${status.daysLeft === 1 ? '' : 's'}, on ${status.dateString}.`
        : `Your subscription renews in ${status.daysLeft} day${status.daysLeft === 1 ? '' : 's'}, on ${status.dateString}.`;

  return (
    <Collapse in={!dismissed}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: '#FFF4E5',
          borderBottom: '1px solid',
          borderColor: 'warning.light',
          px: 2,
          py: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: '#663C00' }}>
          {label}
        </Typography>
                <Button
          size="small"
          variant="outlined"
          color="warning"
          onClick={() => router.push('/account-settings')}
        >
          {status.isTrialEnding ? 'Subscribe Now' : 'Manage Billing'}
        </Button>
        <IconButton size="small" onClick={handleDismiss}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Collapse>
  );
}