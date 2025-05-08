// src/theme.ts
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// Apple HIG Inspired Colors
export const appleBlue = '#007AFF';
export const appleGray = {
  100: '#F5F5F7', // Light Background
  200: '#E5E5EA', // Borders / Separators
  300: '#D1D1D6', // Subtle UI elements
  400: '#C7C7CC', // Secondary Text / Disabled
  500: '#8E8E93', // Medium Text
  600: '#636366', // Primary Text (on light bg) / Icons
  700: '#3A3A3C', // Darker elements
  800: '#1C1C1E', // Dark Backgrounds (Code Editor)
  900: '#000000', // Pure Black (use sparingly)
};
export const appleWhite = '#FFFFFF';
export const appleError = '#FF3B30';

const theme = createTheme({
  palette: {
    mode: 'light', // Default to light mode
    primary: {
      main: appleBlue,
    },
    secondary: {
      main: appleGray[500],
    },
    error: {
      main: appleError,
    },
    background: {
      default: appleGray[100], // Light gray background
      paper: appleWhite,       // White for paper elements (cards, modals)
    },
    text: {
      primary: appleGray[800], // Dark text for readability
      secondary: appleGray[500],
      disabled: appleGray[400],
    },
    divider: appleGray[200], // Separator color
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // No ALL CAPS buttons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Consistent moderate rounding
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Translucent white
          backdropFilter: 'blur(10px)', // Frosted glass effect
          boxShadow: 'none',
          borderBottom: `1px solid ${appleGray[200]}`,
          color: appleGray[800], // Dark text on light bar
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none', // No shadow on hover either
          }
        },
        containedPrimary: {
          // Standard blue button
          '&:hover': {
             backgroundColor: '#0056b3', // Slightly darker blue on hover
          }
        },
        containedSuccess: { // Let's map success to a standard gray button
           backgroundColor: appleGray[200],
           color: appleGray[800],
           '&:hover': {
             backgroundColor: appleGray[300],
           }
        }
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          // Ensure container uses theme background if needed, often handled by parent
        },
      },
    },
    MuiPaper: { // Affects Modal, Card, etc.
      styleOverrides: {
        root: {
           backgroundImage: 'none', // Remove gradient backgrounds if any
        }
      }
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: appleBlue, // Use primary blue
        }
      }
    },
    MuiTypography: {
       styleOverrides: {
          gutterBottom: {
             marginBottom: '0.75em', // Adjust spacing if needed
          }
       }
    }
    // Add other MUI component overrides if necessary
  },
});

export default theme;