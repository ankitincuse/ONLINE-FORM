const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123';

// Max login attempts before locking
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// Admin login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);

        // Simple validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Query admin user
        const { data: users, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                error: 'Database error'
            });
        }

        if (!users) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const admin = users;

        // Check if account is locked
        if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
            const remainingTime = Math.ceil((new Date(admin.locked_until) - new Date()) / 1000 / 60);
            return res.status(401).json({
                success: false,
                error: `Account is locked. Try again in ${remainingTime} minutes`
            });
        }

        // Verify password
        const { data: verified, error: pwError } = await supabase
            .rpc('verify_password', {
                p_username: username,
                p_password: password
            });

        if (pwError || !verified) {
            // Increment login attempts
            const attempts = (admin.login_attempts || 0) + 1;
            const updates = {
                login_attempts: attempts
            };

            // Lock account if max attempts reached
            if (attempts >= MAX_LOGIN_ATTEMPTS) {
                updates.locked_until = new Date(Date.now() + LOCK_TIME).toISOString();
            }

            await supabase
                .from('admin_users')
                .update(updates)
                .eq('id', admin.id);

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Reset login attempts and update last login
        await supabase
            .from('admin_users')
            .update({
                login_attempts: 0,
                locked_until: null,
                last_login: new Date().toISOString()
            })
            .eq('id', admin.id);

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin.id, 
                username: admin.username 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

// Protected route to verify token
router.get('/verify', verifyToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Get all submissions
router.get('/submissions', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('form_data')
            .select(`
                *,
                academic_details(*),
                reference_details(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Export submissions to Excel
router.get('/export', verifyToken, async (req, res) => {
    try {
        // Fetch all submissions with related data
        const { data: submissions, error } = await supabase
            .from('form_data')
            .select(`
                *,
                academic_details(*),
                reference_details(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data for Excel
        const excelData = submissions.map(submission => ({
            'Full Name': submission.full_name,
            'Mobile Number': submission.mobile_number,
            'Email': submission.email || '',
            'Address': submission.address,
            'Date of Birth': new Date(submission.dob).toLocaleDateString(),
            'Joining Date': new Date(submission.joining_date).toLocaleDateString(),
            'Aadhar Number': submission.aadhar_number,
            'PAN Number': submission.pan_number || '',
            'Father Name': submission.father_name,
            'Height (cm)': submission.height || '',
            'Weight (kg)': submission.weight || '',
            'Academic Qualifications': submission.academic_details?.map(ad => 
                `${ad.qualification} - ${ad.institute} (${ad.passing_year}, ${ad.percentage}%)`
            ).join('; ') || '',
            'References': submission.reference_details?.map(ref =>
                `${ref.name} (${ref.relation}) - ${ref.contact}`
            ).join('; ') || '',
            'Passport Photo URL': submission.passport_photo_url || '',
            'Aadhar Card URL': submission.aadhar_card_url || '',
            'Bank Details URL': submission.bank_details_url || '',
            'Submission Date': new Date(submission.created_at).toLocaleString()
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 20 }, // Full Name
            { wch: 15 }, // Mobile
            { wch: 25 }, // Email
            { wch: 30 }, // Address
            { wch: 12 }, // DOB
            { wch: 12 }, // Joining
            { wch: 15 }, // Aadhar
            { wch: 12 }, // PAN
            { wch: 20 }, // Father
            { wch: 10 }, // Height
            { wch: 10 }, // Weight
            { wch: 50 }, // Academic
            { wch: 50 }, // References
            { wch: 50 }, // Photo URL
            { wch: 50 }, // Aadhar URL
            { wch: 50 }, // Bank URL
            { wch: 20 }  // Date
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

        // Create downloads directory if it doesn't exist
        const downloadsDir = path.join(__dirname, '../downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `submissions_${timestamp}.xlsx`;
        const filepath = path.join(downloadsDir, filename);

        // Write file
        XLSX.writeFile(wb, filepath);

        // Send file
        res.download(filepath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Delete file after sending
            fs.unlink(filepath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                }
            });
        });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get submission details
router.get('/submission/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('form_data')
            .select(`
                *,
                academic_details(*),
                reference_details(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching submission details:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
