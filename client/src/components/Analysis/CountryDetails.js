import React from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider,
    Grid,
    Chip
} from '@mui/material';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF1493'];

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

    // if no data, render nothing
    if (!data) return null;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 3, 
                borderBottom: 1, 
                pb: 2, 
                borderColor: 'divider' 
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
                                        <Tooltip />
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
        </Box>
    );
};

export default CountryDetails; 