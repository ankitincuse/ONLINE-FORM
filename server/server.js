require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const formRoutes = require('./routes/formRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

// Serve static files from the client/public directory
app.use(express.static(path.join(__dirname, '../client/public')));

// API routes
app.use('/api/form', formRoutes);
app.use('/api/admin', adminRoutes);  
app.use('/api/files', fileRoutes);

// Serve admin pages
app.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// Handle 404 - Keep this as the last route
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../client/public/404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Admin routes mounted at /api/admin`);
    console.log(`Static files served from ${path.join(__dirname, '../client/public')}`);
});
