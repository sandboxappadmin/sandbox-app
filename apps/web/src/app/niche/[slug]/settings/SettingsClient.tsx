'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  renameWorkspace,
  createTag,
  deleteTag,
  createCustomField,
  deleteCustomField,
} from './actions';
import AvailabilityClient from './AvailabilityClient';

type Tag = { id: string; name: string };
type CustomField = { id: string; label: string; type: string; options: string[] };
type Rule = { dayOfWeek: number; startTime: string; endTime: string };

const FIELD_TYPES = ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'DROPDOWN'];

export default function SettingsClient({
  slug,
  workspaceName,
  categoryLabel,
  tags,
  customFields,
  availabilityRules,
}: {
  slug: string;
  workspaceName: string;
  categoryLabel: string;
  tags: Tag[];
  customFields: CustomField[];
  availabilityRules: Rule[];
}) {
  const [name, setName] = useState(workspaceName);
  const [nameSaved, setNameSaved] = useState(false);

  const [newTag, setNewTag] = useState('');

  const [fieldOpen, setFieldOpen] = useState(false);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');
  const [fieldOptions, setFieldOptions] = useState('');

  const handleSaveName = async () => {
    await renameWorkspace(slug, name);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    await createTag(slug, newTag);
    setNewTag('');
  };

  const handleDeleteTag = async (tag: Tag) => {
    if (!window.confirm(`Delete tag "${tag.name}"? It will be removed from all contacts.`)) return;
    await deleteTag(slug, tag.id);
  };

  const handleCreateField = async () => {
    if (!fieldLabel.trim()) return;
    const options =
      fieldType === 'DROPDOWN'
        ? fieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
        : undefined;

    await createCustomField(slug, { label: fieldLabel, type: fieldType, options });
    setFieldLabel('');
    setFieldType('TEXT');
    setFieldOptions('');
    setFieldOpen(false);
  };

  const handleDeleteField = async (field: CustomField) => {
    if (!window.confirm(`Delete custom field "${field.label}"? This can't be undone.`)) return;
    await deleteCustomField(slug, field.id);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Settings
      </Typography>

      <Stack spacing={3}>
        {/* Workspace name */}
                <Paper variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Workspace Name
            </Typography>
            <Chip size="small" label={categoryLabel} variant="outlined" color="primary" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This is a custom display name only — the workspace stays permanently categorized as{' '}
            <strong>{categoryLabel}</strong>, so its niche-specific features and templates never
            change.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TextField
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ maxWidth: 320 }}
            />
            <Button variant="contained" onClick={handleSaveName} disabled={!name.trim()}>
              Save
            </Button>
            {nameSaved && (
              <Typography variant="caption" color="success.main">
                Saved
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Tags */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Tags
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manage tags used across contacts in this workspace. Deleting a tag removes it from
            every contact it's applied to.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {tags.length === 0 && (
              <Typography variant="body2" color="text.disabled">
                No tags yet.
              </Typography>
            )}
            {tags.map((tag) => (
              <Chip key={tag.id} label={tag.name} onDelete={() => handleDeleteTag(tag)} />
            ))}
          </Box>

          <Stack direction="row" spacing={1.5}>
            <TextField
              size="small"
              placeholder="New tag name"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag();
              }}
              sx={{ maxWidth: 240 }}
            />
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddTag}>
              Add Tag
            </Button>
          </Stack>
        </Paper>

        {/* Custom Fields */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Custom Fields
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Extra fields tracked on contacts specific to this workspace's niche.
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setFieldOpen(true)}
            >
              Add Field
            </Button>
          </Box>

          {customFields.length === 0 && (
            <Typography variant="body2" color="text.disabled">
              No custom fields yet.
            </Typography>
          )}

          <Stack divider={<Divider />} spacing={0}>
            {customFields.map((field) => (
              <Box
                key={field.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {field.label}
                  </Typography>
                  {field.type === 'DROPDOWN' && field.options.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Options: {field.options.join(', ')}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip size="small" label={field.type} variant="outlined" />
                  <IconButton size="small" onClick={() => handleDeleteField(field)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
            
          </Stack>
          </Paper>
          
          {/* Booking Availability */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <AvailabilityClient slug={slug} initialRules={availabilityRules} />
        </Paper>
      </Stack>

      <Dialog open={fieldOpen} onClose={() => setFieldOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add Custom Field</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Field Label"
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              fullWidth
              helperText='e.g. "Budget Range", "Move-in Date"'
            />
            <TextField
              select
              label="Field Type"
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              fullWidth
            >
              {FIELD_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            {fieldType === 'DROPDOWN' && (
              <TextField
                label="Options (comma-separated)"
                value={fieldOptions}
                onChange={(e) => setFieldOptions(e.target.value)}
                fullWidth
                helperText="e.g. 0-50k, 50-100k, 100k+"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateField} disabled={!fieldLabel.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}