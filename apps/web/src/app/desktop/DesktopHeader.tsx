'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { UserButton } from '@clerk/nextjs';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import GroupIcon from '@mui/icons-material/Group';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationBell from './NotificationBell';
import RenewalBanner from './RenewalBanner';

export default function DesktopHeader({
  isSuperAdmin = false,
  showBackButton = false,
  isOwner = false,
  canManageAccount = false,
}: {
  isSuperAdmin?: boolean;
  showBackButton?: boolean;
  isOwner?: boolean;
  canManageAccount?: boolean;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const menuItems = [
    isSuperAdmin && { label: 'Super Admin', icon: AdminPanelSettingsIcon, href: '/admin' },
    { label: "What's New", icon: NewReleasesIcon, href: '/updates' },
    { label: 'Feedback & Suggestions', icon: LightbulbOutlinedIcon, href: '/feedback' },
    { label: 'Support', icon: SupportAgentIcon, href: '/support' },
    isOwner && { label: 'Team', icon: GroupIcon, href: '/team' },
    canManageAccount && { label: 'Account Settings', icon: SettingsIcon, href: '/account-settings' },
  ].filter(Boolean) as { label: string; icon: typeof SettingsIcon; href: string }[];

  return (
    <>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            {showBackButton && (
              <Tooltip title="Back to Desktop">
                <IconButton component={Link} href="/desktop" aria-label="back to desktop" size="small">
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Typography
              variant="h6"
              noWrap
              sx={{ fontWeight: 600 }}
              component={Link}
              href="/desktop"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              Sandbox App
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile ? (
              <>
                <NotificationBell />
                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="more options">
                  <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                  {menuItems.map((item) => (
                    <MenuItem
                      key={item.href}
                      component={Link}
                      href={item.href}
                      onClick={() => setMenuAnchor(null)}
                    >
                      <ListItemIcon>
                        <item.icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                  ))}
                </Menu>
                <UserButton />
              </>
            ) : (
              <>
                {menuItems.map((item) => (
                  <Tooltip key={item.href} title={item.label}>
                    <IconButton component={Link} href={item.href} aria-label={item.label}>
                      <item.icon />
                    </IconButton>
                  </Tooltip>
                ))}
                <NotificationBell />
                <UserButton />
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <RenewalBanner />
    </>
  );
}