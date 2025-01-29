const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for better permissions
const supabaseUrl = 'https://wmonulauzpsxbnncbcri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb251bGF1enBzeGJubmNiY3JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU1MzgzMiwiZXhwIjoyMDUzMTI5ODMyfQ.Ouc9Dx77WwwSqHQbjS5NYuiTcmkJZD-Mjv5Sa6cOBzc';

const supabase = createClient(supabaseUrl, supabaseKey);

// JWT Secret - should match the one used in login
const JWT_SECRET = '766daee06a233a1c69a7e353b9d96d1b833c39763b37a43f9eafa2fd87409e23';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { username, password } = req.body;

        // Input validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Get user from database
        console.log('Fetching user from database...');
        const { data: users, error: fetchError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username);

        console.log('Database response:', { users, error: fetchError });

        if (fetchError) {
            console.error('Database error:', fetchError);
            return res.status(500).json({ error: 'Database error: ' + fetchError.message });
        }

        if (!users || users.length === 0) {
            console.log('No user found with username:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (users.length > 1) {
            console.error('Multiple users found with username:', username);
            return res.status(500).json({ error: 'Database integrity error: Multiple users found' });
        }

        const user = users[0];
        console.log('User found:', { id: user.id, username: user.username });

        // Check if account is locked
        if (user.account_locked) {
            console.log('Account is locked:', username);
            return res.status(401).json({ error: 'Account is locked. Please contact administrator.' });
        }

        // Verify password
        console.log('Verifying password...');
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log('Password validation:', { isPasswordValid });

        if (!isPasswordValid) {
            // Increment failed attempts
            const failedAttempts = (user.failed_attempts || 0) + 1;
            const shouldLock = failedAttempts >= 5;

            console.log('Invalid password. Updating failed attempts:', { failedAttempts, shouldLock });

            // Update user record
            const { error: updateError } = await supabase
                .from('admin_users')
                .update({
                    failed_attempts: failedAttempts,
                    last_failed_attempt: new Date().toISOString(),
                    account_locked: shouldLock
                })
                .eq('id', user.id);

            if (updateError) {
                console.error('Failed to update user record:', updateError);
            }

            if (shouldLock) {
                return res.status(401).json({ error: 'Account has been locked due to too many failed attempts' });
            }

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Reset failed attempts on successful login
        console.log('Login successful. Resetting failed attempts...');
        const { error: resetError } = await supabase
            .from('admin_users')
            .update({
                failed_attempts: 0,
                last_failed_attempt: null,
                account_locked: false
            })
            .eq('id', user.id);

        if (resetError) {
            console.error('Failed to reset failed attempts:', resetError);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Sending successful response...');
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Get all submissions
router.get('/submissions', verifyToken, async (req, res) => {
    try {
        console.log('Fetching all submissions...');
        const { data: formData, error: formError } = await supabase
            .from('form_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (formError) {
            console.error('Error fetching form data:', formError);
            throw formError;
        }

        // Fetch academic details for all forms
        const { data: academicDetails, error: academicError } = await supabase
            .from('academic_details')
            .select('*')
            .in('form_id', formData.map(f => f.id));

        if (academicError) {
            console.error('Error fetching academic details:', academicError);
            throw academicError;
        }

        // Fetch reference details for all forms
        const { data: referenceDetails, error: referenceError } = await supabase
            .from('reference_details')
            .select('*')
            .in('form_id', formData.map(f => f.id));

        if (referenceError) {
            console.error('Error fetching reference details:', referenceError);
            throw referenceError;
        }

        // Combine the data
        const submissions = formData.map(form => ({
            ...form,
            academic_details: academicDetails.filter(a => a.form_id === form.id),
            reference_details: referenceDetails.filter(r => r.form_id === form.id)
        }));

        console.log(`Found ${submissions.length} submissions`);
        res.json({ submissions });

    } catch (error) {
        console.error('Error in /submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Get single submission
router.get('/submission/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching submission:', id);

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
            throw error;
        }

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        console.log('Found submission:', submission.id);
        res.json({ submission });

    } catch (error) {
        console.error('Error in /submission/:id:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

// Upload company logo
router.post('/upload-logo', verifyToken, upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        console.log('Uploading logo:', file.originalname);

        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `company_logo_${timestamp}.${file.originalname.split('.').pop()}`;
        
        // First check if the bucket exists, if not create it
        const { data: buckets, error: bucketsError } = await supabase
            .storage
            .listBuckets();

        if (bucketsError) {
            console.error('Error listing buckets:', bucketsError);
            throw bucketsError;
        }

        const BUCKET_NAME = 'company-logos';
        const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
        
        if (!bucketExists) {
            console.log('Creating bucket:', BUCKET_NAME);
            const { error: createError } = await supabase
                .storage
                .createBucket(BUCKET_NAME, {
                    public: true,
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
                });

            if (createError) {
                console.error('Error creating bucket:', createError);
                throw createError;
            }
        }

        // Upload the file
        console.log('Uploading file to bucket...');
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600'
            });

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        // Update company settings
        console.log('Updating company settings with new logo URL...');
        const { error: settingsError } = await supabase
            .from('company_settings')
            .upsert({
                id: 1, // Using a fixed ID for single company
                logo_url: publicUrl,
                updated_at: new Date().toISOString()
            });

        if (settingsError) {
            console.error('Error updating company settings:', settingsError);
            throw settingsError;
        }

        console.log('Logo uploaded successfully');
        res.json({ 
            message: 'Logo uploaded successfully',
            url: publicUrl
        });

    } catch (error) {
        console.error('Error in /upload-logo:', error);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
});

// Get company settings
router.get('/settings', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('company_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            throw error;
        }

        res.json({ settings: data });
    } catch (error) {
        console.error('Error fetching company settings:', error);
        res.status(500).json({ error: 'Failed to fetch company settings' });
    }
});

module.exports = router;
