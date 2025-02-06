import { Box, Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import StrategicOverview from '../components/StrategicAnalysis/StrategicOverview';
import SectorComparison from '../components/StrategicAnalysis/SectorComparison';
import LoadingState from '../components/Common/LoadingState';
import ErrorState from '../components/Common/ErrorState';

function Dashboard() {
    const { data, isLoading, error } = useQuery(
        ['strategicGoals'],
        async () => {
            const response = await fetch('/strategic-goals');
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            return result;
        },
        { staleTime: 5 * 60 * 1000 } // 5 minutes cache
    );

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

    const { data: strategicData, metadata } = data;

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    KOICA Tech Innovation Analysis
                </Typography>
                
                {/* Overview Cards */}
                <Box sx={{ mb: 4 }}>
                    <StrategicOverview 
                        totalProjects={metadata.totalProjects}
                        totalInvestment={metadata.totalInvestment}
                        sectors={metadata.sectors}
                    />
                </Box>

                {/* Sector Comparison */}
                <Box sx={{ mb: 4 }}>
                    <SectorComparison data={strategicData} />
                </Box>
            </Box>
        </Container>
    );
}

export default Dashboard; 