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
    const [position, setPosition] = useState({ coordinates: [80, 20], zoom: 1.5 });
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

    // rank top 10 countries by investment
    const topRecipients = Object.entries(data || {})
        .filter(([_, info]) => info && info.amount)
        .map(([country, info]) => ({
            country,
            amount: info.amount / 1000000
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

    // Create color scale
    const maxInvestment = Math.max(...Object.values(data || {}).map(info => info?.amount || 0));
    const colorScale = scaleLinear()
        .domain([0, maxInvestment || 1])
        .range(["#C4E1FF", "#016BB6"]);

    return (
        <Paper sx={{ p: 3, height: 'calc(100vh - 280px)' }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
                {/* left: map area */}
                <Box sx={{ flex: 2 }}>
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
                                scale: 180,
                                center: [80, 20] // India center
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
                                            const countryInfo = data?.[mappedName || geoName];

                                            return (
                                                <Tooltip
                                                    key={geo.rsmKey}
                                                    title={
                                                        countryInfo ? (
                                                            <Box sx={{ p: 1 }}>
                                                                <Typography variant="h6">{geoName}</Typography>
                                                                <Typography>
                                                                    Investment: ${((countryInfo.amount || 0)/1000000).toFixed(2)}M
                                                                </Typography>
                                                                <Typography>
                                                                    Projects: {countryInfo.projects || 0}
                                                                </Typography>
                                                                {countryInfo.sectors?.length > 0 && (
                                                                    <Typography>
                                                                        Major sectors: {countryInfo.sectors.join(', ')}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        ) : null
                                                    }
                                                >
                                                    <Geography
                                                        geography={geo}
                                                        fill={countryInfo?.amount ? colorScale(countryInfo.amount) : "#F5F5F5"}
                                                        stroke="#FFFFFF"
                                                        strokeWidth={0.5}
                                                        style={{
                                                            default: { 
                                                                outline: 'none',
                                                                transition: 'all 250ms'
                                                            },
                                                            hover: countryInfo?.amount ? { 
                                                                fill: "#014B80",
                                                                outline: 'none',
                                                                cursor: 'pointer',
                                                                strokeWidth: 1
                                                            } : {
                                                                fill: "#F5F5F5",
                                                                outline: 'none'
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
                </Box>

                {/* right: rank list */}
                <Box sx={{ flex: 1, p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Top Recipient Countries
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        {topRecipients.map((item, index) => (
                            <Box 
                                key={item.country}
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1,
                                    borderBottom: '1px solid #eee',
                                    '&:hover': { bgcolor: '#f5f5f5' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ width: 24 }}>{index + 1}</Typography>
                                    <Typography>{item.country}</Typography>
                                </Box>
                                <Typography>${item.amount.toFixed(2)}M</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}

export default CountryMap; 