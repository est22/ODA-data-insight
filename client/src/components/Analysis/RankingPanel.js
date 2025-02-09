import React, { useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Box, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

const RankingPanel = ({ data, onCountrySelect, selectedCountry }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredCountries = Object.entries(data || {})
        .filter(([country]) => 
            country.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort(([, a], [, b]) => b.amount - a.amount);

    return (
        <Paper elevation={3} sx={{ 
            p: 2, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                    fontFamily: "'Roboto Condensed', sans-serif",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    fontSize: '1.1rem'
                }}
            >
                Investment Amount Ranking ($M)
            </Typography>
            
            <TextField
                fullWidth
                size="small"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />
            
            <Box sx={{ 
                overflow: 'auto',
                flex: 1  // scrollable area
            }}>
                <List>
                    {filteredCountries.map(([country, info], index) => (
                        <ListItem 
                            key={country}
                            button
                            selected={selectedCountry === country}
                            onClick={() => onCountrySelect(country)}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: '#FF1493',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#FF1493'
                                    }
                                }
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography 
                                            variant="body1"
                                            sx={{
                                                fontFamily: "'Roboto Condensed', sans-serif",
                                                fontWeight: 400
                                            }}
                                        >
                                            {index + 1}. {country}
                                        </Typography>
                                        <Typography variant="body2">
                                            ${(info.amount/1000000).toFixed(2)}M
                                        </Typography>
                                    </Box>
                                }
                                secondary={`${info.projects} projects`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Paper>
    );
};

export default RankingPanel; 