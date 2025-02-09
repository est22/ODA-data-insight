import React from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { 
    TrendingUp, 
    AccountTree, 
    Public 
} from '@mui/icons-material';

// Simple card component for overview statistics
function OverviewCard({ title, value, icon, subtitle, color, tooltip }) {
    const content = (
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
                <Typography 
                    variant="subtitle2" 
                    color="text.secondary"
                    sx={{
                        fontFamily: "'Roboto Condensed', sans-serif",
                        fontWeight: 700
                    }}
                >
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

    return tooltip ? (
        <Tooltip 
            title={tooltip} 
            arrow 
            placement="bottom"
            sx={{ 
                '& .MuiTooltip-tooltip': { 
                    maxWidth: '600px',
                    minWidth: '500px',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 1,
                    p: 1.5,
                    '& .MuiTooltip-arrow': {
                        color: 'background.paper'
                    }
                }
            }}
        >
            {content}
        </Tooltip>
    ) : content;
}

const formatInvestment = (amount) => {
    if (!amount) return '$0';
    
    // amount is in billions
    if (amount >= 1000000000) {
        return `$${(amount/1000000000).toFixed(2)}B`;
    }
    // amount is in millions
    return `$${(amount/1000000).toFixed(2)}M`;
};

const SummaryCards = ({ totalInvestment, totalProjects, focusSectors }) => {
    const sectorsList = Array.isArray(focusSectors) ? 
        focusSectors : 
        Object.keys(focusSectors || {});

    // investment details tooltip
    const investmentTooltip = (
        <Box>
            <Typography variant="subtitle2" gutterBottom>Total Investment:</Typography>
            <Typography variant="body2">
                ${totalInvestment?.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })} USD {' '}
                <Typography component="span" color="white" variant="caption">
                    ({formatInvestment(totalInvestment)})
                </Typography>
            </Typography>
        </Box>
    );

    const sectorTooltipContent = (
        <Box>
            <Typography variant="subtitle2" gutterBottom>Education Sectors:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2">
                    • Basic Education <Typography component="span" sx={{ fontSize: '0.75rem' }}>(학습성과를 위한 양질의 교육)</Typography>
                </Typography>
                <Typography variant="body2">
                    • Higher Education <Typography component="span" sx={{ fontSize: '0.75rem' }}>(인재양성을 위한 직업·고등교육)</Typography>
                </Typography>
                <Typography variant="body2">
                    • Digital Education <Typography component="span" sx={{ fontSize: '0.75rem' }}>(미래역량개발을 위한 디지털교육)</Typography>
                </Typography>
                
                
            </Box>
        </Box>
    );

    // number formatting
    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toLocaleString();  // add thousands separator
    };

    // project details tooltip
    const projectsTooltip = (
        <Box>
            <Typography variant="subtitle2" gutterBottom>Project Details:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                    • Total Active Projects: {totalProjects?.toLocaleString()} projects
                </Typography>
                <Typography variant="body2">
                    • Average Investment per Project: ${((totalInvestment || 0) / (totalProjects || 1)).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} USD {' '}
                    <Typography component="span" color="white" variant="caption">
                        (${((totalInvestment/1000000) / (totalProjects || 1)).toFixed(2)}M per project)
                    </Typography>
                </Typography>
                <Typography variant="body2">
                    • Sectors Covered: {sectorsList.length} areas
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <OverviewCard
                title="Total Investment"
                value={formatInvestment(totalInvestment)}
                icon={<TrendingUp />}
                subtitle="Million USD in education"
                color="#FF1493"
                tooltip={investmentTooltip}
            />
            <OverviewCard
                title="Total Projects"
                value={formatNumber(totalProjects)}
                icon={<AccountTree />}
                subtitle="Education projects"
                color="#016BB6"
                tooltip={projectsTooltip}
            />
            <Tooltip 
                title={sectorTooltipContent} 
                arrow 
                placement="bottom"
                sx={{ 
                    '& .MuiTooltip-tooltip': { 
                        maxWidth: '600px', 
                        minWidth: '500px', 
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 1,
                        p: 1.5,
                        '& .MuiTooltip-arrow': {
                            color: 'background.paper'
                        }
                    }
                }}
            >
                <Box>
                    <OverviewCard
                        title="Focus Sectors"
                        value={sectorsList.length}
                        icon={<Public />}
                        subtitle="Education sectors"
                        color="#FFD700"
                    />
                </Box>
            </Tooltip>
        </Box>
    );
};

export default SummaryCards; 