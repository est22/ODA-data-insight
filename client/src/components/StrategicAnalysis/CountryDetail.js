import { Box, Typography, IconButton, Paper, Grid } from '@mui/material';
import { Close } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import LoadingState from '../Common/LoadingState';

function CountryDetail({ country, onClose }) {
    const { data: countryDetails } = useQuery(
        ['country-details', country],
        async () => {
            const response = await fetch(`/country-details/${country}`);
            if (!response.ok) throw new Error('Failed to fetch country details');
            return response.json();
        }
    );

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">{country}</Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Box>

            {countryDetails ? (
                <>
                    <Box sx={{ height: 300, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>Investment Trend</Typography>
                        <ResponsiveContainer>
                            <LineChart data={countryDetails.yearlyData}>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                <Line 
                                    type="monotone" 
                                    dataKey="total_investment" 
                                    stroke="#8884d8" 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>

                    <Box>
                        <Typography variant="h6" gutterBottom>Key Statistics</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Projects
                                </Typography>
                                <Typography variant="h4">
                                    {countryDetails.projects}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Investment
                                </Typography>
                                <Typography variant="h4">
                                    ${countryDetails.totalInvestment.toLocaleString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </>
            ) : (
                <LoadingState />
            )}
        </Paper>
    );
}

export default CountryDetail; 