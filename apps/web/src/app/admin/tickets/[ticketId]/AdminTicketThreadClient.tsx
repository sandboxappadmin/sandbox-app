'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { addSupportReply, updateTicketStatus } from '../actions';

type Message = {
  id: string;
  body: string;
  isFromSupport: boolean;
  authorName: string;
  createdAt: string;
};

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export default function AdminTicketThreadClient({
  ticket,
}: {
  ticket: { id: string; subject: string; status: string; accountName: string; messages: Message[] };
}) {
  const [reply, setReply] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleReply = () => {
    if (!reply.trim()) return;
    startTransition(async () => {
      await addSupportReply(ticket.id, reply);
      setReply('');
    });
  };

  const handleStatusChange = (status: string) => {
    startTransition(() => updateTicketStatus(ticket.id, status as any));
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {ticket.subject}
        </Typography>
        <Select
          size="small"
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              <Chip size="small" label={s} color={STATUS_COLORS[s]} />
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Account: {ticket.accountName}
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {ticket.messages.map((m) => (
          <Paper
            key={m.id}
            variant="outlined"
            sx={{
              p: 2,
              maxWidth: '80%',
              alignSelf: m.isFromSupport ? 'flex-end' : 'flex-start',
              bgcolor: m.isFromSupport ? 'primary.50' : 'background.paper',
            }}
          >
            <Typography variant="caption" color="text.disabled">
              {m.isFromSupport ? `${m.authorName} (You)` : m.authorName} ·{' '}
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
          placeholder="Reply as support..."
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