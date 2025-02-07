const express = require('express');
const router = express.Router();
const { getEducationProjects, getEducationSummary } = require('../models/educationQueries');

// Get all education projects
router.get('/projects', (req, res) => {
    try {
        const results = getEducationProjects();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get education summary statistics
router.get('/summary', (req, res) => {
    try {
        const results = getEducationSummary();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 