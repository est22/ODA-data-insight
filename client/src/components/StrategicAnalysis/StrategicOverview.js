import { Grid, Paper, Typography, Box, Tooltip } from '@mui/material';
import { 
    TrendingUp, 
    AccountTree, 
    Public 
} from '@mui/icons-material';

// Simple card component for overview statistics
function OverviewCard({ title, value, icon, subtitle, details }) {
    return (
        <Paper sx={{ 
            p: 2, 
            height: '120px', 
            bgcolor: 'background.paper' 
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                    mr: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main' 
                }}>
                    {icon}
                </Box>
                <Tooltip 
                    title={
                        details ? (
                            <Box sx={{ p: 1 }}>
                                {details.map((sector, idx) => (
                                    <Typography key={idx} variant="body2">
                                        {sector.sector}: ${sector.total_investment_million_usd}M 
                                        ({sector.project_count} projects)
                                    </Typography>
                                ))}
                            </Box>
                        ) : ''
                    }
                    placement="top-end"
                >
                    <Typography variant="h6">
                        {title}
                    </Typography>
                </Tooltip>
            </Box>
            <Typography variant="h4" gutterBottom>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {subtitle}
            </Typography>
        </Paper>
    );
}

function StrategicOverview({ totalProjects, totalInvestment, sectors, sectorDetails }) {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <OverviewCard
                    title="Total Investment"
                    value={`$${totalInvestment.toLocaleString()}M`}
                    icon={<TrendingUp sx={{ fontSize: 28 }} />}
                    subtitle="Million USD in tech innovation"
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <OverviewCard
                    title="Total Projects"
                    value={totalProjects}
                    icon={<AccountTree sx={{ fontSize: 28 }} />}
                    subtitle="Active innovation projects"
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <OverviewCard
                    title="Focus Sectors"
                    value={sectors.length}
                    icon={<Public sx={{ fontSize: 28 }} />}
                    subtitle={sectors.join(', ')}
                    details={sectorDetails}
                />
            </Grid>
        </Grid>
    );
}

export default StrategicOverview; 