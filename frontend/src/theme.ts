import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5e5ce6', // A nice purple/blue
    },
    secondary: {
      main: '#7e7deb',
    },
    background: {
      default: '#f73b200d', // Light grey background
      paper: '#ffffff',
    },
  },
  typography: {
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            border: 'none',
            '&.Mui-focused fieldset': {
              border: '1px solid #f73b20',
            }
          },
        }
      }
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            border: 'none',
            '&.Mui-focused fieldset': {
              border: '1px solid #f73b20',
            }
          },
        }
      }
    }
  },
});

export default theme;