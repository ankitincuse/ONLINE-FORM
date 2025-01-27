const express = require('express');
const router = express.Router();
const multer = require('multer');
const { saveFormData } = require('../models/formModel');
const supabase = require('../config/supabase');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Function to ensure bucket exists
async function ensureBucketExists() {
    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase
            .storage
            .listBuckets();

        if (listError) {
            console.error('Error listing buckets:', listError);
            throw new Error('Failed to check storage bucket');
        }

        const formUploadsBucket = buckets.find(b => b.name === 'form-uploads');
        
        if (!formUploadsBucket) {
            console.log('Creating form-uploads bucket...');
            // Create the bucket if it doesn't exist
            const { data, error: createError } = await supabase
                .storage
                .createBucket('form-uploads', {
                    public: true,
                    fileSizeLimit: 5242880, // 5MB in bytes
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
                });

            if (createError) {
                console.error('Error creating bucket:', createError);
                throw new Error('Failed to create storage bucket');
            }
            console.log('Bucket created successfully');

            // Update bucket public access
            const { error: updateError } = await supabase
                .storage
                .updateBucket('form-uploads', {
                    public: true
                });

            if (updateError) {
                console.error('Error updating bucket:', updateError);
                throw new Error('Failed to configure storage bucket');
            }
        }
    } catch (error) {
        console.error('Error in ensureBucketExists:', error);
        throw error;
    }
}

// Function to upload file to Supabase Storage
async function uploadToSupabase(file, folder) {
    try {
        await ensureBucketExists();

        if (!file || !file.buffer) {
            throw new Error('Invalid file data');
        }

        const timestamp = Date.now();
        const fileName = `${folder}/${timestamp}-${file.originalname}`;

        const { data, error } = await supabase.storage
            .from('form-uploads')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file');
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
            .from('form-uploads')
            .getPublicUrl(fileName);

        if (!publicUrl || !publicUrl.publicUrl) {
            throw new Error('Failed to get file URL');
        }

        return publicUrl.publicUrl;
    } catch (error) {
        console.error('Error in uploadToSupabase:', error);
        throw error;
    }
}

// Handle form submission
const formUpload = upload.fields([
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'bankDoc', maxCount: 1 }
]);

router.post('/submit', formUpload, async (req, res) => {
    try {
        // Parse the JSON data from the form
        let formData;
        try {
            formData = JSON.parse(req.body.data);
        } catch (error) {
            console.error('Error parsing form data:', error);
            return res.status(400).json({
                success: false,
                error: 'Invalid form data format'
            });
        }

        // Validate required fields
        const requiredFields = [
            'full_name',
            'mobile_number',
            'address',
            'dob',
            'joining_date',
            'aadhar_number',
            'father_name'
        ];

        for (const field of requiredFields) {
            if (!formData[field]) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required field: ${field}`
                });
            }
        }

        // Validate files
        const requiredFiles = ['passportPhoto', 'aadharCard', 'bankDoc'];
        for (const field of requiredFiles) {
            if (!req.files || !req.files[field] || !req.files[field][0]) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required file: ${field}`
                });
            }
        }

        // Upload files and get URLs
        try {
            for (const [fieldName, files] of Object.entries(req.files)) {
                if (files && files[0]) {
                    const file = files[0];
                    const url = await uploadToSupabase(file, fieldName);
                    
                    switch (fieldName) {
                        case 'passportPhoto':
                            formData.passport_photo_url = url;
                            break;
                        case 'aadharCard':
                            formData.aadhar_card_url = url;
                            break;
                        case 'bankDoc':
                            formData.bank_details_url = url;
                            break;
                    }
                }
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to upload files'
            });
        }

        // Save to database
        try {
            const result = await saveFormData(formData);
            return res.json({
                success: true,
                message: 'Form submitted successfully',
                data: result
            });
        } catch (error) {
            console.error('Error saving form data:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to save form data'
            });
        }
    } catch (error) {
        console.error('Form submission error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Form submission failed'
        });
    }
});

module.exports = router;
