'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import { sendInvitation, revokeInvitation, updateMemberRole, removeMember } from './actions';

type Member = { id: string; name: string | null; email: string; role: string };
type Invitation = { id: string; email: string; role: string; expiresAt: string };

export default function TeamClient({
  currentUserId,
  members,
  invitations,
}: {
  currentUserId: string;
  members: Member[];
  invitations: Invitation[];
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'AGENT'>('AGENT');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleInvite = () => {
    setError(null);
    startTransition(async () => {
      try {
        await sendInvitation(email, role);
        setEmail('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send invite');
      }
    });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Team
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Invite teammates and manage their access to your workspace.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          Invite a teammate
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Select size="small" value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'AGENT')}>
            <MenuItem value="AGENT">Agent</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </Select>
          <Button variant="contained" onClick={handleInvite} disabled={isPending || !email.trim()}>
            Invite
          </Button>
        </Stack>
      </Paper>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        Members
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {members.map((m) => (
          <Paper key={m.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {m.name || m.email} {m.id === currentUserId && '(You)'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {m.email}
              </Typography>
            </Box>
            {m.role === 'OWNER' ? (
              <Chip size="small" label="Owner" />
            ) : (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Select
                  size="small"
                  value={m.role}
                  onChange={(e) => startTransition(() => updateMemberRole(m.id, e.target.value as 'ADMIN' | 'AGENT'))}
                >
                  <MenuItem value="AGENT">Agent</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (window.confirm(`Remove ${m.name || m.email} from this workspace?`)) {
                      startTransition(() => removeMember(m.id));
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>

      {invitations.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            Pending Invitations
          </Typography>
          <Stack spacing={1.5}>
            {invitations.map((inv) => (
              <Paper key={inv.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2">{inv.email}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Invited as {inv.role} · Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Button size="small" color="error" onClick={() => startTransition(() => revokeInvitation(inv.id))}>
                  Revoke
                </Button>
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}