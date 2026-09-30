'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { optimizeImageUrl } from '@/lib/image-url';
import dynamic from 'next/dynamic';

const ListingsMap = dynamic(() => import('./ListingsMap'), { ssr: false });

type Listing = {
  id: string;
  address: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  status: string;
  description: string | null;
  imageUrls: string[];
  latitude: number | null;
  longitude: number | null;
};

type Agent = {
  name: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  bio: string | null;
} | null;

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  ACTIVE: 'success',
  UNDER_OFFER: 'warning',
  SOLD: 'default',
  OFF_MARKET: 'error',
};

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'For Sale' },
  { value: 'UNDER_OFFER', label: 'Under Offer' },
  { value: 'SOLD', label: 'Sold' },
];

export default function ShowcaseClient({
  title,
  description,
  listings,
  agent,
}: {
  title: string;
  description: string | null;
  listings: Listing[];
  agent: Agent;
}) {
  const [selected, setSelected] = useState<Listing | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState('ANY');
  const [status, setStatus] = useState('ALL');

  const filtered = listings.filter((l) => {
    if (status !== 'ALL' && l.status !== status) return false;
    if (minPrice && (l.price ?? 0) < Number(minPrice)) return false;
    if (maxPrice && (l.price ?? Infinity) > Number(maxPrice)) return false;
    if (minBeds !== 'ANY' && (l.bedrooms ?? 0) < Number(minBeds)) return false;
    return true;
  });

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: { xs: 4, md: 6 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}

      {agent && (agent.name || agent.phone || agent.email) && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar
            src={agent.photoUrl ? optimizeImageUrl(agent.photoUrl, 120) : undefined}
            sx={{ width: 64, height: 64 }}
          >
            {agent.name?.[0] ?? '?'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 200 }}>
            {agent.name && (
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {agent.name}
              </Typography>
            )}
            {agent.bio && (
              <Typography variant="body2" color="text.secondary">
                {agent.bio}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            {agent.phone && (
              <Button size="small" variant="outlined" startIcon={<PhoneIcon />} href={`tel:${agent.phone}`}>
                Call
              </Button>
            )}
            {agent.email && (
              <Button size="small" variant="outlined" startIcon={<EmailIcon />} href={`mailto:${agent.email}`}>
                Email
              </Button>
            )}
          </Stack>
        </Paper>
      )}

            <ListingsMap listings={filtered} />

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            label="Min Price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            sx={{ width: 140 }}
          />
          <TextField
            size="small"
            label="Max Price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            sx={{ width: 140 }}
          />
          <Select size="small" value={minBeds} onChange={(e) => setMinBeds(e.target.value)} sx={{ width: 140 }}>
            <MenuItem value="ANY">Any Beds</MenuItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={n}>
                {n}+ Beds
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ width: 160 }}>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Paper>

      {filtered.length === 0 && (
        <Typography color="text.disabled">No listings match your filters.</Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {filtered.map((l) => (
          <Card key={l.id} sx={{ cursor: 'pointer' }} onClick={() => setSelected(l)}>
            {l.imageUrls[0] ? (
              <CardMedia component="img" height="180" image={optimizeImageUrl(l.imageUrls[0], 600)} alt={l.address} />
            ) : (
              <Box sx={{ height: 180, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.disabled">
                  No image
                </Typography>
              </Box>
            )}
            <CardContent>
              <Chip size="small" label={l.status} color={STATUS_COLORS[l.status]} sx={{ mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {l.address}
              </Typography>
              {l.price && (
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mt: 0.5 }}>
                  ₱{l.price.toLocaleString()}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 1, color: 'text.secondary' }}>
                {l.bedrooms !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BedIcon fontSize="small" /> <Typography variant="caption">{l.bedrooms}</Typography>
                  </Box>
                )}
                {l.bathrooms !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BathtubIcon fontSize="small" /> <Typography variant="caption">{l.bathrooms}</Typography>
                  </Box>
                )}
                {l.squareFeet !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SquareFootIcon fontSize="small" /> <Typography variant="caption">{l.squareFeet} sqft</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        {selected && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selected.address}
              <IconButton onClick={() => setSelected(null)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {selected.imageUrls.map((url, i) => (
                <Box key={i} component="img" src={optimizeImageUrl(url, 1200)} sx={{ width: '100%', borderRadius: 1, mb: 1.5 }} />
              ))}
              {selected.price && (
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  ₱{selected.price.toLocaleString()}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selected.description}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}