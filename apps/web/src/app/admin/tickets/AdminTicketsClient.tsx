'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
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
    </Box>
  );
}