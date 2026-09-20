'use client';

import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { UserButton } from '@clerk/nextjs';

export default function DesktopHeader({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Sandbox App
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isSuperAdmin && (
            <Tooltip title="Super Admin">
              <IconButton component={Link} href="/admin" aria-label="super admin">
                <AdminPanelSettingsIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton aria-label="notifications">
            <Badge badgeContent={0} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
          <IconButton aria-label="settings">
            <SettingsIcon />
          </IconButton>
          <UserButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}