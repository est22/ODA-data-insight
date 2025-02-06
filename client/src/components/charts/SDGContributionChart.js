import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Box, Typography, Tooltip, Skeleton } from '@mui/material';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

function SDGContributionChart({ data, isLoading }) {
    const [activeGoal, setActiveGoal] = useState(null);

    if (isLoading) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
                <Skeleton 
                    variant="circular" 
                    width={300} 
                    height={300}
                    animation="wave"
                    sx={{ mx: 'auto' }}
                />
            </Box>
        );
    }

    if (!data) return null;  // if data is not available, return null

    const chartData = {
        labels: data.map(d => `SDG ${d.goal}`),
        datasets: [{
            data: data.map(d => d.total_investment),
            backgroundColor: [
                '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21',
                '#26BDE2', '#FCC30B', '#A21942', '#FD6925', '#DD1367',
                '#FD9D24', '#BF8B2E', '#3F7E44', '#0A97D9', '#56C02B',
                '#00689D', '#19486A'
            ]
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
            legend: {
                position: 'right'
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const goalData = data[context.dataIndex];
                        const subgoals = goalData.subgoals
                            .map(sg => `${sg.subgoal}: $${sg.investment}M`)
                            .join('\n');
                        return [
                            `Total: $${goalData.total_investment}M`,
                            '-------------------',
                            ...subgoals.split('\n')
                        ];
                    }
                }
            }
        }
    };

    return (
        <Box sx={{ position: 'relative', p: 2, height: 400 }}>  {/* set height */}
            <Typography variant="h6" align="center" gutterBottom>
                SDG Investment Distribution
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>  {/* chart container */}
                <Doughnut data={chartData} options={options} />
            </Box>
        </Box>
    );
}

export default SDGContributionChart; 