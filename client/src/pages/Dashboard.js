import React, { useState } from 'react';
import { Box, Container, Typography, IconButton, Select, MenuItem } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import SummaryCards from '../components/Dashboard/SummaryCards';
import WorldMap from '../components/Map/WorldMap';
import RankingPanel from '../components/Analysis/RankingPanel';
import CountryDetails from '../components/Analysis/CountryDetails';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
    const [selectedYear, setSelectedYear] = useState('2023');
    const [selectedSector, setSelectedSector] = useState('All Sectors');
    const [selectedCountry, setSelectedCountry] = useState(null);

    // get summary data
    const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery(
        ['summary'],
        async () => {
            const response = await fetch('/education/summary');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const json = await response.json();
            
            return json.data;
        }
    );

    // get project data
    const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useQuery(
        ['projects'],
        async () => {
            const response = await fetch('/education/projects');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const json = await response.json();
            return json.data;
        }
    );

    // get project data (for map data)
    const { data: mapData, isLoading: mapLoading, error: mapError } = useQuery(
        ['projects'],
        async () => {
            const response = await fetch('/education/projects');
            if (!response.ok) throw new Error('Failed to fetch project data');
            const json = await response.json();
            
            // format data to match map component
            const formattedData = json.data.reduce((acc, project) => {
                // convert to number format
                const amount = parseFloat(project.total_investment);
                if (amount > 0) {  // include only if investment exists
                    acc[project.country] = {
                        amount: amount,
                        projects: parseInt(project.project_count),
                        sectors: project.sectors.split(','),
                        trends: project.trends || [],
                        recentProjects: Array.isArray(project.projects) ? 
                            project.projects.map(p => ({
                                name: p.name,
                                year: p.year,
                                sector: p.sector,
                                amount: parseFloat(p.amount)
                            })) : []
                    };
                }
                return acc;
            }, {});
            return formattedData;
        }
    );

    // error handling
    if (summaryError || projectsError || mapError) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">
                    Error loading data: {summaryError?.message || projectsError?.message || mapError?.message}
                </Typography>
            </Box>
        );
    }

    // loading handling
    if (summaryLoading || projectsLoading || mapLoading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3 
            }}>
                <Typography variant="h4">
                    Education Development Analysis Dashboard
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="2023">2023</MenuItem>
                        <MenuItem value="2022">2022</MenuItem>
                        <MenuItem value="2021">2021</MenuItem>
                    </Select>
                    <IconButton>
                        <FileDownload />
                    </IconButton>
                </Box>
            </Box>

            {/* Summary Cards */}
            <SummaryCards 
                totalInvestment={summaryData?.total_investment || 0}
                totalProjects={summaryData?.total_projects || 0}
                focusSectors={summaryData?.focus_sectors || []}
            />

            {/* Main Content */}
            <Box sx={{ position: 'relative', mt: 3 }}>
                {/* Filters */}
                <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                    <Select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="All Sectors">All Sectors</MenuItem>
                        {summaryData?.focus_sectors.map(sector => (
                            <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Map and Rankings */}
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ flex: 3 }}>
                        <WorldMap
                            data={mapData}
                            selectedCountry={selectedCountry}
                            onCountrySelect={setSelectedCountry}
                            year={selectedYear}
                            sector={selectedSector}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <RankingPanel
                            data={mapData}
                            onCountrySelect={setSelectedCountry}
                            selectedCountry={selectedCountry}
                        />
                    </Box>
                </Box>

                {/* Country Details Modal */}
                {selectedCountry && (
                    <CountryDetails
                        country={selectedCountry}
                        data={mapData?.[selectedCountry]}
                        onClose={() => setSelectedCountry(null)}
                    />
                )}
            </Box>
        </Container>
    );
};

export default Dashboard; 