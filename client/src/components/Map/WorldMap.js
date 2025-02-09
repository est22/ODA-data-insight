import React, { useState, useCallback, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Box, Paper, Tooltip, IconButton, Typography } from '@mui/material';
import { Add, Remove, FileDownload, Close } from '@mui/icons-material';
import Papa from 'papaparse';
import CountryDetails from '../Analysis/CountryDetails';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";
const ZOOM_STEP = 1.5;

// use CountryMap.js mapping table
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

const WorldMap = ({ 
    data, 
    onCountrySelect, 
    selectedCountry,
    mapView,
    selectedInvestmentRange,
    investmentRanges
}) => {
    const [position, setPosition] = useState({ 
        coordinates: [40, 9], 
        zoom: 1.5
    });

    // mapView가 변경되면 position 업데이트
    useEffect(() => {
        if (mapView) {
            setPosition(mapView);
        }
    }, [mapView]);

    const handleZoomIn = useCallback(() => {
        setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * ZOOM_STEP, 8) }));
    }, []);

    const handleZoomOut = useCallback(() => {
        setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / ZOOM_STEP, 1) }));
    }, []);

    const handleMoveEnd = useCallback((position) => {
        setPosition(position);
    }, []);

    // create color scale based on investment amount
    const maxInvestment = Math.max(...Object.values(data || {}).map(info => info?.amount || 0));
    const colorScale = scaleLinear()
        .domain([0, maxInvestment])
        .range(["#C4E1FF", "#016BB6"]);

    // determine color based on investment amount
    const getCountryColor = useCallback((amount) => {
        if (!selectedInvestmentRange) return colorScale(amount);
        
        const range = investmentRanges[selectedInvestmentRange];
        if (!range) return "#F5F5F5";
        
        // color when it's in the range
        return (amount >= range.min && amount < range.max) ? range.color : "#F5F5F5";
    }, [selectedInvestmentRange, investmentRanges, colorScale]);

    const handleDownload = () => {
        // download data of selected country
        const exportData = selectedCountry ? 
            [{
                Country: selectedCountry,
                'Total Investment (USD)': data[selectedCountry].amount,
                'Number of Projects': data[selectedCountry].projects,
                'Focus Sectors': data[selectedCountry].sectors.join(', '),
                'Projects': data[selectedCountry].recentProjects.map(p => 
                    `${p.name} (${p.year}, $${(p.amount/1000000).toFixed(2)}M)`
                ).join('\n')
            }] :
            Object.entries(data).map(([country, info]) => ({
                Country: country,
                'Total Investment (USD)': info.amount,
                'Number of Projects': info.projects,
                'Focus Sectors': info.sectors.join(', '),
                'Latest Project': info.recentProjects[0]?.name || 'N/A',
                'Latest Investment': info.recentProjects[0]?.amount || 0
            }));

        const csvContent = Papa.unparse(exportData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = selectedCountry ? 
            `${selectedCountry}_education_data.csv` : 
            'education_development_data.csv';
        link.click();
    };

    return (
        <Paper elevation={3} sx={{ 
            position: 'relative', 
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* World Map Title */}
            <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                    fontFamily: "'Roboto Condensed', sans-serif",
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    fontSize: '1.1rem',
                    position: 'absolute',
                    left: 16,
                    top: 16,
                    zIndex: 2
                }}
            >
                World Map
            </Typography>

            {/* map view control (+/-) */}
            {!selectedCountry && (
                <Box sx={{ 
                    position: 'absolute', 
                    right: 40,
                    top: 20, 
                    zIndex: 2,
                    display: 'flex',
                    gap: 1
                }}>
                    <IconButton 
                        onClick={handleZoomIn} 
                        size="small" 
                        sx={{ 
                            bgcolor: 'white',
                            border: '1px solid #E0E0E0',
                            '&:hover': { bgcolor: 'white' }
                        }}
                    >
                        <Add />
                    </IconButton>
                    <IconButton 
                        onClick={handleZoomOut} 
                        size="small" 
                        sx={{ 
                            bgcolor: 'white',
                            border: '1px solid #E0E0E0',
                            '&:hover': { bgcolor: 'white' }
                        }}
                    >
                        <Remove />
                    </IconButton>
                </Box>
            )}

            {/* map and detailed information container */}
            <Box sx={{ 
                position: 'relative',
                flex: 1, 
                overflow: 'hidden'
            }}>
                {/* map */}
                <Box sx={{ 
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: selectedCountry ? 'none' : 'block'
                }}>
                    <ComposableMap 
                        projectionConfig={{ 
                            scale: 150,
                            center: [0, 0]  // adjust projection center
                        }}
                    >
                        <ZoomableGroup
                            zoom={position.zoom}
                            center={position.coordinates}
                            onMoveEnd={handleMoveEnd}
                            translateExtent={[[0, 0], [800, 600]]}
                            maxZoom={8}
                        >
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const geoName = geo.properties.name;
                                        // map country name from map to DB country name
                                        const mappedName = Object.entries(countryNameMapping)
                                            .find(([_, v]) => v === geoName)?.[0] || geoName;
                                        const countryData = data[mappedName];
                                        const isRecipient = !!countryData;

                                        return (
                                            <Tooltip
                                                key={geo.rsmKey}
                                                title={countryData ? 
                                                    `${geoName}\nInvestment: $${(countryData.amount/1000000).toFixed(2)}M\nProjects: ${countryData.projects}` 
                                                    : geoName
                                                }
                                            >
                                                <Geography
                                                    geography={geo}
                                                    fill={countryData ? 
                                                        selectedCountry === mappedName ? 
                                                            "#FF1493" : getCountryColor(countryData.amount)
                                                        : "#F5F5F5"
                                                    }
                                                    stroke="#FFFFFF"
                                                    strokeWidth={0.5}
                                                    style={{
                                                        default: { outline: 'none' },
                                                        hover: { 
                                                            fill: isRecipient ? "#FF1493" : "#F5F5F5",
                                                            outline: 'none',
                                                            transition: 'all 250ms'
                                                        },
                                                        pressed: { outline: 'none' }
                                                    }}
                                                    onClick={() => isRecipient && onCountrySelect(mappedName)}
                                                />
                                            </Tooltip>
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                </Box>

                {/* country detailed information */}
                <Box sx={{ 
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: selectedCountry ? 'block' : 'none',
                    bgcolor: 'background.paper',
                    overflow: 'auto'
                }}>
                    {selectedCountry && (
                        <>
                            {/* top control buttons */}
                            <Box sx={{ 
                                position: 'sticky',  // scroll but fixed
                                top: 16,
                                right: 16,
                                display: 'flex',
                                gap: 1,
                                zIndex: 3,
                                float: 'right'  // right align
                            }}>
                                <IconButton 
                                    onClick={handleDownload}
                                    size="small" 
                                    sx={{ 
                                        bgcolor: 'white',
                                        '&:hover': { bgcolor: 'white' }
                                    }}
                                >
                                    <FileDownload />
                                </IconButton>
                                <IconButton 
                                    onClick={() => onCountrySelect(null)}
                                    size="small"
                                    sx={{ 
                                        bgcolor: 'white',
                                        '&:hover': { bgcolor: 'white' }
                                    }}
                                >
                                    <Close />
                                </IconButton>
                            </Box>

                            <CountryDetails
                                country={selectedCountry}
                                data={data?.[selectedCountry]}
                                onClose={onCountrySelect}
                            />
                        </>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default WorldMap; 