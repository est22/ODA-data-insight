const express = require('express');
const cors = require('cors');
const { db } = require('./models/model');  // initialize database
const { initializeEducationTable } = require('./models/educationQueries');
const educationRoutes = require('./routes/educationRoutes');
const { fetchWorldBankData } = require('./models/worldBankQueries');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Initialize tables in correct order
initializeEducationTable(); 

// Initialize World Bank data
fetchWorldBankData().catch(console.error);

// Routes
app.use('/', educationRoutes);
app.use('/analysis', analysisRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
