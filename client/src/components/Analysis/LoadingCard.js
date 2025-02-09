import React from 'react';
import { Card, CardHeader, CardContent, Box, CircularProgress } from '@mui/material';
import { Speed } from '@mui/icons-material';

const LoadingCard = ({ title }) => {
    return (
        <Card>
            <CardHeader
                title={title}
                subheader="Loading data..."
                avatar={<Speed color="primary" />}
            />
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            </CardContent>
        </Card>
    );
};

export default LoadingCard; 