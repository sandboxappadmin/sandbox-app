'use client';

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
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import BoltIcon from '@mui/icons-material/Bolt';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { UserButton } from '@clerk/nextjs';

const DRAWER_WIDTH = 240;

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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <IconButton onClick={() => router.push('/desktop')} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
        </Toolbar>
        <List>
          {navItems.map(({ label: itemLabel, icon: Icon, href }) => (
            <ListItemButton
              key={href}
              selected={pathname === href}
              onClick={() => router.push(href)}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={itemLabel} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
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

        <Box sx={{ p: 4 }}>{children}</Box>
      </Box>
    </Box>
  );
}