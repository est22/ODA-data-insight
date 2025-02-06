const express = require('express');
const cors = require('cors');

const app = express();
const port = 8000;

// middleware
app.use(cors());
app.use(express.json());

// tech innovation routes
app.use('/', techInnovationRoutes);


// start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
