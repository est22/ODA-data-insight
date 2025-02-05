const express = require('express');
const router = express.Router();
const { 
    getTechInvestmentImpact, 
    getProjectOutputs, 
    getSDGPerformanceAnalysis,
    getStrategicGoalsAnalysis,
    getPerformanceTimeline
} = require('../models/techInnovationQueries');


// Tech investment impact analysis
router.get('/tech-investment-impact', (req, res) => {
    try {
        const results = getTechInvestmentImpact();
        console.log('Tech investment results:', results); // 디버깅용
        
        // 데이터 구조 확인
        const analysis = {
            data: results,
            summary: {
                total_projects: results.reduce((sum, r) => sum + r.project_count, 0),
                total_investment: results.reduce((sum, r) => sum + r.total_investment, 0),
                top_recipients: results.slice(0, 5).map(r => ({
                    country: r.recipient_name,
                    investment: r.total_investment
                }))
            }
        };
        
        console.log('Sending analysis:', analysis); // 디버깅용
        res.json(analysis);
    } catch (error) {
        console.error('Error in tech-investment-impact:', error);
        res.status(500).json({ error: error.message });
    }
});

// Project outputs analysis
router.get('/project-outputs', (req, res) => {
    try {
        const results = getProjectOutputs();
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

// Strategic goals achievement analysis
router.get('/strategic-goals', (req, res) => {
    try {
        const results = getStrategicGoalsAnalysis();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Performance timeline analysis
router.get('/performance-timeline', (req, res) => {
    try {
        const results = getPerformanceTimeline();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 