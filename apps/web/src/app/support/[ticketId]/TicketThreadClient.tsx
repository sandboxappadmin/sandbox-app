'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { addCustomerReply } from '../actions';

type Message = {
  id: string;
  body: string;
  isFromSupport: boolean;
  authorName: string;
  createdAt: string;
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

export default function TicketThreadClient({
  ticket,
}: {
  ticket: { id: string; subject: string; status: string; messages: Message[] };
}) {
  const [reply, setReply] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleReply = () => {
    if (!reply.trim()) return;
    startTransition(async () => {
      await addCustomerReply(ticket.id, reply);
      setReply('');
    });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {ticket.subject}
        </Typography>
        <Chip label={STATUS_LABELS[ticket.status]} color={STATUS_COLORS[ticket.status]} />
      </Box>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {ticket.messages.map((m) => (
          <Paper
            key={m.id}
            variant="outlined"
            sx={{
              p: 2,
              maxWidth: '80%',
              alignSelf: m.isFromSupport ? 'flex-start' : 'flex-end',
              bgcolor: m.isFromSupport ? 'background.paper' : 'primary.50',
            }}
          >
            <Typography variant="caption" color="text.disabled">
              {m.isFromSupport ? `${m.authorName} (Support)` : m.authorName} ·{' '}
              {new Date(m.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
              {m.body}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <TextField
          placeholder="Type a reply..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          fullWidth
          multiline
          minRows={2}
        />
        <Button variant="contained" onClick={handleReply} disabled={!reply.trim() || isPending}>
          Send
        </Button>
      </Stack>
    </Box>
  );
}