import React, { createContext, useContext, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');

  const theme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#FF1493'
      },
      background: {
        default: isDark ? '#000' : '#fff',
        paper: isDark ? '#1E1E1E' : '#fff'
      },
      text: {
        primary: isDark ? '#fff' : '#000',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
      }
    },
    components: {
      MuiSelect: {
        styleOverrides: {
          select: {
            color: isDark ? '#fff' : '#000'
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent !important',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08) !important' : 'rgba(0, 0, 0, 0.04) !important'
            }
          }
        }
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#000 !important' : '#fff !important',
            transition: 'background-color 0.5s ease, color 0.5s ease'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            transition: 'color 0.3s ease'
          }
        }
      }
    }
  });

  return (
    <AppContext.Provider value={{ isDark, setIsDark, language, setLanguage }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext); 