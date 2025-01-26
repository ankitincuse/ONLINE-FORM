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
            throw listError;
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
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
                });

            if (createError) {
                console.error('Error creating bucket:', createError);
                throw createError;
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
                throw updateError;
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
            throw error;
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
            .from('form-uploads')
            .getPublicUrl(fileName);

        return publicUrl.publicUrl;
    } catch (error) {
        console.error('Error in uploadToSupabase:', error);
        throw error;
    }
}

// Handle file upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const { type } = req.body;
        if (!type) {
            throw new Error('File type not specified');
        }

        const url = await uploadToSupabase(req.file, type);
        res.json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Handle form submission
router.post('/submit', async (req, res) => {
    try {
        const result = await saveFormData(req.body);
        res.json(result);
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
