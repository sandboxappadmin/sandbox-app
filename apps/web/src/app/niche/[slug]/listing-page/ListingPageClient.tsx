'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import { saveListingPage } from './actions';
import { useState, useTransition, useEffect } from 'react';
import ImageUploader from '../listings/ImageUploader';

type Listing = { id: string; address: string; status: string };
type PageData = {
  pageSlug: string;
  title: string;
  description: string;
  listingIds: string[];
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentPhotoUrl: string;
  agentBio: string;
};

export default function ListingPageClient({
  slug,
  initialPage,
  listings,
}: {
  slug: string;
  initialPage: PageData | null;
  listings: Listing[];
}) {
    const [form, setForm] = useState<PageData>(
    initialPage ?? {
      pageSlug: slug,
      title: '',
      description: '',
      listingIds: [],
      agentName: '',
      agentPhone: '',
      agentEmail: '',
      agentPhotoUrl: '',
      agentBio: '',
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleListing = (id: string) => {
    setForm((f) => ({
      ...f,
      listingIds: f.listingIds.includes(id) ? f.listingIds.filter((x) => x !== id) : [...f.listingIds, id],
    }));
  };

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await saveListingPage(slug, form);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save');
      }
    });
  };

const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const publicUrl = `${origin}/showcase/${form.pageSlug}`;

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Listing Page
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {saved && (
        <Alert severity="success" onClose={() => setSaved(false)} sx={{ mb: 2 }}>
          Saved. Your page is live at <strong>{publicUrl}</strong>
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Page Name"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth
            placeholder="e.g. Jay-ar Ermino Real Estate"
          />
          <TextField
            label="Page URL"
            value={form.pageSlug}
            onChange={(e) => setForm({ ...form, pageSlug: e.target.value })}
            fullWidth
            helperText={`Will be shared as: ${origin}/showcase/${form.pageSlug || '...'}`}          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </Paper>

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          Agent Contact
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Shown to visitors so they know who to reach out to.
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Photo
            </Typography>
                        <ImageUploader
              urls={form.agentPhotoUrl ? [form.agentPhotoUrl] : []}
              onChange={(urls) => setForm({ ...form, agentPhotoUrl: urls[urls.length - 1] ?? '' })}
              label={form.agentPhotoUrl ? 'Replace Photo' : 'Upload Photo'}
            />
          </Box>
          <TextField
            label="Name"
            value={form.agentName}
            onChange={(e) => setForm({ ...form, agentName: e.target.value })}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Phone"
              value={form.agentPhone}
              onChange={(e) => setForm({ ...form, agentPhone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={form.agentEmail}
              onChange={(e) => setForm({ ...form, agentEmail: e.target.value })}
              fullWidth
            />
          </Stack>
          <TextField
            label="Short Bio"
            value={form.agentBio}
            onChange={(e) => setForm({ ...form, agentBio: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          Featured Listings
        </Typography>
        {listings.length === 0 && (
          <Typography variant="body2" color="text.disabled">
            No listings yet. Add some from the Listings page first.
          </Typography>
        )}
        <Stack>
          {listings.map((l) => (
            <FormControlLabel
              key={l.id}
              control={<Checkbox checked={form.listingIds.includes(l.id)} onChange={() => toggleListing(l.id)} />}
              label={`${l.address} (${l.status})`}
            />
          ))}
        </Stack>
      </Paper>

      <Button variant="contained" onClick={handleSave} disabled={isPending || !form.title.trim() || !form.pageSlug.trim()}>
        {isPending ? 'Saving...' : 'Save Page'}
      </Button>
    </Box>
  );
}