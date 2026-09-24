'use client';

import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { UserButton } from '@clerk/nextjs';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import NotificationBell from './NotificationBell';
import RenewalBanner from './RenewalBanner';
import GroupIcon from '@mui/icons-material/Group';

export default function DesktopHeader({
  isSuperAdmin = false,
  showBackButton = false,
  isOwner = false,
}: {
  isSuperAdmin?: boolean;
  showBackButton?: boolean;
  isOwner?: boolean;
}) {
  return (
    <>
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showBackButton && (
            <Tooltip title="Back to Desktop">
              <IconButton component={Link} href="/desktop" aria-label="back to desktop" size="small">
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
            component={Link}
            href="/desktop"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Sandbox App
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isSuperAdmin && (
            <Tooltip title="Super Admin">
              <IconButton component={Link} href="/admin" aria-label="super admin">
                <AdminPanelSettingsIcon />
              </IconButton>
            </Tooltip>
          )}

                    <Tooltip title="What's New">
            <IconButton component={Link} href="/updates" aria-label="updates">
              <NewReleasesIcon />
            </IconButton>
          </Tooltip>

                    <Tooltip title="Feedback & Suggestions">
            <IconButton component={Link} href="/feedback" aria-label="feedback">
              <LightbulbOutlinedIcon />
            </IconButton>
          </Tooltip>

                    <Tooltip title="Support">
            <IconButton component={Link} href="/support" aria-label="support">
              <SupportAgentIcon />
            </IconButton>
          </Tooltip>

                    {isOwner && (
            <Tooltip title="Team">
              <IconButton component={Link} href="/team" aria-label="team">
                <GroupIcon />
              </IconButton>
            </Tooltip>
          )}

                    <NotificationBell />

          <IconButton component={Link} href="/account-settings" aria-label="account settings">
            <SettingsIcon />
          </IconButton>
          <UserButton />
        </Box>
      </Toolbar>
    </AppBar>
    <RenewalBanner />
    </>
  );
}