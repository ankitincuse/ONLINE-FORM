-- Add file URL columns to form_data table
ALTER TABLE form_data
ADD COLUMN IF NOT EXISTS passport_photo_url TEXT,
ADD COLUMN IF NOT EXISTS aadhar_card_url TEXT,
ADD COLUMN IF NOT EXISTS bank_details_url TEXT;
