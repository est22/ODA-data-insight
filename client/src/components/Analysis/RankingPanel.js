import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Box } from '@mui/material';

const RankingPanel = ({ data, onCountrySelect, selectedCountry }) => {
    const sortedCountries = Object.entries(data || {})
        .sort(([, a], [, b]) => b.amount - a.amount)
        .slice(0, 10);

    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Recipient Countries Ranking
            </Typography>
            <List>
                {sortedCountries.map(([country, info], index) => (
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
                                    <Typography variant="body1">
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
        </Paper>
    );
};

export default RankingPanel; 