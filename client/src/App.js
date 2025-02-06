import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';

// Create Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
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
                <Dashboard />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
