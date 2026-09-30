'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import BoltIcon from '@mui/icons-material/Bolt';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import HouseIcon from '@mui/icons-material/House';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { UserButton } from '@clerk/nextjs';
import { getNicheBySlug } from '@/lib/niches';

const DRAWER_WIDTH = 240;
const MINI_WIDTH = 68;

export default function NicheShell({
  slug,
  label,
  children,
}: {
  slug: string;
  label: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const nicheType = getNicheBySlug(slug)?.type;

  const navItems = [
    { label: 'Dashboard', icon: DashboardIcon, href: `/niche/${slug}/dashboard` },
    { label: 'Contacts', icon: PeopleIcon, href: `/niche/${slug}/contacts` },
    { label: 'Pipelines', icon: ViewKanbanIcon, href: `/niche/${slug}/pipelines` },
    ...(nicheType === 'REAL_ESTATE'
      ? [
          { label: 'Listings', icon: HouseIcon, href: `/niche/${slug}/listings` },
          { label: 'Listing Page', icon: StorefrontIcon, href: `/niche/${slug}/listing-page` },
        ]
      : []),
    { label: 'Workflows', icon: BoltIcon, href: `/niche/${slug}/workflows` },
    { label: 'Appointments', icon: EventAvailableIcon, href: `/niche/${slug}/appointments` },
    { label: 'Settings', icon: SettingsIcon, href: `/niche/${slug}/settings` },
  ];

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const categoryLabel = getNicheBySlug(slug)?.label ?? '';
  const drawerWidth = collapsed ? MINI_WIDTH : DRAWER_WIDTH;

  const handleNavigate = (href: string) => {
    router.push(href);
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ px: collapsed && !isMobile ? 1 : 2, alignItems: collapsed && !isMobile ? 'center' : 'flex-start', pt: 1.5, pb: 1.5 }}>
        {(!collapsed || isMobile) && (
          <>
            <IconButton onClick={() => router.push('/desktop')} sx={{ mr: 1, mt: 0.5 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                {label}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                {categoryLabel}
              </Typography>
            </Box>
          </>
        )}
        {!isMobile && (
          <IconButton onClick={() => setCollapsed((c) => !c)} sx={{ ml: collapsed ? 'auto' : 0, mr: collapsed ? 'auto' : 0 }}>
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>
      <List>
        {navItems.map(({ label: itemLabel, icon: Icon, href }) => {
          const button = (
            <ListItemButton
              key={href}
              selected={pathname === href}
              onClick={() => handleNavigate(href)}
              sx={{ justifyContent: collapsed && !isMobile ? 'center' : 'flex-start', px: collapsed && !isMobile ? 1.5 : 2 }}
            >
              <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 'auto' : 40, justifyContent: 'center' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {(!collapsed || isMobile) && <ListItemText primary={itemLabel} />}
            </ListItemButton>
          );

          return collapsed && !isMobile ? (
            <Tooltip key={href} title={itemLabel} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>
    </>
  );

  if (isMobile) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', top: 0 }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <IconButton onClick={() => setMobileOpen(true)} edge="start">
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center', mx: 1 }}>
              {label}
            </Typography>
            <UserButton />
          </Toolbar>
        </AppBar>

        <SwipeableDrawer
          anchor="left"
          open={mobileOpen}
          onOpen={() => setMobileOpen(true)}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          {drawerContent}
        </SwipeableDrawer>

        <Box sx={{ p: 2 }}>{children}</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: 'width 0.2s ease',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <UserButton />
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 4, flexGrow: 1, minWidth: 0 }}>{children}</Box>
      </Box>
    </Box>
  );
}