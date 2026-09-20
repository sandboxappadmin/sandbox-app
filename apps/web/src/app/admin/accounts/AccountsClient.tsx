'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Row = {
  id: string;
  name: string;
  ownerEmail: string;
  userCount: number;
  niches: string;
  createdAt: string;
};

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Account Name', flex: 1 },
  { field: 'ownerEmail', headerName: 'Owner Email', flex: 1.2 },
  { field: 'userCount', headerName: 'Users', width: 90 },
  { field: 'niches', headerName: 'Niche Workspaces', flex: 1.5 },
  {
    field: 'createdAt',
    headerName: 'Signed Up',
    flex: 1,
    valueGetter: (value) => new Date(value).toLocaleDateString(),
  },
];

export default function AccountsClient({ rows }: { rows: Row[] }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Accounts
        </Typography>
        <Chip label={`${rows.length} total`} variant="outlined" />
      </Box>

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