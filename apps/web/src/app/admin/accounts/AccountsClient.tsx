'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { suspendAccount, reactivateAccount, softDeleteAccount } from './actions';
import HistoryIcon from '@mui/icons-material/History';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { grantFreeAccess, revertToTrialTracking, forceTrialExpired, forceSubscriptionExpired } from './subscription-actions';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { setRenewalDate } from './date-actions';
import Button from '@mui/material/Button';

type Status = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

type Row = {
  id: string;
  name: string;
  status: Status;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  ownerEmail: string;
  userCount: number;
  niches: string;
  createdAt: string;
};

const STATUS_COLOR: Record<Status, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  DELETED: 'error',
};

export default function AccountsClient({ rows }: { rows: Row[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [editDate, setEditDate] = useState('');

  const runAction = (fn: (id: string) => Promise<void>, id: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await fn(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Action failed.');
      }
    });
  };

  const handleSuspend = (row: Row) => {
    if (!window.confirm(`Suspend ${row.name}? Their users won't be able to access the platform until reactivated.`)) return;
    runAction(suspendAccount, row.id);
  };

  const handleReactivate = (row: Row) => {
    runAction(reactivateAccount, row.id);
  };

  const handleDelete = (row: Row) => {
    if (
      !window.confirm(
        `Delete ${row.name}? This marks the account as deleted and blocks all access. Their data is retained, not erased, but this should only be done for accounts you're sure should be shut down.`
      )
    )
      return;
    runAction(softDeleteAccount, row.id);
  };

  const handleGrantFreeAccess = (row: Row) => {
    if (!window.confirm(`Grant ${row.name} free access, bypassing trial/payment entirely?`)) return;
    runAction(grantFreeAccess, row.id);
  };

    const handleRevertToTrial = (row: Row) => {
    if (!window.confirm(`Revert ${row.name} to trial tracking? They'll get a fresh 14-day trial from today.`)) return;
    runAction(revertToTrialTracking, row.id);
  };

    const handleForceTrialExpired = (row: Row) => {
    if (!window.confirm(`Force ${row.name}'s trial to expired status? Useful for testing the trial-expired flow.`)) return;
    runAction(forceTrialExpired, row.id);
  };

    const handleForceSubscriptionExpired = (row: Row) => {
    if (!window.confirm(`Force ${row.name}'s subscription period to expired? Useful for testing the renewal flow.`)) return;
    runAction(forceSubscriptionExpired, row.id);
  };

  const openDateEditor = (row: Row) => {
    const current = row.subscriptionStatus === 'TRIALING' ? row.trialEndsAt : row.currentPeriodEnd;
    setEditDate(current ? current.slice(0, 10) : '');
    setEditingRow(row);
  };

  const handleSaveDate = () => {
    if (!editingRow || !editDate) return;
    runAction((id) => setRenewalDate(id, editDate), editingRow.id);
    setEditingRow(null);
  };

  const columns: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Account Name', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip size="small" label={params.value} color={STATUS_COLOR[params.value as Status]} />
      ),
    },
    {
      field: 'subscriptionStatus',
      headerName: 'Subscription',
      width: 130,
      renderCell: (params) => <Chip size="small" label={params.value} variant="outlined" />,
    },
        {
      field: 'renewalDate',
      headerName: 'Renews / Ends',
      width: 150,
      valueGetter: (_value, row: Row) => {
        const date = row.subscriptionStatus === 'TRIALING' ? row.trialEndsAt : row.currentPeriodEnd;
        return date ? new Date(date).toLocaleDateString() : '—';
      },
    },
    { field: 'ownerEmail', headerName: 'Owner Email', flex: 1.2 },
    { field: 'userCount', headerName: 'Users', width: 90 },
    { field: 'niches', headerName: 'Niche Workspaces', flex: 1.5 },
    {
      field: 'createdAt',
      headerName: 'Signed Up',
      flex: 1,
      valueGetter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 160,
      getActions: (params) => {
        const row = params.row as Row;
        const actions = [];

                if (row.subscriptionStatus === 'TRIALING' || row.subscriptionStatus === 'ACTIVE') {
          actions.push(
            <GridActionsCellItem
              key="edit-date"
              icon={<EditCalendarIcon fontSize="small" />}
              label="Edit Renewal Date"
              onClick={() => openDateEditor(row)}
              disabled={isPending}
            />
          );
        }

        if (row.status === 'ACTIVE') {
          actions.push(
            <GridActionsCellItem
              key="suspend"
              icon={<PauseCircleIcon fontSize="small" />}
              label="Suspend"
              onClick={() => handleSuspend(row)}
              disabled={isPending}
            />
          );
        }

        if (row.status === 'SUSPENDED') {
          actions.push(
            <GridActionsCellItem
              key="reactivate"
              icon={<PlayCircleIcon fontSize="small" />}
              label="Reactivate"
              onClick={() => handleReactivate(row)}
              disabled={isPending}
            />
          );
        }

                if (row.subscriptionStatus === 'COMP') {
          actions.push(
            <GridActionsCellItem
              key="revert-trial"
              icon={<HistoryIcon fontSize="small" />}
              label="Revert to Trial"
              onClick={() => handleRevertToTrial(row)}
              disabled={isPending}
            />
          );
        }

        if (row.status !== 'DELETED') {
          actions.push(
            <GridActionsCellItem
              key="delete"
              icon={<DeleteIcon fontSize="small" />}
              label="Delete"
              onClick={() => handleDelete(row)}
              disabled={isPending}
            />
          );
        }

                if (row.subscriptionStatus !== 'COMP') {
          actions.push(
            <GridActionsCellItem
              key="force-expired"
              icon={<HourglassEmptyIcon fontSize="small" />}
              label="Force Trial Expired"
              onClick={() => handleForceTrialExpired(row)}
              disabled={isPending}
            />
          );
        }

                if (row.subscriptionStatus === 'ACTIVE') {
          actions.push(
            <GridActionsCellItem
              key="force-sub-expired"
              icon={<EventBusyIcon fontSize="small" />}
              label="Force Subscription Expired"
              onClick={() => handleForceSubscriptionExpired(row)}
              disabled={isPending}
            />
          );
        }

        return actions;
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Accounts
        </Typography>
        <Chip label={`${rows.length} total`} variant="outlined" />
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, bgcolor: 'background.paper', borderRadius: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </Box>

            <Dialog open={Boolean(editingRow)} onClose={() => setEditingRow(null)}>
        <DialogTitle>Edit Renewal Date — {editingRow?.name}</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingRow(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDate} disabled={isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}