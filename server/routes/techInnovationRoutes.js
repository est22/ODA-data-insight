const express = require('express');
const router = express.Router();
const { getTechInvestmentByCountry, getResearchProjects } = require('../models/techInnovationQueries');
const worldBankService = require('../services/worldBankService');

// tech investment by country
router.get('/tech-investment', (req, res) => {
    try {
        const results = getTechInvestmentByCountry();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// research/innovation projects
router.get('/research-projects', (req, res) => {
    try {
        const results = getResearchProjects();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// digital development profile by country
router.get('/digital-profile/:country/:year', async (req, res) => {
    try {
        const { country, year } = req.params;
        const profile = await worldBankService.getCountryDigitalProfile(country, year);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 