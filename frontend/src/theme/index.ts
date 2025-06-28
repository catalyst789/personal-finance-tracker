import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8fa4f0',
      dark: '#4a5fd8',
    },
    secondary: {
      main: '#764ba2',
      light: '#9a6bb8',
      dark: '#5a3a7a',
    },
    success: {
      main: '#00C49F',
      light: '#4dd4b8',
      dark: '#009b7a',
    },
    error: {
      main: '#FF8042',
      light: '#ffa366',
      dark: '#e65a1a',
    },
    warning: {
      main: '#FFBB28',
      light: '#ffd366',
      dark: '#e6a000',
    },
    info: {
      main: '#8884D8',
      light: '#a8a4e8',
      dark: '#6a66c8',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme; 