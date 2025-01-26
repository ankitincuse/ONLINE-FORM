const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
        }
    }
});

// Upload files to Supabase Storage
async function uploadToSupabase(file, folder) {
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}-${file.originalname}`;
    const { data, error } = await supabase.storage
        .from('form-uploads')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype
        });

    if (error) throw error;
    
    const { data: publicUrl } = supabase.storage
        .from('form-uploads')
        .getPublicUrl(fileName);

    return publicUrl.publicUrl;
}

// Handle file uploads
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { type } = req.body; // type can be 'passport', 'aadhar', or 'bank'
        const url = await uploadToSupabase(req.file, type);
        res.json({ url });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
