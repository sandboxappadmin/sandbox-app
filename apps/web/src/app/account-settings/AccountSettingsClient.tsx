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
import {
  addSendingDomain,
  refreshDomainStatus,
  removeSendingDomain,
  saveSmsCredential,
  removeSmsCredential,
} from './actions';
import { startCheckout } from '../billing/actions';

type DnsRecord = { record: string; name: string; type: string; value: string; ttl: string };
type Domain = { id: string; domain: string; status: string; records: DnsRecord[] };

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  VERIFIED: 'success',
  FAILED: 'error',
};

type Subscription = {
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
} | null;

export default function AccountSettingsClient({
  domains,
  smsConnected,
  subscription,
}: {
  domains: Domain[];
  smsConnected: boolean;
  subscription: Subscription;
}) {
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [smsApiKey, setSmsApiKey] = useState('');
  const [smsError, setSmsError] = useState<string | null>(null);
  const [isSmsPending, startSmsTransition] = useTransition();

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

  const handleSaveSms = () => {
    setSmsError(null);
    startSmsTransition(async () => {
      try {
        await saveSmsCredential(smsApiKey);
        setSmsApiKey('');
      } catch (err) {
        setSmsError(err instanceof Error ? err.message : 'Failed to save API key');
      }
    });
  };

  const handleRemoveSms = () => {
    if (!window.confirm('Disconnect SMSGate? Workflow SMS steps will stop sending until reconnected.')) return;
    startSmsTransition(() => removeSmsCredential());
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Account Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Settings here apply across your whole account, not just one workspace.
      </Typography>

            {subscription && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Subscription
          </Typography>

          {subscription.status === 'TRIALING' && subscription.trialEndsAt && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your free trial ends on{' '}
                {new Date(subscription.trialEndsAt).toLocaleDateString()}.
              </Typography>
              <form action={startCheckout}>
                <Button type="submit" variant="contained">
                  Subscribe Now
                </Button>
              </form>
            </>
          )}

          {subscription.status === 'ACTIVE' && subscription.currentPeriodEnd && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your subscription renews on{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
              </Typography>
              <form action={startCheckout}>
                <Button type="submit" variant="outlined">
                  Renew Early
                </Button>
              </form>
            </>
          )}

          {subscription.status === 'COMP' && (
            <Typography variant="body2" color="text.secondary">
              You have complimentary access — no billing applies to this account.
            </Typography>
          )}
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
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

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          SMS Provider
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Connect your own SMSGate account so workflow SMS steps send from your own phone number
          and SIM. Create an account at{' '}
          <a href="https://gosmsgate.pro" target="_blank" rel="noreferrer">
            gosmsgate.pro
          </a>
          , pair your Android device, then paste your API key below.
        </Typography>

        {smsError && (
          <Alert severity="error" onClose={() => setSmsError(null)} sx={{ mb: 2 }}>
            {smsError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2">Status:</Typography>
          <Chip
            size="small"
            label={smsConnected ? 'Connected' : 'Not connected'}
            color={smsConnected ? 'success' : 'default'}
          />
        </Box>

        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            type="password"
            placeholder={smsConnected ? 'Enter a new key to replace the current one' : 'sg_live_...'}
            value={smsApiKey}
            onChange={(e) => setSmsApiKey(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSaveSms}
            disabled={isSmsPending || !smsApiKey.trim()}
          >
            {smsConnected ? 'Replace Key' : 'Connect'}
          </Button>
          {smsConnected && (
            <Button color="error" onClick={handleRemoveSms} disabled={isSmsPending}>
              Disconnect
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}