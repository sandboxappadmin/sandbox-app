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
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { suspendAccount, reactivateAccount, softDeleteAccount } from './actions';
import { grantFreeAccess, revertToTrialTracking } from './subscription-actions';
import HistoryIcon from '@mui/icons-material/History';

type Status = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

type Row = {
  id: string;
  name: string;
  status: Status;
  subscriptionStatus: string;
  trialEndsAt: string | null;
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
    </Box>
  );
}