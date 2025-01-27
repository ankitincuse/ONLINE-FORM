const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');  // Fixed import

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify admin token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Admin login
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.error('Missing username or password');
            return res.status(400).json({ error: 'Username and password are required' });
        }

        console.log('Attempting to find admin user:', username);

        // Get admin user from database
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!admin) {
            console.log('No admin user found with username:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Admin user found:', admin.username);

        // Verify password
        try {
            const validPassword = await bcrypt.compare(password, admin.password_hash);
            console.log('Password validation result:', validPassword);

            if (!validPassword) {
                console.log('Invalid password for user:', username);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Create and assign token
            const token = jwt.sign(
                { id: admin.id, username: admin.username },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            console.log('Login successful for user:', username);
            res.json({ token });

        } catch (bcryptError) {
            console.error('Password comparison error:', bcryptError);
            return res.status(500).json({ error: 'Error validating credentials' });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all form submissions for dashboard
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        console.log('Fetching form submissions for dashboard...');
        
        // Get all form submissions with related data
        const { data: submissions, error } = await supabase
            .from('form_data')
            .select(`
                *,
                academic_details(*),
                reference_details(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions:', error);
            throw error;
        }

        console.log(`Found ${submissions?.length || 0} submissions`);
        res.json(submissions || []);

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Get a single submission by ID
router.get('/submission/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching submission details for ID:', id);

        const { data: submission, error } = await supabase
            .from('form_data')
            .select(`
                *,
                academic_details(*),
                reference_details(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching submission:', error);
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Error fetching submission details:', error);
        res.status(500).json({ error: 'Failed to fetch submission details' });
    }
});

module.exports = router;
