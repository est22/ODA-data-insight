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
    Grid
} from '@mui/material';
import { Close } from '@mui/icons-material';
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

const CountryDetails = ({ country, data, onClose }) => {


    // process sector data
    const sectorData = React.useMemo(() => {
        if (!data || !data.sectors || !Array.isArray(data.sectors)) return [];
        const sectorCounts = data.sectors.reduce((acc, sector) => {
            acc[sector.trim()] = (acc[sector.trim()] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(sectorCounts).map(([name, value]) => ({ name, value }));
    }, [data]);

    // process trend data
    const trendData = React.useMemo(() => {
        if (!data || !data.trends || !Array.isArray(data.trends)) return [];
        // sort years in descending order (latest year on the right)
        return [...data.trends].sort((a, b) => a.year - b.year);
    }, [data]);

    // process project data
    const projectsList = React.useMemo(() => {
        if (!data || !data.recentProjects) return [];
        return Array.isArray(data.recentProjects) ? data.recentProjects : [];
    }, [data]);

    // if no data, render nothing
    if (!data) return null;

    return (
        <Paper
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                maxWidth: 1000,
                maxHeight: '90vh',
                overflow: 'auto',
                p: 3,
                zIndex: 1000,
                backgroundColor: 'white',
                boxShadow: 24
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, borderBottom: 1, pb: 2, borderColor: 'divider' }}>
                <Box>
                    <Typography variant="h5" gutterBottom>{country}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Total Investment: ${(data.amount/1000000).toFixed(2)}M | Projects: {data.projects}
                    </Typography>
                </Box>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Box>

            <Grid container spacing={3}>
                {/* investment trends */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Investment Trends</Typography>
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
                        <Typography variant="h6" gutterBottom>Sector Distribution</Typography>
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
                                                {entry.name} ({entry.value} projects)
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
                        <Typography variant="h6" gutterBottom>Recent Projects</Typography>
                        {projectsList.length > 0 ? (
                            <List>
                                {projectsList.map((project, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={project.name}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography component="span" variant="body2" color="text.primary">
                                                            ${(project.amount/1000000).toFixed(2)}M
                                                        </Typography>
                                                        {` — ${project.year} | ${project.sector}`}
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        {index < projectsList.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No recent projects available
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default CountryDetails; 