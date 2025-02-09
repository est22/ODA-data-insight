import React, { useContext } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const WorldMap = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      '& .MuiSelect-select, & .MuiInputLabel-root': {
        color: theme.palette.text.primary
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.text.primary
      }
    }}>
     
    </Box>
  );
};

export default WorldMap; 