import { Box, Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import StrategicOverview from '../components/StrategicAnalysis/StrategicOverview';
import CountryMap from '../components/StrategicAnalysis/CountryMap';
import CountryDetail from '../components/StrategicAnalysis/CountryDetail';
import LoadingState from '../components/Common/LoadingState';
import ErrorState from '../components/Common/ErrorState';
import RankingPanel from '../components/StrategicAnalysis/RankingPanel';

function Dashboard() {
    // Add state for selected country
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Strategic goals data
    const { data: strategicData, error: strategicError } = useQuery(
        ['strategicGoals'],
        async () => {
            const response = await fetch('/strategic-goals');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        }
    );

    // Country investment data
    const { data: countryData, error: countryError } = useQuery(
        ['countryInvestments'],
        async () => {
            const response = await fetch('/country-investments');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        }
    );

    if (strategicError || countryError) return <ErrorState error={strategicError || countryError} />;

    // Handle country selection from either map or ranking list
    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                {/* Header row with title and stats */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4,
                    mb: 3
                }}>
                    {/* Title */}
                    <Typography variant="h4" sx={{ flex: 1 }}>
                        Tech Innovation SDG Analysis
                    </Typography>

                    {/* Stats banner */}
                    <Box sx={{ display: 'flex', gap: 2, flex: 2 }}>
                        {strategicData && (
                            <StrategicOverview 
                                totalProjects={strategicData.metadata.totalProjects}
                                totalInvestment={strategicData.metadata.totalInvestment}
                                sectors={strategicData.metadata.sectors}
                            />
                        )}
                    </Box>
                </Box>
                
                {/* Main content */}
                {strategicData ? (
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 3,
                        height: 'calc(100vh - 180px)'
                    }}>
                        <Box sx={{ flex: 3 }}>
                            {selectedCountry ? (
                                <CountryDetail 
                                    country={selectedCountry}
                                    onClose={() => setSelectedCountry(null)}
                                />
                            ) : (
                                <CountryMap 
                                    data={countryData} 
                                    onCountrySelect={handleCountrySelect}
                                />
                            )}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <RankingPanel 
                                data={countryData}
                                onCountrySelect={handleCountrySelect}
                                selectedCountry={selectedCountry}
                            />
                        </Box>
                    </Box>
                ) : <LoadingState />}
            </Box>
        </Container>
    );
}

export default Dashboard; 