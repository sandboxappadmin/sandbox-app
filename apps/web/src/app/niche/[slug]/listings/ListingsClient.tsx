'use client';

import { useState, useTransition } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { createListing, updateListing, deleteListing } from './actions';

type Listing = {
  id: string;
  address: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  status: string;
  description: string | null;
  createdAt: string;
  imageUrls: string[];
};

const STATUS_OPTIONS = ['ACTIVE', 'UNDER_OFFER', 'SOLD', 'OFF_MARKET'];
const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  ACTIVE: 'success',
  UNDER_OFFER: 'warning',
  SOLD: 'default',
  OFF_MARKET: 'error',
};

const EMPTY_FORM = {
  address: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  squareFeet: '',
  status: 'ACTIVE',
  description: '',
  imageUrls: '',
};

export default function ListingsClient({ slug, initialListings }: { slug: string; initialListings: Listing[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setForm({
      address: listing.address,
      price: listing.price?.toString() ?? '',
      bedrooms: listing.bedrooms?.toString() ?? '',
      bathrooms: listing.bathrooms?.toString() ?? '',
      squareFeet: listing.squareFeet?.toString() ?? '',
      status: listing.status,
      description: listing.description ?? '',
            imageUrls: (listing as any).imageUrls?.join('\n') ?? '',
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      if (editingId) {
        await updateListing(slug, editingId, form);
      } else {
        await createListing(slug, form);
      }
      setOpen(false);
    });
  };

  const handleDelete = (listing: Listing) => {
    if (!window.confirm(`Delete listing at ${listing.address}?`)) return;
    startTransition(async () => {
      try {
        await deleteListing(slug, listing.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete');
      }
    });
  };

  const columns: GridColDef[] = [
    { field: 'address', headerName: 'Address', flex: 1.5 },
    {
      field: 'price',
      headerName: 'Price',
      flex: 0.8,
      valueGetter: (value) => (value ? `₱${Number(value).toLocaleString()}` : '—'),
    },
    {
      field: 'bedrooms',
      headerName: 'Beds',
      width: 80,
      valueGetter: (value) => value ?? '—',
    },
    {
      field: 'bathrooms',
      headerName: 'Baths',
      width: 80,
      valueGetter: (value) => value ?? '—',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <Chip size="small" label={params.value} color={STATUS_COLORS[params.value]} />,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem key="edit" icon={<EditIcon fontSize="small" />} label="Edit" onClick={() => openEdit(params.row)} />,
        <GridActionsCellItem key="delete" icon={<DeleteIcon fontSize="small" />} label="Delete" onClick={() => handleDelete(params.row)} />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Listings
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Listing
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 500, bgcolor: 'background.paper', borderRadius: 1 }}>
        <DataGrid rows={initialListings} columns={columns} disableRowSelectionOnClick initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit Listing' : 'Add Listing'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} fullWidth />
            <Stack direction="row" spacing={2}>
              <TextField label="Price (₱)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} fullWidth />
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} sx={{ minWidth: 160 }}>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} fullWidth />
              <TextField label="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} fullWidth />
              <TextField label="Sq. Ft." type="number" value={form.squareFeet} onChange={(e) => setForm({ ...form, squareFeet: e.target.value })} fullWidth />
            </Stack>
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={3} />
                      <TextField
              label="Image URLs (one per line)"
              value={form.imageUrls}
              onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              helperText="Paste direct image links, one per line"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isPending || !form.address.trim()}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}