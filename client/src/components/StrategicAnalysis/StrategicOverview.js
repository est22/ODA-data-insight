import { Grid, Paper, Typography, Box } from '@mui/material';
import { 
    TrendingUp, 
    AccountTree, 
    Public 
} from '@mui/icons-material';

function OverviewCard({ title, value, icon, subtitle }) {
    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon}
                <Typography variant="h6" sx={{ ml: 1 }}>
                    {title}
                </Typography>
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

function StrategicOverview({ totalProjects, totalInvestment, sectors }) {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <OverviewCard
                    title="Total Investment"
                    value={`$${totalInvestment.toLocaleString()}M`}
                    icon={<TrendingUp color="primary" />}
                    subtitle="Million USD in tech innovation"
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <OverviewCard
                    title="Total Projects"
                    value={totalProjects}
                    icon={<AccountTree color="primary" />}
                    subtitle="Active innovation projects"
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <OverviewCard
                    title="Focus Sectors"
                    value={sectors.length}
                    icon={<Public color="primary" />}
                    subtitle={sectors.join(', ')}
                />
            </Grid>
        </Grid>
    );
}

export default StrategicOverview; 