'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { addSendingDomain, refreshDomainStatus, removeSendingDomain } from './actions';

type DnsRecord = { record: string; name: string; type: string; value: string; ttl: string };
type Domain = { id: string; domain: string; status: string; records: DnsRecord[] };

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  VERIFIED: 'success',
  FAILED: 'error',
};

export default function AccountSettingsClient({ domains }: { domains: Domain[] }) {
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      try {
        await addSendingDomain(newDomain);
        setNewDomain('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add domain');
      }
    });
  };

  const handleRefresh = (id: string) => {
    startTransition(() => refreshDomainStatus(id));
  };

  const handleRemove = (domain: Domain) => {
    if (!window.confirm(`Remove ${domain.domain}? Emails will stop sending from this address.`)) return;
    startTransition(() => removeSendingDomain(domain.id));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Account Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Settings here apply across your whole account, not just one workspace.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Sending Domains
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add your own domain so workflow emails send from your business instead of Sandbox App's
          shared address. Use a dedicated subdomain (e.g. <code>mail.yourcompany.com</code>) rather
          than your root domain — this keeps it from conflicting with your website or any other
          email service already configured on that domain.
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <TextField
            size="small"
            placeholder="mail.yourcompany.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleAdd} disabled={isPending || !newDomain.trim()}>
            Add Domain
          </Button>
        </Stack>

        <Stack spacing={2}>
          {domains.map((d) => (
            <Paper key={d.id} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {d.domain}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip size="small" label={d.status} color={STATUS_COLOR[d.status] ?? 'default'} />
                  <IconButton size="small" onClick={() => handleRefresh(d.id)} disabled={isPending}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleRemove(d)} disabled={isPending}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {d.status !== 'VERIFIED' && d.records?.length > 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {d.records.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.type}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
                          {r.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
          ))}
          {domains.length === 0 && (
            <Typography variant="body2" color="text.disabled">
              No custom sending domains yet — emails send from Sandbox App's default address.
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}