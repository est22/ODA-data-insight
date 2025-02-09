import React from 'react';
import { 
    Card, 
    CardHeader, 
    CardContent, 
    Box, 
    Typography,
    Grid,
    LinearProgress
} from '@mui/material';
import { AutoGraph } from '@mui/icons-material';
import LoadingCard from './LoadingCard';

const SustainabilityCard = React.memo(({ data }) => {
    if (!data) return <LoadingCard title="Sustainability Analysis" />;

    const { metrics, risks } = data;

    return (
        <Card>
            <CardHeader
                title="Long-term Sustainability"
                subheader="Post-project sustainability and development potential"
                avatar={<AutoGraph color="primary" />}
            />
            <CardContent>
                <Grid container spacing={3}>
                    {/* 왼쪽: 지속가능성 지표 */}
                    <Grid item xs={12} md={6}>
                        {/* 환경/사회/경제적 지속가능성 점수 */}
                        {Object.entries(metrics).map(([key, value]) => (
                            <Box key={key} sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    {key.charAt(0).toUpperCase() + key.slice(1)} Impact
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={value.score}
                                            sx={{ 
                                                height: 8, 
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: 
                                                        key === 'environmental' ? '#4CAF50' :
                                                        key === 'social' ? '#2196F3' : '#FFC107'
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {value.score}%
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Grid>

                    {/* 오른쪽: 리스크 분석 */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Risk Assessment
                        </Typography>
                        {risks.map((risk, index) => (
                            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography 
                                    variant="subtitle2" 
                                    color="primary"
                                    gutterBottom
                                >
                                    {risk.category}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Risk Level: {risk.level}
                                </Typography>
                                <Typography variant="body2">
                                    {risk.mitigation}
                                </Typography>
                            </Box>
                        ))}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});

export default SustainabilityCard; 