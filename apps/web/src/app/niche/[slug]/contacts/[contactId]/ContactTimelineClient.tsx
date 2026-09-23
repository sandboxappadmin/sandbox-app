'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { sendManualEmail, sendManualSms } from './actions';

type Message = {
  id: string;
  channel: string;
  direction: string;
  subject: string | null;
  body: string;
  status: string;
  createdAt: string;
};

type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  tags: { id: string; name: string }[];
  messages: Message[];
};

export default function ContactTimelineClient({ slug, contact }: { slug: string; contact: Contact }) {
  const router = useRouter();
  const [channel, setChannel] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const name = `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || 'Unnamed Contact';

  const handleSend = () => {
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        if (channel === 'EMAIL') {
          await sendManualEmail(slug, contact.id, subject, body);
        } else {
          await sendManualSms(slug, contact.id, body);
        }
        setSubject('');
        setBody('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send');
      }
    });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 4 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <IconButton size="small" onClick={() => router.push(`/niche/${slug}/contacts`)}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
        {contact.tags.map((t) => (
          <Chip key={t.id} size="small" label={t.name} />
        ))}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {contact.email ?? 'No email'} · {contact.phone ?? 'No phone'}
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {contact.messages.length === 0 && (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.disabled">
              No messages yet.
            </Typography>
          </Paper>
        )}
        {contact.messages.map((m) => (
          <Paper
            key={m.id}
            variant="outlined"
            sx={{
              p: 2,
              maxWidth: '85%',
              alignSelf: m.direction === 'OUTBOUND' ? 'flex-end' : 'flex-start',
              bgcolor: m.direction === 'OUTBOUND' ? 'primary.50' : 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Chip size="small" label={m.channel} variant="outlined" />
              {m.status === 'FAILED' && <Chip size="small" label="Failed" color="error" />}
              <Typography variant="caption" color="text.disabled">
                {new Date(m.createdAt).toLocaleString()}
              </Typography>
            </Stack>
            {m.subject && (
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {m.subject}
              </Typography>
            )}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {m.body}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Send a message
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <ToggleButtonGroup
          value={channel}
          exclusive
          onChange={(_e, val) => val && setChannel(val)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="EMAIL" disabled={!contact.email}>
            Email
          </ToggleButton>
          <ToggleButton value="SMS" disabled={!contact.phone}>
            SMS
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack spacing={1.5}>
          {channel === 'EMAIL' && (
            <TextField
              label="Subject"
              size="small"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
            />
          )}
          <TextField
            label="Message"
            size="small"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={isPending || !body.trim()}
            sx={{ alignSelf: 'flex-start' }}
          >
            {isPending ? 'Sending...' : `Send ${channel === 'EMAIL' ? 'Email' : 'SMS'}`}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}