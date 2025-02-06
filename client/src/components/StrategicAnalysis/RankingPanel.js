import { Box, Paper, Typography, TextField, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Search } from '@mui/icons-material';
import { useState } from 'react';

const RankingList = styled(Box)({
    height: 'calc(100% - 40px)',
    overflowY: 'auto',
    '& .rank-item': {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        cursor: 'pointer',
        '&:hover': {
            background: 'rgba(0,0,0,0.02)'
        },
        '&.selected': {
            background: 'rgba(0,0,0,0.05)',
            borderLeft: '3px solid #016BB6'
        }
    }
});

function RankingPanel({ data, onCountrySelect, selectedCountry }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter and sort countries
    const rankings = Object.entries(data || {})
        .filter(([country, info]) => 
            info && info.amount && 
            country.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(([country, info]) => ({
            country,
            amount: info.amount
        }))
        .sort((a, b) => b.amount - a.amount);

    return (
        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
                Investment Rankings
            </Typography>
            
            {/* Search box */}
            <TextField
                size="small"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />

            <RankingList>
                {rankings.map((item, index) => (
                    <Box 
                        key={item.country}
                        className={`rank-item ${selectedCountry === item.country ? 'selected' : ''}`}
                        onClick={() => onCountrySelect(item.country)}
                    >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography sx={{ width: 32, color: '#666' }}>
                                {index + 1}
                            </Typography>
                            <Typography>{item.country}</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 500 }}>
                            ${item.amount.toLocaleString()}
                        </Typography>
                    </Box>
                ))}
            </RankingList>
        </Paper>
    );
}

export default RankingPanel; 