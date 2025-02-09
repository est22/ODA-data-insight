import React, { useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Box, Paper, Typography, Tooltip, IconButton } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

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

const WorldMap = ({ data, onCountrySelect, selectedCountry }) => {
    const [position, setPosition] = useState({ coordinates: [95, 15], zoom: 1 });
    
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

    return (
        <Paper elevation={3} sx={{ position: 'relative', p: 2 }}>
            <Box sx={{ position: 'absolute', right: 20, top: 20, zIndex: 1 }}>
                <IconButton onClick={handleZoomIn} size="small" sx={{ mb: 1, bgcolor: 'white' }}>
                    <Add />
                </IconButton>
                <IconButton onClick={handleZoomOut} size="small" sx={{ bgcolor: 'white' }}>
                    <Remove />
                </IconButton>
            </Box>
            
            <ComposableMap projectionConfig={{ scale: 150 }}>
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={handleMoveEnd}
                    translateExtent={[[0, 0], [800, 600]]}
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
                                                    "#FF1493" : colorScale(countryData.amount)
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
        </Paper>
    );
};

export default WorldMap; 