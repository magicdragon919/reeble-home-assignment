import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 375, // Minimum supported width
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: '#4040E5', // WCAG AA compliant blue
      light: '#6B6BE8',
      dark: '#2C2C9E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2D2D2D', // WCAG AA compliant dark grey
      light: '#484848',
      dark: '#1A1A1A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F', // WCAG AA compliant red
      light: '#EF5350',
      dark: '#C62828',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#ED6C02', // WCAG AA compliant orange
      light: '#FF9800',
      dark: '#E65100',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32', // WCAG AA compliant green
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A', // WCAG AA compliant text color
      secondary: '#595959', // WCAG AA compliant secondary text
    },
  },
  typography: {
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          '@media (max-width:600px)': {
            padding: '8px 16px',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#3333CC',
          },
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
              borderColor: '#4040E5',
            },
            '&.Mui-error fieldset': {
              borderColor: '#D32F2F',
            },
          },
          '& .MuiFormHelperText-root': {
            marginLeft: 0,
            '&.Mui-error': {
              color: '#D32F2F',
            },
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
              borderColor: '#4040E5',
            },
            '&.Mui-error fieldset': {
              borderColor: '#D32F2F',
            },
          },
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardError: {
          backgroundColor: '#FFEBEE',
          color: '#D32F2F',
        },
        standardSuccess: {
          backgroundColor: '#E8F5E9',
          color: '#2E7D32',
        },
        standardWarning: {
          backgroundColor: '#FFF3E0',
          color: '#ED6C02',
        },
        standardInfo: {
          backgroundColor: '#E3F2FD',
          color: '#0288D1',
        },
      }
    },
  },
});

export default theme;