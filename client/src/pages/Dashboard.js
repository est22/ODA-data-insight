import React, { useState } from 'react';
import { Box, Container, Typography, IconButton, Select, MenuItem } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import SummaryCards from '../components/Dashboard/SummaryCards';
import WorldMap from '../components/Map/WorldMap';
import RankingPanel from '../components/Analysis/RankingPanel';
import CountryDetails from '../components/Analysis/CountryDetails';
import { useQuery } from '@tanstack/react-query';

// continent center coordinates and zoom level settings
const CONTINENT_VIEWS = {
    "All": { coordinates: [0, 0], zoom: 1 },
    "Asia": { coordinates: [95, 20], zoom: 2 },
    "Africa": { coordinates: [20, 0], zoom: 2 },
    "Americas": { coordinates: [-60, 0], zoom: 1.5 },
    "Europe": { coordinates: [15, 50], zoom: 2.5 },
    "Oceania": { coordinates: [130, -20], zoom: 2.5 }
};

const INVESTMENT_RANGES = {
    high: { min: 100000000, max: Infinity, color: "#FF6B6B" },  // >= 100M
    medium: { min: 10000000, max: 100000000, color: "#FFD93D" },  // 10M-100M
    low: { min: 0, max: 10000000, color: "#6BCB77" }  // < 10M
};

const Dashboard = () => {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedInvestmentRange, setSelectedInvestmentRange] = useState('All Ranges');
    const [mapView, setMapView] = useState(CONTINENT_VIEWS["All"]);

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
                // use original data
                const amount = project.total_investment; 
                if (amount > 0) {
                    acc[project.country] = {
                        amount: amount,
                        projects: project.project_count,
                        sectors: project.sectors.split(','),
                        trends: project.trends || [],
                        recentProjects: Array.isArray(project.projects) ? 
                            project.projects.map(p => ({
                                name: p.name,
                                year: p.year,
                                sector: p.sector,
                                amount: p.amount 
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
                mt: 2,
                mb: 3, 
                textAlign: 'center' 
            }}>
                <Typography 
                    variant="h4" 
                    gutterBottom
                    sx={{
                        fontFamily: "'Roboto Condensed', sans-serif",
                        fontWeight: 700,
                        letterSpacing: 1,
                        fontSize: '2.2rem'
                    }}
                >
                    Education Development Analysis Dashboard
                </Typography>

                {/* Summary Cards center aligned */}
                <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3
                }}>
                    <SummaryCards 
                        totalInvestment={summaryData?.total_investment || 0}
                        totalProjects={summaryData?.total_projects || 0}
                        focusSectors={summaryData?.focus_sectors || []}
                    />
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: 'flex', gap: 3, height: '600px' }}>
                <Box sx={{ flex: 3, height: '100%', position: 'relative' }}>
                    {/* Filters - World Map title next to it */}
                    {!selectedCountry && (
                        <Box sx={{ 
                            position: 'absolute',
                            left: 120,  // World Map text next to it
                            top: 16,
                            zIndex: 2,
                            display: 'flex',
                            gap: 2
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700 }}>
                                    Continent:
                                </Typography>
                                <Select value={selectedRegion} onChange={(e) => {
                                    setSelectedRegion(e.target.value);
                                    setMapView(CONTINENT_VIEWS[e.target.value]);
                                }} size="small" sx={{ width: 120 }}>
                                    <MenuItem value="All">All</MenuItem>
                                    <MenuItem value="Asia">Asia</MenuItem>
                                    <MenuItem value="Africa">Africa</MenuItem>
                                    <MenuItem value="Americas">Americas</MenuItem>
                                    <MenuItem value="Europe">Europe</MenuItem>
                                    <MenuItem value="Oceania">Oceania</MenuItem>
                                </Select>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700 }}>
                                    Investment:
                                </Typography>
                                <Select 
                                    value={selectedInvestmentRange} 
                                    onChange={(e) => setSelectedInvestmentRange(e.target.value)} 
                                    size="small" 
                                    sx={{ width: 120 }}
                                >
                                    <MenuItem value="All Ranges">All Ranges</MenuItem>
                                    <MenuItem value="high">High (&gt;$100M)</MenuItem>
                                    <MenuItem value="medium">Medium ($10M-$100M)</MenuItem>
                                    <MenuItem value="low">Low (&lt;$10M)</MenuItem>
                                </Select>
                            </Box>
                        </Box>
                    )}
                    <WorldMap
                        data={mapData}
                        selectedCountry={selectedCountry}
                        onCountrySelect={setSelectedCountry}
                        mapView={CONTINENT_VIEWS[selectedRegion]}
                        selectedInvestmentRange={selectedInvestmentRange}
                        investmentRanges={INVESTMENT_RANGES}
                    />
                </Box>
                <Box sx={{ flex: 1, height: '100%' }}>
                    <RankingPanel
                        data={mapData}
                        onCountrySelect={setSelectedCountry}
                        selectedCountry={selectedCountry}
                    />
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard; 