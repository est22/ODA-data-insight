import { Box, Paper, Typography, Tooltip, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Add, Remove } from '@mui/icons-material';
import { useState } from 'react';

// Modern topojson from Natural Earth
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Simplified country name mapping (Natural Earth uses standard names)
const countryNameMapping = {
    "Korea": "Republic of Korea",
    "Vietnam": "Vietnam",
    "Laos": "Laos",
    "Myanmar": "Myanmar",
    "Cambodia": "Cambodia",
    "Thailand": "Thailand",
    "Indonesia": "Indonesia",
    "Malaysia": "Malaysia",
    "Philippines": "Philippines",
    "Singapore": "Singapore",
    "Brunei": "Brunei",
    "Timor-Leste": "Timor-Leste",
    "India": "India",
    "Pakistan": "Pakistan",
    "Bangladesh": "Bangladesh",
    "Sri Lanka": "Sri Lanka",
    "Bhutan": "Bhutan",
    "Nepal": "Nepal",
    "Afghanistan": "Afghanistan",
    "Tajikistan": "Tajikistan",
    "Kyrgyzstan": "Kyrgyzstan",
    "Uzbekistan": "Uzbekistan",
    "Turkmenistan": "Turkmenistan",
    "Kazakhstan": "Kazakhstan",
    "Mongolia": "Mongolia"
};

function CountryMap({ data }) {
    const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
    const [selectedYear, setSelectedYear] = useState('2023');
    const [selectedSector, setSelectedSector] = useState('all');

    const handleZoomIn = () => {
        if (position.zoom >= 4) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
    };

    const countryData = data || {};
    
    // Create color scale
    const maxInvestment = Math.max(...Object.values(countryData));
    const colorScale = scaleLinear()
        .domain([0, maxInvestment || 1])
        .range(["#C4E1FF", "#016BB6"]);

    return (
        <Paper sx={{ p: 3, height: 'calc(100vh - 280px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">
                    Geographic Distribution
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            label="Year"
                        >
                            {['2019', '2020', '2021', '2022', '2023'].map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sector</InputLabel>
                        <Select
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                            label="Sector"
                        >
                            <MenuItem value="all">All Sectors</MenuItem>
                            <MenuItem value="tech">Technology & Innovation</MenuItem>
                            <MenuItem value="education">Education</MenuItem>
                            <MenuItem value="health">Healthcare</MenuItem>
                            <MenuItem value="environment">Environment</MenuItem>
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={handleZoomIn} size="small">
                            <Add />
                        </IconButton>
                        <IconButton onClick={handleZoomOut} size="small">
                            <Remove />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ height: 'calc(100% - 50px)', position: 'relative' }}>
                <ComposableMap
                    projectionConfig={{
                        scale: 180
                    }}
                >
                    <ZoomableGroup
                        zoom={position.zoom}
                        center={position.coordinates}
                        onMoveEnd={setPosition}
                    >
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const geoName = geo.properties.name;
                                    const mappedName = Object.entries(countryNameMapping)
                                        .find(([k, v]) => v === geoName)?.[0];
                                    const investment = countryData[mappedName || geoName] || 0;

                                    return (
                                        <Tooltip
                                            key={geo.rsmKey}
                                            title={
                                                <Box sx={{ p: 1 }}>
                                                    <Typography variant="h6">{geoName}</Typography>
                                                    {investment > 0 && (
                                                        <>
                                                            <Typography>
                                                                Investment: ${(investment/1000000).toFixed(2)}M
                                                            </Typography>
                                                            <Typography>
                                                                Major sectors: Technology, Education
                                                            </Typography>
                                                            <Typography>
                                                                Projects: 12
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Box>
                                            }
                                        >
                                            <Geography
                                                geography={geo}
                                                fill={investment > 0 ? colorScale(investment) : "#F5F5F5"}
                                                stroke="#FFFFFF"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { 
                                                        outline: 'none',
                                                        transition: 'all 250ms'
                                                    },
                                                    hover: { 
                                                        fill: investment > 0 ? "#014B80" : "#E0E0E0",
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        strokeWidth: 1
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            </Box>
        </Paper>
    );
}

export default CountryMap; 