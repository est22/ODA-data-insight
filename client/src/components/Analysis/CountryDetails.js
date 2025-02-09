import React, { useState } from 'react';
import { Box, Paper, Typography, List,ListItem,ListItemText,Divider,Grid,Chip, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF1493'];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                p: 1.5,
                border: '1px solid #ccc',
                borderRadius: 1,
                minWidth: '200px',  
                boxShadow: 1
            }}
        >
            <Typography variant="body2" sx={{ mb: 0.5 }}>
                {payload[0].payload.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Projects: {payload[0].value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Investment: ${payload[0].payload.amount.toLocaleString()}
            </Typography>
        </Box>
    );
};

const IndicatorChart = ({ metrics }) => {
    const chartData = metrics.map(m => ({
        subject: m.name,
        value: m.value,
        fullMark: 100
    }));

    // split text function for word wrap (radar chart label)
    const splitText = (text) => {
        const words = text.split(' ');
        const midpoint = Math.ceil(words.length / 2);
        
        if (words.length <= 2) return [text]; // short text is one line
        
        return [
            words.slice(0, midpoint).join(' '),
            words.slice(midpoint).join(' ')
        ];
    };

    return (
        <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
                <RadarChart data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={(props) => {
                            const { x, y, payload } = props;
                            const lines = splitText(payload.value);
                            
                            return (
                                <text
                                    x={x}
                                    y={y - (lines.length > 1 ? 10 : 0)} // adjust position when two lines
                                    textAnchor="middle"
                                    fill="#000"
                                    fontSize="0.65rem"
                                >
                                    {lines.map((line, i) => (
                                        <tspan
                                            key={i}
                                            x={x}
                                            dy={i === 0 ? 0 : 12} // adjust line spacing
                                        >
                                            {line}
                                        </tspan>
                                    ))}
                                </text>
                            );
                        }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                        name="Indicators"
                        dataKey="value"
                        stroke="#FF1493"
                        fill="#FF1493"
                        fillOpacity={0.5}
                    />
                    <Tooltip 
                        cursor={false}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <Box sx={{ 
                                        bgcolor: 'background.paper',
                                        p: 1.5,
                                        border: '1px solid #ccc',
                                        borderRadius: 1,
                                        boxShadow: 1
                                    }}>
                                        <Typography variant="body2">
                                            {payload[0].payload.subject}
                                        </Typography>
                                        <Typography variant="body2" color="primary">
                                            {payload[0].value}%
                                        </Typography>
                                    </Box>
                                );
                            }
                            return null;
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </Box>
    );
};

const sectorNameMap = {
    '학습성과를 위한 양질의 교육': 'Basic Education',
    '인재양성을 위한 직업·고등교육': 'Higher Education',
    '미래역량개발을 위한 디지털교육': 'Digital Education'
    
    
};

const CountryDetails = ({ country, data, onClose }) => {
    const [selectedYear, setSelectedYear] = useState('all');
    


    // process sector data
    const sectorData = React.useMemo(() => {
        if (!data || !data.recentProjects || !Array.isArray(data.recentProjects)) return [];
        
        // projects by sector
        const sectorCounts = data.recentProjects.reduce((acc, project) => {
            const sector = project.sector.trim();
            acc[sector] = (acc[sector] || 0) + 1;
            return acc;
        }, {});

        // convert to chart data format
        return Object.entries(sectorCounts).map(([name, value]) => ({ 
            name, 
            value,
            amount: data.recentProjects
                .filter(p => p.sector.trim() === name)
                .reduce((sum, p) => sum + p.amount, 0)
        }));
    }, [data]);

    // process project data
    const projectsList = React.useMemo(() => {
        if (!data || !data.recentProjects) return [];
        return Array.isArray(data.recentProjects) ? data.recentProjects : [];
    }, [data]);

    // project list filtering logic
    const filteredProjects = React.useMemo(() => {
        if (!projectsList.length) return [];
        return selectedYear === 'all' 
            ? projectsList 
            : projectsList.filter(project => project.year === selectedYear);
    }, [projectsList, selectedYear]);

    // load realtime analysis data
    const { data: analysisData, isLoading: analysisLoading } = useQuery(
        ['realtime-analysis', country], 
        async () => {
            const response = await fetch(`/analysis/realtime/${country}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Analysis request failed');
            }
            return response.json();
        },
        { 
            retry: false,
            onError: (error) => {
                console.error('Analysis error:', error);
            }
        }
    );

    // if no data, render nothing
    if (!data) return null;

    // excluded countries list
    const excludedCountries = ['Other regions or multiple countries (unassigned)'];
    const isExcludedCountry = excludedCountries.includes(country);

    // insight generation function
    const generateInsight = (category, metrics) => {
        const mainMetric = metrics[0];
        const avgValue = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;

        switch(category) {
            case 'basic_education':
                return `Basic education shows ${mainMetric.value > 75 ? 'strong' : 'moderate'} performance with ${mainMetric.value}% completion rate. ${
                    avgValue > 70 ? 'Overall indicators suggest effective basic education system.' : 'There is room for improvement in basic education metrics.'
                }`;
            case 'digital_education':
                return `Digital infrastructure is ${mainMetric.value > 60 ? 'well-developed' : 'developing'} with ${mainMetric.value}% internet penetration. ${
                    avgValue > 50 ? 'Digital education readiness is positive.' : 'Digital education infrastructure needs strengthening.'
                }`;
            case 'higher_education':
                return `Higher education enrollment at ${mainMetric.value}% indicates ${mainMetric.value > 40 ? 'good' : 'limited'} access. ${
                    avgValue > 35 ? 'Tertiary education system shows promise.' : 'Higher education sector requires attention.'
                }`;
            default:
                return '';
        }
    };

    // ROI Analysis component
    const ROIAnalysis = ({ category, metrics, country }) => {
        // API call
        const { data: efficiencyData, isLoading: efficiencyLoading } = useQuery(
            ['efficiency', country], 
            async () => {
                const response = await fetch(`/analysis/efficiency?country=${country}`);
                if (!response.ok) throw new Error('Failed to fetch efficiency data');
                return response.json();
            }
        );

        const { data: synergyData, isLoading: synergyLoading } = useQuery(
            ['synergy', country], 
            async () => {
                const response = await fetch(`/analysis/synergy?country=${country}`);
                if (!response.ok) throw new Error('Failed to fetch synergy data');
                return response.json();
            }
        );

        const { data: sustainabilityData, isLoading: sustainabilityLoading } = useQuery(
            ['sustainability', country], 
            async () => {
                const response = await fetch(`/analysis/sustainability?country=${country}`);
                if (!response.ok) throw new Error('Failed to fetch sustainability data');
                return response.json();
            }
        );

        // loading or error
        if (efficiencyLoading || synergyLoading || sustainabilityLoading) {
            return <CircularProgress size={20} />;
        }

        // ROI calculation function
        const calculateROI = () => {
            if (!efficiencyData?.data || !synergyData?.data || !sustainabilityData?.data) {
                return null;
            }

            // extract scores for each category
            const efficiency = efficiencyData.data[category]?.efficiency_score ?? 0;
            const synergy = synergyData.data[category]?.synergy_score ?? 0;
            const sustainability = sustainabilityData.data[category]?.sustainability_score ?? 0;

            // World Bank indicator validation
            if (!metrics?.length || metrics.some(m => m.value === undefined)) {
                return null;
            }

            // average improvement rate calculation
            const wbImprovement = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;

            return {
                efficiency_score: efficiency,
                synergy_score: synergy,
                sustainability_score: sustainability,
                overall_roi: (efficiency * 0.4 + synergy * 0.3 + sustainability * 0.3) * (wbImprovement / 100)
            };
        };

        const roi = calculateROI();
        if (!roi) return null;

        return (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 20, 147, 0.05)', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#FF1493' }}>
                    ROI Analysis
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Typography variant="caption" display="block">Efficiency</Typography>
                        <Typography variant="h6" color="primary">
                            {roi.efficiency_score.toFixed(1)}%
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="caption" display="block">Synergy</Typography>
                        <Typography variant="h6" color="primary">
                            {roi.synergy_score.toFixed(1)}%
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="caption" display="block">Sustainability</Typography>
                        <Typography variant="h6" color="primary">
                            {roi.sustainability_score.toFixed(1)}%
                        </Typography>
                    </Grid>
                </Grid>

                {/* Overall ROI bar chart */}
                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Overall ROI: {roi.overall_roi.toFixed(1)}%
                    </Typography>
                    <Box sx={{ 
                        width: '100%', 
                        height: '24px', 
                        bgcolor: 'rgba(255, 20, 147, 0.1)',
                        borderRadius: 1,
                        overflow: 'hidden'
                    }}>
                        <Box 
                            sx={{ 
                                width: `${Math.min(100, roi.overall_roi)}%`,
                                height: '100%',
                                bgcolor: '#FF1493',
                                transition: 'width 1s ease-in-out'
                            }} 
                        />
                    </Box>
                    <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ mt: 1, display: 'block' }}
                    >
                        {roi.overall_roi > 75 ? 'Exceptional' : roi.overall_roi > 50 ? 'Good' : 'Moderate'} ROI
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {generateROIInsight(roi, category)}
                </Typography>
            </Box>
        );
    };

    // ROI insight generation function
    const generateROIInsight = (roi, category) => {
        const { efficiency_score, synergy_score, sustainability_score, overall_roi } = roi;
        
        let insight = '';
        if (overall_roi > 75) {
            insight = `Exceptional ROI in ${category} with strong performance across all metrics.`;
        } else if (overall_roi > 50) {
            insight = `Good ROI in ${category} with balanced performance.`;
        } else {
            insight = `Moderate ROI in ${category} with potential for improvement.`;
        }

        // identify strongest/weakest areas
        const scores = [
            { name: 'Efficiency', value: efficiency_score },
            { name: 'Synergy', value: synergy_score },
            { name: 'Sustainability', value: sustainability_score }
        ];
        const strongest = scores.reduce((a, b) => a.value > b.value ? a : b);
        const weakest = scores.reduce((a, b) => a.value < b.value ? a : b);

        insight += ` ${strongest.name} shows the strongest performance at ${strongest.value.toFixed(1)}%, while ${weakest.name} at ${weakest.value.toFixed(1)}% indicates room for enhancement.`;

        return insight;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ 
                backgroundColor: 'background.paper',
                pb: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Box>
                    <Typography 
                        variant="h5" 
                        gutterBottom
                        sx={{
                            fontFamily: "'Roboto Condensed', sans-serif",
                            fontWeight: 700,
                            letterSpacing: 0.5
                        }}
                    >
                        {country}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Total Investment: ${(data.amount/1000000).toFixed(2)}M | Projects: {data.projects}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* investment trends */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                                fontFamily: "'Roboto Condensed', sans-serif",
                                fontWeight: 700,
                                letterSpacing: 0.5
                            }}
                        >
                            Investment Trends
                        </Typography>
                        {Array.isArray(data.trends) && data.trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.trends}>
                                    <XAxis 
                                        dataKey="year" 
                                        style={{ fontSize: '0.75rem' }}  
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`}
                                        style={{ fontSize: '0.75rem' }}
                                    />
                                    <Tooltip formatter={(value) => [`$${(value/1000000).toFixed(2)}M`, "Investment"]} />
                                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No trend data available</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* sector distribution */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                                fontFamily: "'Roboto Condensed', sans-serif",
                                fontWeight: 700,
                                letterSpacing: 0.5
                            }}
                        >
                            Sector Distribution
                        </Typography>
                        {sectorData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={sectorData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {sectorData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={COLORS[index % COLORS.length]} 
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Box sx={{ mt: 2 }}>
                                    {sectorData.map((entry, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                    mr: 1,
                                                    flexShrink: 0
                                                }}
                                            />
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontSize: '0.75rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%'
                                                }}
                                            >
                                                <Box component="span" sx={{ fontWeight: 'bold' }}>
                                                    {sectorNameMap[entry.name]}
                                                </Box>
                                                {` (${entry.name})`}
                                                <br />
                                                ({entry.value} projects, ${(entry.amount/1000000).toFixed(2)}M)
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No sector data available
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* recent projects list */}
                <Grid item xs={12}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ mb: 2 }}>
                            <Typography 
                                variant="h6" 
                                gutterBottom 
                                sx={{
                                    fontFamily: "'Roboto Condensed', sans-serif",
                                    fontWeight: 700,
                                    letterSpacing: 0.5
                                }}
                            >
                                Recent Projects
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                    label="All Years"
                                    onClick={() => setSelectedYear('all')}
                                    color={selectedYear === 'all' ? 'primary' : 'default'}
                                    sx={{ 
                                        bgcolor: selectedYear === 'all' ? '#FF1493' : 'default',
                                        color: selectedYear === 'all' ? 'white' : 'inherit',
                                        '&:hover': {
                                            bgcolor: selectedYear === 'all' ? '#FF1493' : 'default'
                                        }
                                    }}
                                />
                                {Array.from(new Set(projectsList.map(p => p.year)))
                                    .sort((a, b) => b - a)  // latest year first
                                    .map(year => (
                                        <Chip
                                            key={year}
                                            label={year}
                                            onClick={() => setSelectedYear(year)}
                                            sx={{ 
                                                bgcolor: selectedYear === year ? '#FF1493' : 'default',
                                                color: selectedYear === year ? 'white' : 'inherit',
                                                '&:hover': {
                                                    bgcolor: selectedYear === year ? '#FF1493' : 'default'
                                                }
                                            }}
                                        />
                                    ))
                                }
                            </Box>
                        </Box>
                        {filteredProjects.length > 0 ? (
                            <List sx={{ 
                                maxHeight: '300px',
                                overflow: 'auto'
                            }}>
                                {filteredProjects.map((project, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={project.name}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography component="span" variant="body2" color="text.primary">
                                                            ${project.amount.toLocaleString()}
                                                        </Typography>
                                                        {` — ${project.year} | ${sectorNameMap[project.sector]} (${project.sector})`}
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        {index < filteredProjects.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No projects available for selected year
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* World Bank analysis results - exception handling added */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700 }}>
                    Education Development Analysis
                </Typography>
                {isExcludedCountry ? (
                    <Alert severity="info">
                        Analysis is not available for unassigned or multiple regions.
                    </Alert>
                ) : analysisLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : analysisData && Object.keys(analysisData).length > 0 ? (
                    <Grid container spacing={3}>
                        {Object.entries(analysisData).map(([category, metrics]) => (
                            <Grid item xs={12} md={4} key={category}>
                                <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom 
                                        sx={{ 
                                            color: '#FF1493', 
                                            mb: 2,
                                            fontSize: '1.1rem', 
                                            fontFamily: "'Roboto Condensed', sans-serif",
                                            fontWeight: 700,
                                            letterSpacing: 0.5
                                        }}
                                    >
                                        {category === 'basic_education' && 'Basic Education'}
                                        {category === 'digital_education' && 'Digital Education'}
                                        {category === 'higher_education' && 'Higher Education'}
                                    </Typography>

                                    {/* Radar Chart */}
                                    <IndicatorChart metrics={metrics} />

                                    {/* Key Metrics */}
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Key Metrics
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {metrics.slice(0, 3).map((metric, idx) => (
                                                <Grid item xs={4} key={idx}>
                                                    <Paper 
                                                        elevation={0} 
                                                        sx={{ 
                                                            p: 1, 
                                                            bgcolor: 'rgba(255, 20, 147, 0.1)',
                                                            textAlign: 'center',
                                                            height: '100%'
                                                        }}
                                                    >
                                                        <Typography variant="caption" display="block">
                                                            {metric.name}
                                                        </Typography>
                                                        <Typography variant="h6" color="primary">
                                                            {metric.value}%
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ({metric.year})
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    {/* Insights */}
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {generateInsight(category, metrics)}
                                        </Typography>
                                    </Box>

                                    {/* ROI Analysis */}
                                    <ROIAnalysis category={category} metrics={metrics} country={country} />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Alert severity="info">
                        World Bank data is not available for this country. Analysis cannot be performed.
                    </Alert>
                )}
            </Box>
        </Box>
    );
};

export default CountryDetails; 