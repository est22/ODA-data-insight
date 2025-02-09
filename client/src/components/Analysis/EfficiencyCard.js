import React from 'react';
import { 
    Card, 
    CardHeader, 
    CardContent, 
    Box, 
    Typography,
    Grid
} from '@mui/material';
import { Speed } from '@mui/icons-material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import LoadingCard from './LoadingCard';

const EfficiencyCard = React.memo(({ data }) => {
    if (!data) return <LoadingCard title="Investment Efficiency" />;

    const { metrics } = data;

    return (
        <Card>
            <CardHeader
                title="Investment Efficiency"
                subheader="Analysis of investment impact on education indicators"
                avatar={<Speed color="primary" />}
            />
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h4" sx={{ textAlign: 'center', color: 'primary.main' }}>
                                {metrics.overall}%
                            </Typography>
                            <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
                                Overall Efficiency
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={metrics.trends}>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="efficiency" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {metrics.costEffectiveness.map((item, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" color="primary">
                                    {item.category}
                                </Typography>
                                <Typography variant="h6">
                                    {item.score}% Efficiency
                                </Typography>
                            </Box>
                        ))}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});

export default EfficiencyCard; 