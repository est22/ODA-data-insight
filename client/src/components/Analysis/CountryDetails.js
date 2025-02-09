import React, { useState } from 'react';
import { Box, Paper, Typography, List,ListItem,ListItemText,Divider,Grid,Chip, Button, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Analytics } from '@mui/icons-material';


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

const CountryDetails = ({ country, data }) => {
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
                                    <XAxis dataKey="year" />
                                    <YAxis tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`} />
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
                                                    mr: 1
                                                }}
                                            />
                                            <Typography variant="body2">
                                                {entry.name}
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
                                                        {` — ${project.year} | ${project.sector}`}
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

            {/* World Bank analysis results */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    World Bank Education Indicators
                </Typography>
                {analysisLoading ? (
                    <CircularProgress />
                ) : analysisData ? (
                    <Grid container spacing={3}>
                        {Object.entries(analysisData).map(([category, metrics]) => (
                            <Grid item xs={12} md={4} key={category}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {category === 'basic_education' && '학습성과를 위한 양질의 교육'}
                                        {category === 'digital_education' && '미래역량개발을 위한 디지털교육'}
                                        {category === 'higher_education' && '인재양성을 위한 직업·고등교육'}
                                    </Typography>
                                    {metrics.map((metric, idx) => (
                                        <Box key={idx} sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2">
                                                {metric.name} ({metric.year})
                                            </Typography>
                                            <Typography variant="h4" color="primary">
                                                {metric.value}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {metric.description}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Alert severity="info">
                        Error occurred while analyzing the data. Please try again later.
                    </Alert>
                )}
            </Box>
        </Box>
    );
};

export default CountryDetails; 