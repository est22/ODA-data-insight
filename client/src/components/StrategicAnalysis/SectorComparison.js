import { Paper, Typography, Box } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';

function SectorComparison({ data }) {
    // Transform data for visualization
    const chartData = data.map(item => ({
        sector: item.sector,
        investment: item.total_investment_million_usd,
        projects: item.project_count,
        execution: item.execution_rate,
        countries: item.country_count
    }));

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Sector Performance Analysis
            </Typography>

            {/* Main chart container */}
            <Box sx={{ height: 400 }}>
                <ResponsiveBar
                    data={chartData}
                    keys={['investment']}
                    indexBy="sector"
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    colors={{ scheme: 'nivo' }}
                    // Custom tooltip
                    tooltip={({ value, indexValue }) => (
                        <Box sx={{ p: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
                            <Typography variant="subtitle2">
                                {indexValue}
                            </Typography>
                            <Typography>
                                Investment: ${value}M
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Projects: {chartData.find(d => d.sector === indexValue).projects}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Execution Rate: {chartData.find(d => d.sector === indexValue).execution}%
                            </Typography>
                        </Box>
                    )}
                    // Axis configuration
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Investment (Million USD)',
                        legendPosition: 'middle',
                        legendOffset: -40
                    }}
                    // Labels and legends
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 120,
                            translateY: 0,
                            itemsSpacing: 2,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 20
                        }
                    ]}
                />
            </Box>
        </Paper>
    );
}

export default SectorComparison; 