const express = require('express');
const AgeDistributionController = require('./Controller');

const app = express();
const port = 3001;

app.get('/age-distribution', AgeDistributionController.getAgeDistribution);

// Default 404 route handler for unmatched routes
app.use((req, res) => {
    res.status(404).send('Oops! Route not found. 🧐');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
