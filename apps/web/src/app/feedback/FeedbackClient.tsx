'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { createSuggestion, toggleVote } from './actions';

type Suggestion = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  authorName: string;
  voteCount: number;
  hasVoted: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  SHIPPED: 'Shipped',
  DECLINED: 'Declined',
};

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  OPEN: 'default',
  PLANNED: 'info',
  IN_PROGRESS: 'warning',
  SHIPPED: 'success',
  DECLINED: 'error',
};

const TABS = ['ALL', 'OPEN', 'PLANNED', 'IN_PROGRESS', 'SHIPPED', 'DECLINED'];

export default function FeedbackClient({ initialSuggestions }: { initialSuggestions: Suggestion[] }) {
  const [tab, setTab] = useState('ALL');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered =
    tab === 'ALL' ? initialSuggestions : initialSuggestions.filter((s) => s.status === tab);

  const handleVote = (suggestionId: string) => {
    startTransition(() => toggleVote(suggestionId));
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      await createSuggestion(title, description);
      setTitle('');
      setDescription('');
      setOpen(false);
    });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Feedback & Suggestions
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          New Suggestion
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Vote on ideas you'd like to see, or suggest something new.
      </Typography>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => (
          <Tab key={t} label={t === 'ALL' ? 'All' : STATUS_LABELS[t]} value={t} />
        ))}
      </Tabs>

      {filtered.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <LightbulbIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No suggestions here yet.</Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {filtered.map((s) => (
          <Paper key={s.id} variant="outlined" sx={{ p: 2.5, display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}>
              <IconButton
                size="small"
                color={s.hasVoted ? 'primary' : 'default'}
                onClick={() => handleVote(s.id)}
                disabled={isPending}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {s.voteCount}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {s.title}
                </Typography>
                <Chip size="small" label={STATUS_LABELS[s.status]} color={STATUS_COLORS[s.status]} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {s.description}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {s.authorName} · {new Date(s.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Suggestion</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!title.trim() || isPending}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}