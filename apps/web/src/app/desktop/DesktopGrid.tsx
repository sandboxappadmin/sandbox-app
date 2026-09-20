'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Avatar from '@mui/material/Avatar';

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
  { slug: 'real-estate', label: 'Real Estate', icon: HomeWorkIcon },
  { slug: 'dental-med-spa', label: 'Dental & Med Spa', icon: LocalHospitalIcon },
  { slug: 'coaching', label: 'Coaches & Consultants', icon: RecordVoiceOverIcon },
  { slug: 'ecommerce', label: 'E-commerce', icon: ShoppingCartIcon },
  { slug: 'agency', label: 'Marketing Agency', icon: BusinessCenterIcon },
  { slug: 'fitness', label: 'Fitness & Gyms', icon: FitnessCenterIcon },
  { slug: 'home-services', label: 'Home Services', icon: HandymanIcon },
];

export default function DesktopGrid({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DesktopHeader isSuperAdmin={isSuperAdmin} />

      <Box sx={{ py: 6, px: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Choose a Workspace
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Select a niche to open its dashboard
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
          {NICHE_TILES.map(({ slug, label, icon: Icon }) => (
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
        </Box>
      </Box>
    </Box>
  );
}