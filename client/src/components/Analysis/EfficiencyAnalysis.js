import { Box, Typography } from '@mui/material';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { scaleLinear } from 'd3-scale';

function EfficiencyAnalysis({ data }) {
    // Transform data for scatter plot
    const scatterData = [
        {
            id: 'Investment Efficiency',
            data: data.map(item => ({
                x: item.total_investment / 1000000, // Convert to millions
                y: item.avg_improvement,
                country: item.country,
                category: item.category,
                projectCount: item.project_count,
                efficiency: item.efficiency_score
            }))
        }
    ];

    // Calculate bubble size scale
    const maxProjects = Math.max(...data.map(d => d.project_count));
    const sizeScale = scaleLinear()
        .domain([0, maxProjects])
        .range([5, 20]);

    return (
        <Box sx={{ height: 400 }}>
            <ResponsiveScatterPlot
                data={scatterData}
                margin={{ top: 20, right: 140, bottom: 70, left: 90 }}
                xScale={{ type: 'linear', min: 0 }}
                yScale={{ type: 'linear', min: 0 }}
                blendMode="multiply"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Total Investment (Million USD)',
                    legendPosition: 'middle',
                    legendOffset: 46
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Average Improvement Rate (%)',
                    legendPosition: 'middle',
                    legendOffset: -60
                }}
                nodeSize={d => sizeScale(d.data.projectCount)}
                colors={{ scheme: 'set2' }}
                tooltip={({ node }) => (
                    <Box sx={{ 
                        bgcolor: 'background.paper',
                        p: 2,
                        boxShadow: 1,
                        borderRadius: 1
                    }}>
                        <Typography variant="subtitle1" gutterBottom>
                            {node.data.country}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Category: {node.data.category}
                        </Typography>
                        <Typography variant="body2">
                            Investment: ${node.data.x.toFixed(2)}M
                        </Typography>
                        <Typography variant="body2">
                            Improvement: {node.data.y.toFixed(2)}%
                        </Typography>
                        <Typography variant="body2">
                            Projects: {node.data.projectCount}
                        </Typography>
                        <Typography variant="body2" color="primary">
                            Efficiency Score: {node.data.efficiency.toFixed(3)}
                        </Typography>
                    </Box>
                )}
                legends={[
                    {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 130,
                        translateY: 0,
                        itemWidth: 100,
                        itemHeight: 12,
                        itemsSpacing: 5,
                        itemDirection: 'left-to-right',
                        symbolSize: 12,
                        symbolShape: 'circle',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
            />
        </Box>
    );
}

export default EfficiencyAnalysis; 