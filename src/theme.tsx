import { createTheme } from '@mui/material/styles';

export const appleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // Apple’s signature blue
    },
    background: {
      default: '#F5F5F7', // Light gray background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D1D1F', // Dark text for contrast
      secondary: '#6E6E73', // Gray for secondary text
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '8px 16px',
          transition: 'background-color 0.3s ease',
          '&:hover': {
            backgroundColor: '#005BB5', // Darker blue on hover
          },
        },
        contained: {
          backgroundColor: '#007AFF',
          color: '#FFFFFF',
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #E5E5EA',
          boxShadow: 'none',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          padding: '0 16px',
        },
      },
    },
  },
});