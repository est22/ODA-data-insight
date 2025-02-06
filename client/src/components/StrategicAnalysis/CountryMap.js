import { Box, Paper, Typography, Tooltip, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Add, Remove } from '@mui/icons-material';
import { useState } from 'react';
import { styled } from '@mui/material/styles';

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

// Update styled components for consistent design
const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: '#ffffff'
}));

// Styled components for modern UI
const CountryTooltip = styled(Box)({
    background: '#ffffff',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.1)',
    padding: '20px',
    minWidth: 300,
    '& .title': {
        fontSize: 24,
        fontWeight: 600,
        marginBottom: 24,
        color: '#1a1a1a'
    },
    '& .stats': {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        marginBottom: 20,
        '& .value': {
            fontSize: 20,
            fontWeight: 500,
            marginTop: 4
        },
        '& .label': {
            fontSize: 14,
            color: '#666'
        }
    },
    '& .score-section': {
        marginTop: 16
    },
    '& .score-bar': {
        height: 6,
        background: 'linear-gradient(90deg, #DC3545 0%, #FFC107 50%, #28A745 100%)',
        borderRadius: 3,
        position: 'relative',
        marginTop: 8
    },
    '& .score-marker': {
        width: 3,
        height: 12,
        background: '#1a1a1a',
        position: 'absolute',
        top: -3,
        transform: 'translateX(-50%)'
    }
});

// Fixed height ranking list with scroll
const RankingList = styled(Box)({
    maxHeight: '440px', // Approximately 11 rows
    overflowY: 'auto',
    '& .rank-item': {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        '&:hover': {
            background: 'rgba(0,0,0,0.02)'
        }
    }
});

function CountryMap({ data, onCountrySelect }) {
    const [position, setPosition] = useState({ coordinates: [40, 9], zoom: 2 });
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

    // Get all countries sorted by investment
    const allRecipients = Object.entries(data || {})
        .filter(([_, info]) => info && info.amount)
        .map(([country, info]) => ({
            country,
            amount: info.amount
        }))
        .sort((a, b) => b.amount - a.amount);

    // Create color scale
    const maxInvestment = Math.max(...Object.values(data || {}).map(info => info?.amount || 0));
    const colorScale = scaleLinear()
        .domain([0, maxInvestment || 1])
        .range(["#C4E1FF", "#016BB6"]);


    return (
        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Geographic Distribution
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Year</InputLabel>
                        <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} label="Year">
                            {['2019', '2020', '2021', '2022', '2023'].map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sector</InputLabel>
                        <Select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} label="Sector">
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
            <Box sx={{ 
                position: 'relative',
                flex: 1,
                overflow: 'hidden',
                '& > div': {
                    position: 'absolute',
                    width: '100%',
                    height: '100%'
                }
            }}>
                <ComposableMap
                    projectionConfig={{
                        scale: 150,
                        center: [40, 20],
                        rotate: [-10, 0, 0]
                    }}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <ZoomableGroup
                        zoom={position.zoom}
                        center={position.coordinates}
                        onMoveEnd={setPosition}
                        maxZoom={4}
                        minZoom={1}
                    >
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const geoName = geo.properties.name;
                                    const mappedName = Object.entries(countryNameMapping)
                                        .find(([k, v]) => v === geoName)?.[0];
                                    const countryInfo = data?.[mappedName || geoName];
                                    const rank = allRecipients.findIndex(r => r.country === (mappedName || geoName)) + 1;

                                    return (
                                        <Tooltip
                                            key={geo.rsmKey}
                                            title={
                                                countryInfo ? (
                                                    <CountryTooltip>
                                                        <Typography className="title">{geoName}</Typography>
                                                        <Box className="stats">
                                                            <Box>
                                                                <Typography className="label">Investment</Typography>
                                                                <Typography className="value" sx={{ fontSize: 28 }}>
                                                                    ${(countryInfo.amount/1000000).toFixed(2)}M
                                                                </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography className="label">Rank</Typography>
                                                                <Typography className="value" sx={{ fontSize: 28, fontWeight: 'bold' }}>
                                                                    {rank}/{allRecipients.length}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box className="score-section">
                                                            <Typography className="label">Investment Score</Typography>
                                                            <Box className="score-bar">
                                                                <Box 
                                                                    className="score-marker"
                                                                    sx={{ left: `${(countryInfo.amount / maxInvestment) * 100}%` }}
                                                                />
                                                                <Typography sx={{ mt: 1, textAlign: 'center', fontSize: 24 }}>
                                                                    {Math.round((countryInfo.amount / maxInvestment) * 100)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </CountryTooltip>
                                                ) : null
                                            }
                                            PopperProps={{
                                                sx: {
                                                    "& .MuiTooltip-tooltip": {
                                                        bgcolor: "transparent",
                                                        p: 0,
                                                        boxShadow: "none"
                                                    }
                                                }
                                            }}
                                        >
                                            <Geography
                                                geography={geo}
                                                fill={countryInfo?.amount ? colorScale(countryInfo.amount) : "#F5F5F5"}
                                                stroke={countryInfo?.amount ? "#FFFFFF" : "#E0E0E0"}
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { 
                                                        outline: 'none',
                                                        transition: 'none'
                                                    },
                                                    hover: countryInfo?.amount ? { 
                                                        stroke: '#FF1493',
                                                        strokeWidth: 1,
                                                        outline: 'none'
                                                    } : {
                                                        stroke: "#E0E0E0",
                                                        strokeWidth: 0.5,
                                                        outline: 'none'
                                                    }
                                                }}
                                                onClick={() => countryInfo && onCountrySelect(geoName)}
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