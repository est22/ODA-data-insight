const analysisService = require('../services/analysisService');

async function getEfficiencyAnalysis(req, res) {
    try {
        const { country } = req.query;
        const data = await analysisService.getEfficiencyAnalysis(country);
        res.json({
            success: true,
            message: 'Analysis of investment efficiency in education projects',
            data: data,
            metadata: {
                description: 'Investment efficiency analysis in education projects',
                metrics: {
                    avg_improvement: 'Average improvement rate of all indicators (%)',
                    investment_per_improvement: 'Investment required per 1% improvement (USD)',
                    efficiency_score: 'Investment efficiency score'
                }
            }
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({ 
            error: 'Analysis failed',
            details: error.message 
        });
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

module.exports = {
    getEfficiencyAnalysis,
    getSynergyAnalysis,
    getSustainabilityAnalysis
}; 