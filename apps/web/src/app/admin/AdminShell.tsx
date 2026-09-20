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
import Chip from '@mui/material/Chip';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { UserButton } from '@clerk/nextjs';

const DRAWER_WIDTH = 240;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', icon: DashboardIcon, href: '/admin' },
    { label: 'Accounts', icon: BusinessIcon, href: '/admin/accounts' },
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
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Super Admin
            </Typography>
            <Chip size="small" label="Platform-wide" color="error" variant="outlined" />
          </Box>
        </Toolbar>
        <List>
          {navItems.map(({ label, icon: Icon, href }) => (
            <ListItemButton key={href} selected={pathname === href} onClick={() => router.push(href)}>
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
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