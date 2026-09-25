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
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Autocomplete from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  createContact,
  updateContact,
  deleteContact,
  addTagToContact,
  removeTagFromContact,
} from './actions';
import { useRouter } from 'next/navigation';
import ChatIcon from '@mui/icons-material/Chat';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CsvImportDialog from './CsvImportDialog';

type Tag = { id: string; name: string };

type CustomFieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'DROPDOWN';

type CustomFieldDef = {
  id: string;
  key: string;
  label: string;
  type: CustomFieldType;
  options: string[] | null;
};

type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  tags: Tag[];
  customFields: Record<string, unknown>;
};

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', customFields: {} as Record<string, unknown> };

// Sensible default value per type, used when a contact has no value yet
// for a definition (new definitions added after old contacts existed).
function defaultValueFor(type: CustomFieldType): unknown {
  switch (type) {
    case 'BOOLEAN':
      return false;
    case 'NUMBER':
      return '';
    case 'DATE':
      return '';
    case 'DROPDOWN':
      return '';
    case 'TEXT':
    default:
      return '';
  }
}

function seedCustomFields(
  defs: CustomFieldDef[],
  existing: Record<string, unknown> | undefined
): Record<string, unknown> {
  const seeded: Record<string, unknown> = {};
  for (const def of defs) {
    const value = existing?.[def.key];
    seeded[def.key] = value === undefined || value === null ? defaultValueFor(def.type) : value;
  }
  return seeded;
}

function CustomFieldInput({
  def,
  value,
  onChange,
}: {
  def: CustomFieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (def.type) {
    case 'BOOLEAN':
      return (
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
          label={def.label}
        />
      );
    case 'DROPDOWN':
      return (
        <FormControl fullWidth>
          <InputLabel>{def.label}</InputLabel>
          <Select
            label={def.label}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {(def.options ?? []).map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
        case 'DATE':
      return (
        <TextField
          label={def.label}
          type="date"
          value={(value as string)?.slice(0, 10) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );
    case 'NUMBER':
      return (
        <TextField
          label={def.label}
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
        />
      );
    case 'TEXT':
    default:
      return (
        <TextField
          label={def.label}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
        />
      );
  }
}

function TagsCell({
  slug,
  contact,
  allTags,
}: {
  slug: string;
  contact: Contact;
  allTags: Tag[];
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState('');
  const [, startTransition] = useTransition();

  const suggestions = allTags
    .map((t) => t.name)
    .filter((name) => !contact.tags.some((t) => t.name === name));

  const handleAdd = () => {
    if (!value.trim()) return;
    startTransition(() => {
      addTagToContact(slug, contact.id, value.trim());
    });
    setValue('');
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', py: 1 }}>
      {contact.tags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.name}
          size="small"
          onDelete={() => startTransition(() => removeTagFromContact(slug, contact.id, tag.id))}
        />
      ))}
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, width: 220 }}>
          <Autocomplete
            freeSolo
            options={suggestions}
            inputValue={value}
            onInputChange={(_e, newValue) => setValue(newValue)}
            onChange={(_e, newValue) => {
              if (newValue) {
                setValue(newValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                size="small"
                label="Add tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
              />
            )}
          />
          <Button size="small" fullWidth sx={{ mt: 1 }} onClick={handleAdd}>
            Add
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}

export default function ContactsClient({
  slug,
  initialContacts,
  allTags,
  customFieldDefs,
}: {
  slug: string;
  initialContacts: Contact[];
  allTags: Tag[];
  customFieldDefs: CustomFieldDef[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
    const [importOpen, setImportOpen] = useState(false);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, customFields: seedCustomFields(customFieldDefs, undefined) });
    setError(null);
    setOpen(true);
  };

  const openEditDialog = (contact: Contact) => {
    setEditingId(contact.id);
    setForm({
      firstName: contact.firstName ?? '',
      lastName: contact.lastName ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      customFields: seedCustomFields(customFieldDefs, contact.customFields),
    });
    setError(null);
    setOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      if (editingId) {
        await updateContact(slug, editingId, form);
      } else {
        await createContact(slug, form);
      }
      setOpen(false);
    });
  };

  const handleDelete = (contact: Contact) => {
    const name = `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || 'this contact';
    if (!window.confirm(`Delete ${name}? This can't be undone.`)) return;

    startTransition(async () => {
      try {
        await deleteContact(slug, contact.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete contact.');
      }
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      valueGetter: (_value, row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || '—',
    },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1.5,
      sortable: false,
      renderCell: (params) => <TagsCell slug={slug} contact={params.row} allTags={allTags} />,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 1,
      valueGetter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon fontSize="small" />}
          label="Edit"
          onClick={() => openEditDialog(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon fontSize="small" />}
          label="Delete"
          onClick={() => handleDelete(params.row)}
        />,
                <GridActionsCellItem
          key="timeline"
          icon={<ChatIcon fontSize="small" />}
          label="Messages"
          onClick={() => router.push(`/niche/${slug}/contacts/${params.row.id}`)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Contacts
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setImportOpen(true)}>
            Import CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Add Contact
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 500, bgcolor: 'background.paper', borderRadius: 1 }}>
        <DataGrid
          rows={initialContacts}
          columns={columns}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
            />

            {customFieldDefs.length > 0 && (
              <>
                <Typography variant="overline" color="text.secondary" sx={{ mt: 1 }}>
                  Custom Fields
                </Typography>
                {customFieldDefs.map((def) => (
                  <CustomFieldInput
                    key={def.id}
                    def={def}
                    value={form.customFields[def.key]}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        customFields: { ...form.customFields, [def.key]: value },
                      })
                    }
                  />
                ))}
              </>
            )}
          </Stack>
                </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <CsvImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        slug={slug}
        customFieldDefs={customFieldDefs}
      />
    </Box>
  );
}