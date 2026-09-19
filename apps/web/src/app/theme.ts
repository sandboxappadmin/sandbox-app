'use client';

import { createTheme } from '@mui/material/styles';

// Standard MUI defaults, explicitly pinned to light mode for now.
// Written as a function so a dark variant / toggle can be added later
// without restructuring how the theme is built.
export function getTheme(mode: 'light' | 'dark' = 'light') {
  return createTheme({
    palette: {
      mode,
    },
  });
}

const theme = getTheme('light');

export default theme;