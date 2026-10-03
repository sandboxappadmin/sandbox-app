'use client';

import { useTransition } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { updateSuggestionStatus } from './actions';

type Row = {
  id: string;
  title: string;
  description: string;
  status: string;
  authorName: string;
  voteCount: number;
  createdAt: string;
};

const STATUS_OPTIONS = ['OPEN', 'PLANNED', 'IN_PROGRESS', 'SHIPPED', 'DECLINED'] as const;

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  OPEN: 'default',
  PLANNED: 'info',
  IN_PROGRESS: 'warning',
  SHIPPED: 'success',
  DECLINED: 'error',
};

function StatusCell({ row }: { row: Row }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      size="small"
      value={row.status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateSuggestionStatus(row.id, e.target.value as any))}
      renderValue={(value) => <Chip size="small" label={value} color={STATUS_COLORS[value as string]} />}
    >
      {STATUS_OPTIONS.map((s) => (
        <MenuItem key={s} value={s}>
          {s}
        </MenuItem>
      ))}
    </Select>
  );
}

export default function AdminSuggestionsClient({ rows }: { rows: Row[] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const columns: GridColDef<Row>[] = [
    { field: 'voteCount', headerName: 'Votes', width: 80 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'authorName', headerName: 'Submitted By', flex: 0.8 },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: (params) => <StatusCell row={params.row as Row} />,
    },
    {
      field: 'createdAt',
      headerName: 'Submitted',
      flex: 0.7,
      valueGetter: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Suggestions
      </Typography>

      {isMobile ? (
        <Stack spacing={1.5}>
          {rows.map((row) => (
            <Paper key={row.id} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {row.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.authorName} · {row.voteCount} vote{row.voteCount === 1 ? '' : 's'} ·{' '}
                    {new Date(row.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1.5 }}>
                <StatusCell row={row} />
              </Box>
            </Paper>
          ))}
          {rows.length === 0 && (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
              No suggestions yet.
            </Typography>
          )}
        </Stack>
      ) : (
        <Box sx={{ height: 600, bgcolor: 'background.paper', borderRadius: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            getRowHeight={() => 'auto'}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          />
        </Box>
      )}
    </Box>
  );
}