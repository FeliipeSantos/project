import { createTheme } from '@mui/material/styles';

// ─────────────────────────────────────────────────────────────────
//  FinControl — Exact Dark Dashboard Theme (Nickelfox reference)
//
//  Background:      #1E1E2E  (cool dark, blue-purple tint)
//  Icon Strip:      #171724  (darkest surface)
//  Nav Panel:       #252535  (card surface)
//  Cards:           #252535
//  Primary (teal):  #4ECDC4
//  Secondary:       #FF6B35
// ─────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E05A5A',
      light: '#F87171',
      dark: '#B91C1C',
      contrastText: '#ffffff',
    },
    background: {
      default: '#090A0E',
      paper: '#15161D',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#7E8494',
    },
    divider: 'rgba(255, 255, 255, 0.03)',
    success: { main: '#4EBE87' },
    error:   { main: '#E05A5A' },
    warning: { main: '#F4A261' },
    info:    { main: '#3B82F6' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem',  fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem',    fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.5rem',  fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem',    fontWeight: 600 },
    body1:  { fontSize: '0.95rem', lineHeight: 1.6 },
    body2:  { fontSize: '0.85rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
    caption:{ fontSize: '0.75rem' },
  },
  shape: { borderRadius: 24 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: '8px 18px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': { transform: 'translateY(-1px)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.2)',
          '&:hover': { boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)' },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #E05A5A 0%, #B91C1C 100%)',
          boxShadow: '0 4px 14px rgba(224, 90, 90, 0.2)',
          '&:hover': { boxShadow: '0 6px 20px rgba(224, 90, 90, 0.35)' },
        },
        outlinedPrimary: {
          borderColor: 'rgba(59, 130, 246, 0.4)',
          color: '#3B82F6',
          '&:hover': {
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#111217',
          border: '1px solid rgba(255, 255, 255, 0.03)',
          boxShadow: 'none',
          borderRadius: 24,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111217',
          border: '1px solid rgba(255, 255, 255, 0.03)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.04)' },
            '&:hover fieldset': { borderColor: 'rgba(59, 130, 246, 0.3)' },
            '&.Mui-focused fieldset': {
              borderColor: '#3B82F6',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.08)',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#3B82F6' },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: '#1D1E26',
          border: '1px solid rgba(255,255,255,0.04)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.08)' },
          '&.Mui-selected': { backgroundColor: 'rgba(59, 130, 246, 0.14)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(255, 255, 255, 0.03)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'transparent',
          borderBottom: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: '#111217',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 24,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#3B82F6',
            '& + .MuiSwitch-track': { backgroundColor: '#3B82F6', opacity: 0.5 },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1D1E26',
          border: '1px solid rgba(255,255,255,0.05)',
          fontSize: '0.78rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
        },
      },
    },
  },
});

export default theme;
