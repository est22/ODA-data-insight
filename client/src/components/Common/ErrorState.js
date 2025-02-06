import { Box, Typography, Button } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

function ErrorState({ error }) {
  // Handle page refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center'
      }}
    >
      <ErrorIcon 
        sx={{ 
          fontSize: 60, 
          mb: 2,
          color: 'error.main'
        }} 
      />
      <Typography variant="h5" gutterBottom>
        Error Loading Data
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {error?.message || 'An unexpected error occurred'}
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleRefresh}
      >
        Try Again
      </Button>
    </Box>
  );
}

export default ErrorState; 