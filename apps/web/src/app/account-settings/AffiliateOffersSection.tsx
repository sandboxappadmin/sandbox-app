'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AFFILIATE_OFFERS } from '@/lib/affiliate-offers';

export default function AffiliateOffersSection() {
  const categories = Array.from(new Set(AFFILIATE_OFFERS.map((o) => o.category)));

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
        Recommended Tools
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Extra tools and certifications we recommend alongside Sandbox App.
      </Typography>

      {categories.map((category) => (
        <Box key={category} sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
            {category}
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {AFFILIATE_OFFERS.filter((o) => o.category === category).map((offer) => (
              <Box
                key={offer.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {offer.name} — {offer.price}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {offer.description}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Paper>
  );
}