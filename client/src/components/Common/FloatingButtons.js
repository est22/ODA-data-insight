import { Box, IconButton, Tooltip } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useApp } from '../../contexts/AppContext';

const FloatingButtons = () => {
  const { isDark, setIsDark } = useApp();

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 20,
      left: 20,
      zIndex: 1000
    }}>
      <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
        <IconButton 
          onClick={() => setIsDark(!isDark)}
          sx={{
            bgcolor: 'background.paper',
            width: 40,
            height: 40,
            borderRadius: '50%',
            boxShadow: 3,
            '&:hover': {
              bgcolor: 'background.paper',
            }
          }}
        >
          {isDark ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default FloatingButtons; 