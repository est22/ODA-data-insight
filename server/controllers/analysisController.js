const analysisService = require('../services/analysisService');
const { getCountryIsoCode } = require('../services/worldBankService');
const { INDICATORS } = require('../models/worldBankQueries');

async function getEfficiencyAnalysis(req, res) {
    try {
        const { country } = req.query;
        const data = await analysisService.getEfficiencyAnalysis(country);
        
        // return actual analysis results
        res.json({
            success: true,
            data: data  
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
}

async function getSynergyAnalysis(req, res) {
    try {
        const { country } = req.query;
        const data = await analysisService.getSynergyAnalysis(country);
        res.json({
            success: true,
            message: 'Analysis of synergy between KOICA and World Bank',
            data: data
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({ 
            error: 'Analysis failed',
            details: error.message 
        });
    }
}

async function getSustainabilityAnalysis(req, res) {
    try {
        const { country } = req.query;
        const data = await analysisService.getSustainabilityAnalysis(country);
        res.json({
            success: true,
            message: 'Analysis of sustainability of education projects',
            data: data
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({ 
            error: 'Analysis failed',
            details: error.message 
        });
    }
}

async function getRealTimeAnalysis(req, res) {
    try {
        const { country } = req.params;
        const countryCode = getCountryIsoCode(country);
        
        // check if INDICATORS is loaded correctly
        if (!INDICATORS) {
            console.error('INDICATORS is not defined:', INDICATORS);
            return res.status(500).json({ error: 'Internal server error: Indicators not loaded' });
        }

      

        // use all indicators in INDICATORS
        const indicatorDescriptions = {
            'SE.PRM.CMPT.ZS': { name: 'Primary Completion Rate', description: 'Percentage of students completing primary education' },
            'SE.PRM.ENRR': { name: 'Primary Enrollment', description: 'Gross enrollment ratio in primary education' },
            'SE.PRM.TENR': { name: 'Trained Teachers (Primary)', description: 'Percentage of trained teachers in primary education' },
            'SE.XPD.PRIM.PC.ZS': { name: 'Primary Education Expenditure', description: 'Government expenditure per student in primary education' },
            'SE.PRM.PRSL.ZS': { name: 'Primary School Persistence', description: 'Persistence to last grade of primary' },
            'SE.SEC.CMPT.LO.ZS': { name: 'Lower Secondary Completion', description: 'Lower secondary completion rate' },
            'SE.PRM.TCAQ.ZS': { name: 'Qualified Teachers', description: 'Percentage of qualified teachers in primary education' },
            'UIS.LR.AG25T64': { name: 'Adult Literacy Rate', description: 'Literacy rate of population aged 25-64 years' },
            
            'IT.NET.USER.ZS': { name: 'Internet Usage', description: 'Percentage of population using the Internet' },
            'IT.CEL.SETS.P2': { name: 'Mobile Subscriptions', description: 'Mobile cellular subscriptions per 100 people' },
            'IT.NET.BBND.P2': { name: 'Broadband Access', description: 'Fixed broadband subscriptions per 100 people' },
            'IT.NET.SECR.P6': { name: 'Secure Servers', description: 'Secure Internet servers per 1 million people' },
            'GB.XPD.RSDV.GD.ZS': { name: 'R&D Investment', description: 'Research and development expenditure as % of GDP' },
            'IP.JRN.ARTC.SC': { name: 'Scientific Publications', description: 'Number of scientific and technical journal articles' },
            
            'SE.TER.ENRR': { name: 'Tertiary Enrollment', description: 'Gross enrollment ratio in tertiary education' },
            'SL.UEM.ADVN.ZS': { name: 'Advanced Education Unemployment', description: 'Unemployment rate with advanced education' },
            'SE.XPD.TERT.PC.ZS': { name: 'Tertiary Education Expenditure', description: 'Government expenditure per student in tertiary education' },
            'SE.TER.CUAT.BA.ZS': { name: "Bachelor's Degree Holders", description: 'Percentage of population with Bachelor degree' },
            'SE.TER.CUAT.MS.ZS': { name: "Master's Degree Holders", description: 'Percentage of population with Master degree' },
            'SL.UEM.BASC.ZS': { name: 'Basic Education Unemployment', description: 'Unemployment rate with basic education' }
        };

        // request data for all indicators in parallel
        const results = await Promise.all(
            Object.entries(INDICATORS).map(async ([category, indicators]) => {
                const metrics = await Promise.all(
                    indicators.map(async (indicator) => {
                        const url = `http://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&date=2018:2023`;
                        const response = await fetch(url);
                        const data = await response.json();

                        let value = 0;
                        let year = null;
                        if (data && data[1] && data[1].length > 0) {
                            // use latest data
                            const latestData = data[1].find(d => d.value !== null);
                            if (latestData) {
                                value = Math.round(latestData.value * 100) / 100;
                                year = latestData.date;
                            }
                        }

                        return {
                            code: indicator,
                            name: indicatorDescriptions[indicator].name,
                            value: value,
                            year: year,
                            description: indicatorDescriptions[indicator].description
                        };
                    })
                );

                return [category, metrics];
            })
        );

        // convert results to object
        const analysisData = Object.fromEntries(results);
        res.json(analysisData);

    } catch (error) {
        console.error('Real-time analysis error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
}

module.exports = {
    getEfficiencyAnalysis,
    getSynergyAnalysis,
    getSustainabilityAnalysis,
    getRealTimeAnalysis
}; 