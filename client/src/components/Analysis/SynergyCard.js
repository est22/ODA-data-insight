import React from 'react';
import { 
    Card, 
    CardHeader, 
    CardContent, 
    Box, 
    Typography,
    Grid
} from '@mui/material';
import { Hub } from '@mui/icons-material';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import LoadingCard from './LoadingCard';

const SynergyCard = React.memo(({ data }) => {
    if (!data) return <LoadingCard title="Cross-sector Integration" />;

    const { metrics, distribution, opportunities } = data;

    return (
        <Card>
            <CardHeader
                title="Cross-sector Integration"
                subheader="Analysis of synergies between education sectors"
                avatar={<Hub color="primary" />}
            />
            <CardContent>
                <Grid container spacing={3}>
                    {/* investment balance chart */}
                    <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={distribution}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="category" />
                                <PolarRadiusAxis domain={[0, 100]} />
                                <Radar dataKey="percentage" fill="#8884d8" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Grid>
                    
                    {/* synergy score and insights */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h4" sx={{ textAlign: 'center', color: 'primary.main' }}>
                                {metrics.balanceScore}%
                            </Typography>
                            <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
                                Synergy Score
                            </Typography>
                        </Box>
                        
                        {opportunities.map((insight, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" color="primary">
                                    {insight.title}
                                </Typography>
                                <Typography variant="body2">
                                    {insight.description}
                                </Typography>
                            </Box>
                        ))}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});

export default SynergyCard; 