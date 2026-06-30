require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Custom CORS Middleware to allow cross-origin requests (e.g. from local file:// origin)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Quick response for CORS preflight
    }
    next();
});

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from current directory
app.use(express.static(__dirname));

const contactHandler = require('./api/contact');

// POST endpoint for contact form submissions
app.post('/api/contact', contactHandler);

// Fallback to serve index.html for undefined routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Adarsh Engineering Fabricators Server is now running!`);
    console.log(`🔗 Local Address: http://localhost:${PORT}`);
    console.log(`💡 Configure your email in the .env file to enable live Nodemailer delivery.\n`);
});
