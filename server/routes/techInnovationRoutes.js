const express = require('express');
const router = express.Router();
const { getSDGPerformanceAnalysis, getStrategicGoalsAnalysis, getTechInvestmentImpact, getPerformanceTimeline } = require('../models/techInnovationQueries');



// Tech investment impact analysis
router.get('/tech-investment-impact', (req, res) => {
    try {
        const results = getTechInvestmentImpact();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SDG performance analysis
router.get('/sdg-performance', (req, res) => {
    try {
        const results = getSDGPerformanceAnalysis();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Strategic goals analysis
router.get('/strategic-goals', (req, res) => {
    try {
        console.log('Fetching strategic goals data...');
        const results = getStrategicGoalsAnalysis();
        
        // Debug log
        console.log('Strategic goals results:', results ? 'Data exists' : 'No data');
        
        if (!results) {
            throw new Error('Strategic goals data not available');
        }
        
        res.json(results);
    } catch (error) {
        console.error('Error in /strategic-goals:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Performance timeline analysis
router.get('/performance-timeline', (req, res) => {
    try {
        res.json(getPerformanceTimeline());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Country investment data
router.get('/country-investments', (req, res) => {
    try {
        console.log('Fetching country investments data...');
        const results = getTechInvestmentImpact();
        
        if (!results || !results.length) {
            console.log('No results found');
            return res.json({});
        }

        // Convert array to object with country names as keys
        const countryData = results.reduce((acc, curr) => {
            if (curr.recipient_name && curr.total_investment) {
                acc[curr.recipient_name] = curr.total_investment;
            }
            return acc;
        }, {});

        console.log(`Processed data for ${Object.keys(countryData).length} countries`);
        res.json(countryData);
    } catch (error) {
        console.error('Error in /country-investments:', error);
        res.status(500).json({ error: error.message });
    }
});

// Country details
router.get('/country-details/:country', (req, res) => {
    try {
        const results = getTechInvestmentImpact();
        const countryDetails = results.filter(
            item => item.recipient_name === req.params.country
        );

        res.json({
            projects: countryDetails.length,
            totalInvestment: countryDetails.reduce((sum, item) => sum + item.total_investment, 0),
            yearlyData: countryDetails.reduce((acc, curr) => {
                if (!acc[curr.year]) {
                    acc[curr.year] = 0;
                }
                acc[curr.year] += curr.total_investment;
                return acc;
            }, {})
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 