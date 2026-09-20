'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import BoltIcon from '@mui/icons-material/Bolt';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
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

  const navItems = [
    { label: 'Dashboard', icon: DashboardIcon, href: `/niche/${slug}/dashboard` },
    { label: 'Contacts', icon: PeopleIcon, href: `/niche/${slug}/contacts` },
    { label: 'Pipelines', icon: ViewKanbanIcon, href: `/niche/${slug}/pipelines` },
    { label: 'Workflows', icon: BoltIcon, href: `/niche/${slug}/workflows` },
    { label: 'Settings', icon: SettingsIcon, href: `/niche/${slug}/settings` },
  ];

    const [collapsed, setCollapsed] = useState(false);
  const categoryLabel = getNicheBySlug(slug)?.label ?? '';
  const drawerWidth = collapsed ? MINI_WIDTH : DRAWER_WIDTH;
  
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
                <Toolbar sx={{ px: collapsed ? 1 : 2, alignItems: collapsed ? 'center' : 'flex-start', pt: collapsed ? 1 : 1.5, pb: collapsed ? 1 : 1.5 }}>
          {!collapsed && (
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
          <IconButton onClick={() => setCollapsed((c) => !c)} sx={{ ml: collapsed ? 'auto' : 0, mr: collapsed ? 'auto' : 0 }}>
            <MenuIcon fontSize="small" />
          </IconButton>
        </Toolbar>
        <List>
          {navItems.map(({ label: itemLabel, icon: Icon, href }) => {
            const button = (
              <ListItemButton
                key={href}
                selected={pathname === href}
                onClick={() => router.push(href)}
                sx={{ justifyContent: collapsed ? 'center' : 'flex-start', px: collapsed ? 1.5 : 2 }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40, justifyContent: 'center' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {!collapsed && <ListItemText primary={itemLabel} />}
              </ListItemButton>
            );

            return collapsed ? (
              <Tooltip key={href} title={itemLabel} placement="right">
                {button}
              </Tooltip>
            ) : (
              button
            );
          })}
        </List>
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