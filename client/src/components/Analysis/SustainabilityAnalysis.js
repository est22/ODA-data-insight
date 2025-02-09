import { Box, Typography, Grid } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';

function SustainabilityAnalysis({ data = [] }) {
    // Transform data for timeline chart
    const timelineData = Object.entries(
        data.reduce((acc, item) => {
            const indicators = item.indicators || {};
            Object.entries(indicators).forEach(([code, info]) => {
                if (!acc[code]) {
                    acc[code] = {
                        id: info.name || code,
                        data: []
                    };
                }
                if (info.yearly_change !== null) {
                    acc[code].data.push({
                        x: item.country,
                        y: info.yearly_change || 0
                    });
                }
            });
            return acc;
        }, {})
    ).map(([_, value]) => value);

    // Transform data for sustainability scores
    const sustainabilityScores = data.map(item => {
        const indicators = item.indicators || {};
        const validScores = Object.values(indicators)
            .filter(i => i && i.sustainability_score !== null);
        
        const avgSustainability = validScores.length > 0
            ? validScores.reduce((sum, i) => sum + (i.sustainability_score || 0), 0) / validScores.length
            : 0;

        return {
            country: item.country,
            category: item.category,
            sustainabilityScore: avgSustainability,
            investmentPerYear: (item.avg_yearly_investment || 0) / 1000000, // Convert to millions
            activeYears: item.active_years || 0
        };
    }).sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);

    return (
        <Grid container spacing={2}>
            {/* Timeline Chart */}
            <Grid item xs={12} md={6}>
                <Box sx={{ height: 400 }}>
                    <Typography variant="h6" gutterBottom align="center">
                        Yearly Progress by Indicator
                    </Typography>
                    <ResponsiveLine
                        data={timelineData}
                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{ 
                            type: 'linear',
                            min: 'auto',
                            max: 'auto',
                            stacked: false
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: -45,
                            legend: 'Country',
                            legendOffset: 36,
                            legendPosition: 'middle'
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Yearly Change (%)',
                            legendOffset: -40,
                            legendPosition: 'middle'
                        }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'column',
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: 'left-to-right',
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: 'circle',
                                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemBackground: 'rgba(0, 0, 0, .03)',
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </Box>
            </Grid>

            {/* Sustainability Score Bar Chart */}
            <Grid item xs={12} md={6}>
                <Box sx={{ height: 400 }}>
                    <Typography variant="h6" gutterBottom align="center">
                        Project Sustainability Scores
                    </Typography>
                    <ResponsiveBar
                        data={sustainabilityScores}
                        keys={['sustainabilityScore']}
                        indexBy="country"
                        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        colors={{ scheme: 'nivo' }}
                        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: -45,
                            legend: 'Country',
                            legendPosition: 'middle',
                            legendOffset: 32
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Sustainability Score',
                            legendPosition: 'middle',
                            legendOffset: -40
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                        tooltip={({ data }) => (
                            <Box sx={{ 
                                bgcolor: 'background.paper',
                                p: 1,
                                boxShadow: 1,
                                borderRadius: 1
                            }}>
                                <Typography variant="subtitle2">
                                    {data.country}
                                </Typography>
                                <Typography variant="body2">
                                    Category: {data.category}
                                </Typography>
                                <Typography variant="body2">
                                    Score: {data.sustainabilityScore.toFixed(2)}
                                </Typography>
                                <Typography variant="body2">
                                    Avg Investment: ${data.investmentPerYear.toFixed(2)}M/year
                                </Typography>
                                <Typography variant="body2">
                                    Active Years: {data.activeYears}
                                </Typography>
                            </Box>
                        )}
                    />
                </Box>
            </Grid>
        </Grid>
    );
}

export default SustainabilityAnalysis; 