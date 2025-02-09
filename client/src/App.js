import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import { CssBaseline } from '@mui/material';

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
                <CssBaseline />
                <Dashboard />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
