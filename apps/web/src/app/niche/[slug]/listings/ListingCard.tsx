'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type Listing = {
  id: string;
  address: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: string;
  imageUrls: string[];
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  ACTIVE: 'success',
  UNDER_OFFER: 'warning',
  SOLD: 'default',
  OFF_MARKET: 'error',
};

export default function ListingCard({
  listing,
  onEdit,
  onDelete,
}: {
  listing: Listing;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 1.5 }}>
      {listing.imageUrls[0] ? (
        <Box
          component="img"
          src={listing.imageUrls[0]}
          sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
        />
      ) : (
        <Box
          sx={{
            width: 64,
            height: 64,
            flexShrink: 0,
            bgcolor: 'action.hover',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.disabled">
            None
          </Typography>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
            {listing.address}
          </Typography>
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="listing actions">
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onEdit();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onDelete();
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {listing.price && (
          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
            ₱{listing.price.toLocaleString()}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip size="small" label={listing.status} color={STATUS_COLORS[listing.status]} />
          {(listing.bedrooms !== null || listing.bathrooms !== null) && (
            <Typography variant="caption" color="text.secondary">
              {listing.bedrooms ?? '—'} bd · {listing.bathrooms ?? '—'} ba
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}