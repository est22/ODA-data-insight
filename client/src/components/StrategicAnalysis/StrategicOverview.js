import { Grid, Paper, Typography, Box, Tooltip } from '@mui/material';
import { 
    TrendingUp, 
    AccountTree, 
    Public 
} from '@mui/icons-material';

// Simple card component for overview statistics
function OverviewCard({ title, value, icon, subtitle, color }) {
    return (
        <Paper sx={{ 
            p: 1.5,
            height: '80px',
            width: '280px',
            bgcolor: 'background.paper',
            borderLeft: `3px solid ${color}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: color }}>{icon}</Box>
                <Typography variant="subtitle2" color="text.secondary">
                    {title}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Typography variant="h5">
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            </Box>
        </Paper>
    );
}

function StrategicOverview({ totalProjects, totalInvestment, sectors }) {
    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <OverviewCard
                title="Total Investment"
                value={`$${totalInvestment.toLocaleString()}M`}
                icon={<TrendingUp />}
                subtitle="Million USD in tech innovation"
                color="#FF1493"
            />
            <OverviewCard
                title="Total Projects"
                value={totalProjects}
                icon={<AccountTree />}
                subtitle="Active innovation projects"
                color="#016BB6"
            />
            <OverviewCard
                title="Focus Sectors"
                value={sectors.length}
                icon={<Public />}
                subtitle={sectors.join(', ')}
                color="#FFD700"
            />
        </Box>
    );
}

export default StrategicOverview; 