import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingState() {
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100vh'
            }}
        >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
                Loading Analysis Data...
            </Typography>
        </Box>
    );
}

export default LoadingState; 