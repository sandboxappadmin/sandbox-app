'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';

type Tag = { id: string; name: string };
type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  tags: Tag[];
};

export default function ContactCard({
  contact,
  tagsCell,
  onEdit,
  onDelete,
  onOpenMessages,
}: {
  contact: Contact;
  tagsCell: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onOpenMessages: () => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const name = `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || '—';

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {name}
          </Typography>
          {contact.email && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {contact.email}
            </Typography>
          )}
          {contact.phone && (
            <Typography variant="body2" color="text.secondary">
              {contact.phone}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="contact actions">
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              onOpenMessages();
            }}
          >
            <ListItemIcon>
              <ChatIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Messages</ListItemText>
          </MenuItem>
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
      <Box sx={{ mt: 1 }}>{tagsCell}</Box>
    </Paper>
  );
}