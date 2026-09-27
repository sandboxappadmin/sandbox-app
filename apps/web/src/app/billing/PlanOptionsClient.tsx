'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import { startCheckout } from './actions';
import { PLAN_PRICE_PHP } from '@repo/paymongo';
import { startGhlUpgradeCheckout } from './ghl-actions';

export default function PlanOptionsClient({ hideSubscribeCard = false }: { hideSubscribeCard?: boolean }) {  const [ghlOpen, setGhlOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [notes, setNotes] = useState('');
  const [requested, setRequested] = useState(false);
  const [isPending, startTransition] = useTransition();

      const handleGhlRequest = () => {
    startTransition(() => {
            startGhlUpgradeCheckout(businessName, notes);
    });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Sandbox App
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            ₱{PLAN_PRICE_PHP}<Typography component="span" variant="body2" color="text.secondary">/month</Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your own niche-specific CRM workspace, automations, and support — self-service, ready in minutes.
          </Typography>
          <form action={startCheckout}>
            <Button type="submit" variant="contained" fullWidth>
              Subscribe Now
            </Button>
          </form>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            GHL Sub-Account
          </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            ₱799<Typography component="span" variant="body2" color="text.secondary">/month</Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Everything in Sandbox App, plus a GHL sub-account — set up for you, billed together.
          </Typography>
          <Button variant="outlined" fullWidth onClick={() => setGhlOpen(true)}>
            Request Setup
          </Button>
        </Paper>
      </Stack>

      <Dialog open={ghlOpen} onClose={() => setGhlOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Request GHL Sub-Account</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGhlOpen(false)}>{requested ? 'Close' : 'Cancel'}</Button>
          {!requested && (
            <Button variant="contained" onClick={handleGhlRequest} disabled={isPending || !businessName.trim()}>
              {isPending ? 'Sending...' : 'Send Request'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}