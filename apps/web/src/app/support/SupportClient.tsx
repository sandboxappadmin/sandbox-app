'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { createTicket } from './actions';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export default function SupportClient({ tickets }: { tickets: Ticket[] }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!subject.trim() || !message.trim()) return;
    startTransition(async () => {
      await createTicket(subject, message);
    });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Support
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          New Ticket
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Reach out for help with anything in your workspace.
      </Typography>

      {tickets.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <SupportAgentIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No support tickets yet.</Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {tickets.map((t) => (
          <Paper
            key={t.id}
            variant="outlined"
            component={Link}
            href={`/support/${t.id}`}
            sx={{
              p: 2.5,
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t.subject}
              </Typography>
              <Chip size="small" label={STATUS_LABELS[t.status]} color={STATUS_COLORS[t.status]} />
            </Box>
            <Typography variant="caption" color="text.disabled">
              {t.messageCount} message{t.messageCount === 1 ? '' : 's'} · Updated{' '}
              {new Date(t.updatedAt).toLocaleDateString()}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Support Ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth />
            <TextField
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={isPending}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}