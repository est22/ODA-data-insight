import { Box, Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import StrategicOverview from '../components/StrategicAnalysis/StrategicOverview';
import CountryMap from '../components/StrategicAnalysis/CountryMap';
import LoadingState from '../components/Common/LoadingState';
import ErrorState from '../components/Common/ErrorState';

function Dashboard() {
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

                        <Box sx={{ mb: 4 }}>
                            <CountryMap data={countryData} />
                        </Box>
                    </>
                ) : (
                    <Box sx={{ height: '200px' }}>
                        <LoadingState />
                    </Box>
                )}
            </Box>
        </Container>
    );
}

export default Dashboard; 