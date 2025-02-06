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
                <Typography variant="h4" gutterBottom>
                    KOICA Tech Innovation Analysis
                </Typography>
                
                {strategicData ? (
                    <>
                        <Box sx={{ mb: 4 }}>
                            <StrategicOverview 
                                totalProjects={strategicData.metadata.totalProjects}
                                totalInvestment={strategicData.metadata.totalInvestment}
                                sectors={strategicData.metadata.sectors}
                                sectorDetails={strategicData.data}
                            />
                        </Box>

                        {/* 전체 높이를 제한하여 지도가 화면에 딱 맞도록 설정 */}
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 3,
                            height: 'calc(100vh - 380px)' // 상단 여백, 헤더, Overview 높이 등을 고려한 값
                        }}>
                            {/* Left: Map area */}
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

                            {/* Right: Scrollable ranking panel */}
                            <Box sx={{ flex: 1 }}>
                                <RankingPanel 
                                    data={countryData}
                                    onCountrySelect={handleCountrySelect}
                                    selectedCountry={selectedCountry}
                                />
                            </Box>
                        </Box>
                    </>
                ) : <LoadingState />}
            </Box>
        </Container>
    );
}

export default Dashboard; 