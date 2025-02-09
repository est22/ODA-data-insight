import React, { useMemo } from 'react';
import { Box, Paper, Typography, IconButton,List,ListItem,ListItemText,Divider,Grid,Chip,Stack } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import EfficiencyCard from './EfficiencyCard';
import SynergyCard from './SynergyCard';
import SustainabilityCard from './SustainabilityCard';
import { useQuery } from '@tanstack/react-query';
import { Speed, Hub, AutoGraph } from '@mui/icons-material';


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
    // year filter
    const [selectedYear, setSelectedYear] = React.useState('all');

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

    // strategic analysis
    const { data: analysisData, error } = useQuery(
        ['analysis', country],
        async () => {
            try {
                const [efficiencyRes, synergyRes, sustainabilityRes] = await Promise.all([
                    fetch(`/analysis/efficiency?country=${country}`).then(r => {
                        if (!r.ok) throw new Error('Efficiency fetch failed');
                        return r.json();
                    }),
                    fetch(`/analysis/synergy?country=${country}`).then(r => {
                        if (!r.ok) throw new Error('Synergy fetch failed');
                        return r.json();
                    }),
                    fetch(`/analysis/sustainability?country=${country}`).then(r => {
                        if (!r.ok) throw new Error('Sustainability fetch failed');
                        return r.json();
                    })
                ]);

                return {
                    efficiency: efficiencyRes.data,
                    synergy: synergyRes.data,
                    sustainability: sustainabilityRes.data
                };
            } catch (error) {
                console.error('Analysis data fetch error:', error);
                return {
                    efficiency: null,
                    synergy: null,
                    sustainability: null
                };
            }
        },
        {
            enabled: !!country,
            staleTime: 5 * 60 * 1000,
            cacheTime: 30 * 60 * 1000,
            retry: 1
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
                                    .sort((a, b) => b - a)  // 최신 연도순 정렬
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

            {/* Strategic Analysis 섹션 */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>Strategic Analysis</Typography>
                
                <Grid container spacing={2}>
                    {/* 1. Investment Efficiency - 가장 중요한 수치만 */}
                    <Grid item xs={4}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Speed color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Investment Efficiency</Typography>
                            </Box>
                            <Typography variant="h3" color="primary" align="center" sx={{ mb: 2 }}>
                                {analysisData?.efficiency?.metrics?.overall || 0}%
                            </Typography>
                            <Stack spacing={1}>
                                {analysisData?.efficiency?.metrics?.costEffectiveness?.map(item => (
                                    <Box key={item.category} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">{item.category}</Typography>
                                        <Typography variant="body2" color="primary">{item.score}%</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* 2. Synergy  */}
                    <Grid item xs={4}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Hub color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Cross-sector Integration</Typography>
                            </Box>
                            <Typography variant="h3" color="primary" align="center" sx={{ mb: 2 }}>
                                {analysisData?.synergy?.metrics?.balanceScore || 0}%
                            </Typography>
                            <Stack spacing={1}>
                                {analysisData?.synergy?.distribution?.map(item => (
                                    <Box key={item.category} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">{item.category}</Typography>
                                        <Typography variant="body2" color="primary">{item.percentage}%</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* 3. Sustainability */}
                    <Grid item xs={4}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AutoGraph color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Sustainability</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                {Object.entries(analysisData?.sustainability?.metrics || {}).map(([key, value]) => (
                                    <Box key={key} sx={{ mb: 1 }}>
                                        <Typography variant="body2">{key}</Typography>
                                        <Typography variant="h5" color="primary">{value.score}%</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default CountryDetails; 