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
import CloseIcon from '@mui/icons-material/Close';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

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
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  ACTIVE: 'success',
  UNDER_OFFER: 'warning',
  SOLD: 'default',
  OFF_MARKET: 'error',
};

export default function ShowcaseClient({
  title,
  description,
  listings,
}: {
  title: string;
  description: string | null;
  listings: Listing[];
}) {
  const [selected, setSelected] = useState<Listing | null>(null);

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: { xs: 4, md: 6 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {description}
        </Typography>
      )}

      {listings.length === 0 && (
        <Typography color="text.disabled">No listings available right now.</Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {listings.map((l) => (
          <Card key={l.id} sx={{ cursor: 'pointer' }} onClick={() => setSelected(l)}>
            {l.imageUrls[0] ? (
              <CardMedia component="img" height="180" image={l.imageUrls[0]} alt={l.address} />
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
                <Box key={i} component="img" src={url} sx={{ width: '100%', borderRadius: 1, mb: 1.5 }} />
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