'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import AddIcon from '@mui/icons-material/Add';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HandymanIcon from '@mui/icons-material/Handyman';

import { openNiche } from './actions';
import DesktopHeader from './DesktopHeader';

const NICHE_TILES = [
  { slug: 'real-estate', type: 'REAL_ESTATE', label: 'Real Estate', icon: HomeWorkIcon },
  { slug: 'dental-med-spa', type: 'DENTAL_MED_SPA', label: 'Dental & Med Spa', icon: LocalHospitalIcon },
  { slug: 'coaching', type: 'COACHING', label: 'Coaches & Consultants', icon: RecordVoiceOverIcon },
  { slug: 'ecommerce', type: 'ECOMMERCE', label: 'E-commerce', icon: ShoppingCartIcon },
  { slug: 'agency', type: 'AGENCY', label: 'Marketing Agency', icon: BusinessCenterIcon },
  { slug: 'fitness', type: 'FITNESS', label: 'Fitness & Gyms', icon: FitnessCenterIcon },
  { slug: 'home-services', type: 'HOME_SERVICES', label: 'Home Services', icon: HandymanIcon },
];

type InstalledNiche = { niche: string; id: string; label: string };

export default function DesktopGrid({
  isSuperAdmin = false,
  isOwner = false,
  canManageAccount = false,
  installedNiches,
}: {
  isSuperAdmin?: boolean;
  isOwner?: boolean;
  canManageAccount?: boolean;
  installedNiches: InstalledNiche[];
}) {
  const [addOpen, setAddOpen] = useState(false);

  const installedTypes = new Set(installedNiches.map((n) => n.niche));
  const installedTiles = NICHE_TILES.filter((t) => installedTypes.has(t.type));
  const availableTiles = NICHE_TILES.filter((t) => !installedTypes.has(t.type));

  const handleInstall = (slug: string) => {
    setAddOpen(false);
    openNiche(slug);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DesktopHeader isSuperAdmin={isSuperAdmin} isOwner={isOwner} canManageAccount={canManageAccount} />

      <Box sx={{ py: 6, px: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {installedTiles.length === 0 ? 'Add your first workspace' : 'Your Workspaces'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {installedTiles.length === 0
              ? 'Choose an industry to get started'
              : 'Select a workspace, or add another anytime'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 4,
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          {installedTiles.map(({ slug, label, icon: Icon }) => (
            <ButtonBase
              key={slug}
              onClick={() => openNiche(slug)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                borderRadius: 3,
                p: 2,
                transition: 'transform 0.15s ease, background-color 0.15s ease',
                '&:hover': { bgcolor: 'action.hover', transform: 'scale(1.05)' },
              }}
            >
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                <Icon fontSize="medium" />
              </Avatar>
              <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.primary' }}>
                {label}
              </Typography>
            </ButtonBase>
          ))}

          {availableTiles.length > 0 && (
            <ButtonBase
              onClick={() => setAddOpen(true)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                borderRadius: 3,
                p: 2,
                transition: 'transform 0.15s ease, background-color 0.15s ease',
                '&:hover': { bgcolor: 'action.hover', transform: 'scale(1.05)' },
              }}
            >
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'action.selected', color: 'text.secondary' }}>
                <AddIcon fontSize="medium" />
              </Avatar>
              <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Add Niche
              </Typography>
            </ButtonBase>
          )}
        </Box>
      </Box>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a Workspace</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 2,
              mt: 1,
            }}
          >
            {availableTiles.map(({ slug, label, icon: Icon }) => (
              <ButtonBase
                key={slug}
                onClick={() => handleInstall(slug)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  borderRadius: 2,
                  p: 1.5,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                  <Icon fontSize="small" />
                </Avatar>
                <Typography variant="caption" sx={{ textAlign: 'center' }}>
                  {label}
                </Typography>
              </ButtonBase>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}