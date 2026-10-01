'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';

type Status = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

type Row = {
  id: string;
  name: string;
  status: Status;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  ownerEmail: string;
  userCount: number;
  niches: string;
  createdAt: string;
};

export type RowAction = {
  key: string;
  label: string;
  icon: React.ElementType;
  onClick: (row: Row) => void;
};

const STATUS_COLOR: Record<Status, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  DELETED: 'error',
};

export default function AccountCard({
  row,
  actions,
  isPending,
}: {
  row: Row;
  actions: RowAction[];
  isPending: boolean;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const renewalDate = row.subscriptionStatus === 'TRIALING' ? row.trialEndsAt : row.currentPeriodEnd;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {row.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.ownerEmail}
          </Typography>
        </Box>
        <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} disabled={isPending} aria-label="account actions">
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          {actions.map((action) => (
            <MenuItem
              key={action.key}
              onClick={() => {
                setMenuAnchor(null);
                action.onClick(row);
              }}
            >
              <ListItemIcon>
                <action.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Chip size="small" label={row.status} color={STATUS_COLOR[row.status]} />
        <Chip size="small" label={row.subscriptionStatus} variant="outlined" />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
        <Box>
          <Typography variant="caption" color="text.disabled" display="block">
            Users
          </Typography>
          <Typography variant="body2">{row.userCount}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.disabled" display="block">
            Renews / Ends
          </Typography>
          <Typography variant="body2">{renewalDate ? new Date(renewalDate).toLocaleDateString() : '—'}</Typography>
        </Box>
      </Stack>

      {row.niches && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {row.niches}
        </Typography>
      )}
    </Paper>
  );
}