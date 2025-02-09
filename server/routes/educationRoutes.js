const express = require('express');
const router = express.Router();
const { getEducationProjects, getEducationSummary } = require('../models/educationQueries');
const analysisController = require('../controllers/analysisController');

// Get all education projects
router.get('/projects', async (req, res) => {
    try {
        const data = await getEducationProjects();
        res.json({
            success: true,
            data: data 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get education summary statistics
router.get('/summary', async (req, res) => {
    try {
        const data = await getEducationSummary();
        res.json({
            success: true,
            data: data 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analysis routes
router.get('/analysis/efficiency', analysisController.getEfficiencyAnalysis);
router.get('/analysis/synergy', analysisController.getSynergyAnalysis);
router.get('/analysis/sustainability', analysisController.getSustainabilityAnalysis);

module.exports = router; 