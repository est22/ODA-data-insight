import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import { CssBaseline, Box } from '@mui/material';
import { AppProvider, useApp } from './contexts/AppContext';
import FloatingButtons from './components/common/FloatingButtons';

// Create Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// Custom theme configuration
const theme = createTheme({
    palette: {
        primary: {
            main: '#016bb6'
        }
    }
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <AppProvider>
                    <AppContent />
                </AppProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

// isDark for dark mode
function AppContent() {
    const { isDark } = useApp();
    
    return (
        <Box sx={{ 
            bgcolor: isDark ? '#000' : '#fff',
            minHeight: '100vh'
        }}>
            <CssBaseline />
            <FloatingButtons />
            <Dashboard />
        </Box>
    );
}

export default App;
