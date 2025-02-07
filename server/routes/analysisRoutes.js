const express = require('express');
const router = express.Router();
const controller = require('../controllers/analysisController');

// 1. Investment Efficiency Analysis
// GET /analysis/efficiency
router.get('/efficiency', controller.getEfficiencyAnalysis);

// 2. Synergy Analysis
// GET /analysis/synergy
router.get('/synergy', controller.getSynergyAnalysis);

// 3. Sustainability Analysis
// GET /analysis/sustainability
router.get('/sustainability', controller.getSustainabilityAnalysis);

module.exports = router; 