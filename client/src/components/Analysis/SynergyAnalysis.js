import { Box, Typography, Grid } from '@mui/material';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveHeatMap } from '@nivo/heatmap';

function SynergyAnalysis({ data = [] }) {
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No data available</Typography>
            </Box>
        );
    }

    // Transform data for radar chart - safer data transformation
    const radarData = data
        .filter(item => item && item.country) // filter valid data only
        .map(item => ({
            country: item.country,
            'Basic Education': parseFloat(item.basic_edu_score) || 0,
            'Digital Education': parseFloat(item.digital_edu_score) || 0,
            'Higher Education': parseFloat(item.higher_edu_score) || 0,
            investment_distribution: item.investment_distribution || {}
        }));

    if (radarData.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Invalid data format</Typography>
            </Box>
        );
    }

    // Calculate correlation data for heatmap - Nivo HeatMap 형식에 맞게 수정
    const correlationData = radarData
        .map(country => {
            try {
                const scores = {
                    'Basic Education': country['Basic Education'] || 0,
                    'Digital Education': country['Digital Education'] || 0,
                    'Higher Education': country['Higher Education'] || 0
                };
                
                const investments = country.investment_distribution || {};
                const total = Object.values(investments).reduce((a, b) => a + b, 0) || 1;
                
                // HeatMap data format
                return {
                    id: country.country,
                    data: [{
                        x: 'Investment Impact',
                        y: (
                            (scores['Basic Education'] * (investments['학습성과를 위한 양질의 교육'] || 0)) +
                            (scores['Digital Education'] * (investments['미래역량개발을 위한 디지털교육'] || 0)) +
                            (scores['Higher Education'] * (investments['인재양성을 위한 직업·고등교육'] || 0))
                        ) / total
                    }]
                };
            } catch (error) {
                console.error('Error processing country data:', error);
                return null;
            }
        })
        .filter(Boolean);

    return (
        <Grid container spacing={2}>
            {/* Radar Chart */}
            <Grid item xs={12} md={6}>
                <Box sx={{ height: 400 }}>
                    <Typography variant="h6" gutterBottom align="center">
                        Education Category Balance
                    </Typography>
                    <ResponsiveRadar
                        data={radarData}
                        keys={['Basic Education', 'Digital Education', 'Higher Education']}
                        indexBy="country"
                        maxValue="auto"
                        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
                        curve="linearClosed"
                        borderWidth={2}
                        borderColor={{ from: 'color' }}
                        gridLevels={5}
                        gridShape="circular"
                        gridLabelOffset={36}
                        enableDots={true}
                        dotSize={8}
                        dotColor={{ theme: 'background' }}
                        dotBorderWidth={2}
                        dotBorderColor={{ from: 'color' }}
                        enableDotLabel={true}
                        dotLabel="value"
                        dotLabelYOffset={-12}
                        colors={{ scheme: 'nivo' }}
                        fillOpacity={0.25}
                        blendMode="multiply"
                        animate={true}
                        motionConfig="gentle"
                    />
                </Box>
            </Grid>

            {/* Investment Impact Heatmap */}
            <Grid item xs={12} md={6}>
                <Box sx={{ height: 400 }}>
                    <Typography variant="h6" gutterBottom align="center">
                        Investment Impact Analysis
                    </Typography>
                    <ResponsiveHeatMap
                        data={correlationData}
                        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
                        valueFormat=">-.2f"
                        axisTop={null}
                        axisRight={null}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Country',
                            legendPosition: 'middle',
                            legendOffset: -72
                        }}
                        colors={{
                            type: 'sequential',
                            scheme: 'blues'
                        }}
                    />
                </Box>
            </Grid>
        </Grid>
    );
}

export default SynergyAnalysis; 