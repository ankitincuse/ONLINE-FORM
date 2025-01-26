const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
const ExcelJS = require('exceljs');

// JWT Secret
const JWT_SECRET = 'your-secret-key-123'; // We'll move this to .env later

// Middleware to verify admin token
const authenticateToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = bearerHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);

        const { data: users, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .single();

        console.log('Database response:', { users, error });

        if (error || !users) {
            console.log('User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Attempting password verification');
        console.log('Received password:', password);
        console.log('Stored hash:', users.password_hash);

        const validPassword = await bcrypt.compare(password, users.password_hash);
        console.log('Password valid:', validPassword);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: users.id, username: users.username }, JWT_SECRET, {
            expiresIn: '24h'
        });

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all submissions
router.get('/submissions', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('form_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get submission details
router.get('/submission/:id', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('form_data')
            .select(`
                *,
                academic_details (*),
                reference_details (*)
            `)
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export to Excel route (protected by admin authentication)
router.get('/export', authenticateToken, async (req, res) => {
    try {
        console.log('Starting export process...');

        // Fetch all form data with related details
        const { data: forms, error } = await supabase
            .from('form_data')
            .select(`
                *,
                academic_details(*),
                reference_details(*)
            `);

        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }

        console.log('Retrieved data:', forms);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Form Data');

        // Define columns with proper formatting
        worksheet.columns = [
            // Personal Details
            { header: 'Full Name', key: 'full_name', width: 20 },
            { header: 'Mobile Number', key: 'mobile_number', width: 15 },
            { header: 'Address', key: 'address', width: 30 },
            { header: 'Date of Birth', key: 'dob', width: 15 },
            { header: 'Joining Date', key: 'joining_date', width: 15 },
            { header: 'Aadhar Number', key: 'aadhar_number', width: 15 },
            { header: 'Father Name', key: 'father_name', width: 20 },
            { header: 'Height', key: 'height', width: 10 },
            { header: 'Weight', key: 'weight', width: 10 },
            { header: 'Blood Group', key: 'blood_group', width: 10 },
            
            // Academic Details (up to 3 qualifications)
            { header: 'Qualification 1', key: 'qualification1', width: 20 },
            { header: 'Institute 1', key: 'institute1', width: 30 },
            { header: 'Passing Year 1', key: 'passing_year1', width: 15 },
            { header: 'Percentage 1', key: 'percentage1', width: 10 },
            
            { header: 'Qualification 2', key: 'qualification2', width: 20 },
            { header: 'Institute 2', key: 'institute2', width: 30 },
            { header: 'Passing Year 2', key: 'passing_year2', width: 15 },
            { header: 'Percentage 2', key: 'percentage2', width: 10 },
            
            { header: 'Qualification 3', key: 'qualification3', width: 20 },
            { header: 'Institute 3', key: 'institute3', width: 30 },
            { header: 'Passing Year 3', key: 'passing_year3', width: 15 },
            { header: 'Percentage 3', key: 'percentage3', width: 10 },
            
            // References (up to 2 references)
            { header: 'Reference Name 1', key: 'ref_name1', width: 20 },
            { header: 'Reference Mobile 1', key: 'ref_mobile1', width: 15 },
            { header: 'Reference Relation 1', key: 'ref_relation1', width: 15 },
            
            { header: 'Reference Name 2', key: 'ref_name2', width: 20 },
            { header: 'Reference Mobile 2', key: 'ref_mobile2', width: 15 },
            { header: 'Reference Relation 2', key: 'ref_relation2', width: 15 },
            
            // Document Links
            { header: 'Passport Photo', key: 'passport_photo_url', width: 50 },
            { header: 'Aadhar Card', key: 'aadhar_card_url', width: 50 },
            { header: 'Bank Document', key: 'bank_details_url', width: 50 }
        ];

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        console.log('Processing form data...');

        // Add data rows
        forms.forEach(form => {
            const rowData = {
                // Personal Details
                full_name: form.full_name || '',
                mobile_number: form.mobile_number || '',
                address: form.address || '',
                dob: form.dob || '',
                joining_date: form.joining_date || '',
                aadhar_number: form.aadhar_number || '',
                father_name: form.father_name || '',
                height: form.height || '',
                weight: form.weight || '',
                blood_group: form.blood_group || '',

                // Academic Details
                ...(form.academic_details || []).reduce((acc, academic, index) => {
                    if (index < 3) {
                        acc[`qualification${index + 1}`] = academic.qualification || '';
                        acc[`institute${index + 1}`] = academic.college || '';
                        acc[`passing_year${index + 1}`] = academic.passing_year || '';
                        acc[`percentage${index + 1}`] = academic.percentage || '';
                    }
                    return acc;
                }, {}),

                // References
                ...(form.reference_details || []).reduce((acc, ref, index) => {
                    if (index < 2) {
                        acc[`ref_name${index + 1}`] = ref.name || '';
                        acc[`ref_mobile${index + 1}`] = ref.mobile_number || '';
                        acc[`ref_relation${index + 1}`] = ref.relation || '';
                    }
                    return acc;
                }, {}),

                // Document Links
                passport_photo_url: form.passport_photo_url ? {
                    text: 'View Photo',
                    hyperlink: form.passport_photo_url
                } : '',
                aadhar_card_url: form.aadhar_card_url ? {
                    text: 'View Aadhar',
                    hyperlink: form.aadhar_card_url
                } : '',
                bank_details_url: form.bank_details_url ? {
                    text: 'View Bank Document',
                    hyperlink: form.bank_details_url
                } : ''
            };

            worksheet.addRow(rowData);
        });

        console.log('Applying styles...');

        // Apply styles to all data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                row.eachCell((cell) => {
                    // Add borders to all cells
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };

                    // Center align specific columns
                    const centerAlignColumns = ['mobile_number', 'dob', 'joining_date', 'aadhar_number', 'height', 'weight', 'blood_group'];
                    if (centerAlignColumns.includes(cell.column)) {
                        cell.alignment = { horizontal: 'center' };
                    }
                });

                // Style hyperlinks
                ['passport_photo_url', 'aadhar_card_url', 'bank_details_url'].forEach(col => {
                    const cell = row.getCell(col);
                    if (cell.value && cell.value.hyperlink) {
                        cell.font = {
                            color: { argb: '0000FF' },
                            underline: true
                        };
                        cell.alignment = { horizontal: 'center' };
                    }
                });
            }
        });

        // Format date columns
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const dateColumns = ['dob', 'joining_date'];
                dateColumns.forEach(col => {
                    const cell = row.getCell(col);
                    if (cell.value) {
                        cell.numFmt = 'dd/mm/yyyy';
                    }
                });
            }
        });

        // Auto-filter for all columns
        worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: worksheet.columns.length }
        };

        // Freeze the header row
        worksheet.views = [
            { state: 'frozen', xSplit: 0, ySplit: 1 }
        ];

        console.log('Setting response headers...');

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=form_data.xlsx'
        );

        console.log('Writing workbook to response...');

        // Write to response
        await workbook.xlsx.write(res);
        
        console.log('Export completed successfully');
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
