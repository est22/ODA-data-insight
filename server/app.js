const express = require('express');
const cors = require('cors');
const { db } = require('./models/model');  // initialize database
const { initializeEducationTable } = require('./models/educationQueries');
const educationRoutes = require('./routes/educationRoutes');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Initialize tables in correct order
initializeEducationTable(); 

// Routes
app.use('/', educationRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
