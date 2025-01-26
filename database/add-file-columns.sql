-- Add file URL columns if they don't exist
ALTER TABLE form_data
ADD COLUMN IF NOT EXISTS passport_photo_url TEXT,
ADD COLUMN IF NOT EXISTS aadhar_card_url TEXT,
ADD COLUMN IF NOT EXISTS bank_details_url TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT;
