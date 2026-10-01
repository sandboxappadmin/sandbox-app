'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Row = {
  id: string;
  subject: string;
  status: string;
  accountName: string;
  messageCount: number;
  updatedAt: string;
};

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export default function AdminTicketsClient({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const columns: GridColDef[] = [
    { field: 'subject', headerName: 'Subject', flex: 1.5 },
    { field: 'accountName', headerName: 'Account', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <Chip size="small" label={params.value} color={STATUS_COLORS[params.value]} />,
    },
    { field: 'messageCount', headerName: 'Messages', width: 100 },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      flex: 1,
      valueGetter: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Support Tickets
      </Typography>

      {isMobile ? (
        <Stack spacing={1.5}>
          {rows.map((row) => (
            <Paper
              key={row.id}
              variant="outlined"
              component={Link}
              href={`/admin/tickets/${row.id}`}
              sx={{
                p: 2,
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {row.subject}
                </Typography>
                <Chip size="small" label={row.status} color={STATUS_COLORS[row.status]} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {row.accountName}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {row.messageCount} message{row.messageCount === 1 ? '' : 's'} · Updated{' '}
                {new Date(row.updatedAt).toLocaleDateString()}
              </Typography>
            </Paper>
          ))}
          {rows.length === 0 && (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
              No tickets.
            </Typography>
          )}
        </Stack>
      ) : (
        <Box sx={{ height: 600, bgcolor: 'background.paper', borderRadius: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            onRowClick={(params) => router.push(`/admin/tickets/${params.id}`)}
            sx={{ cursor: 'pointer' }}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          />
        </Box>
      )}
    </Box>
  );
}