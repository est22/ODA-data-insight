const express = require('express');
const cors = require('cors');
const techInnovationRoutes = require('./routes/techInnovationRoutes');

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', techInnovationRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
