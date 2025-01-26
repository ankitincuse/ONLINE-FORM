-- Add new columns to form_data table
ALTER TABLE form_data 
ADD COLUMN passport_photo_url TEXT,
ADD COLUMN aadhar_card_url TEXT,
ADD COLUMN bank_details_url TEXT,
ADD COLUMN bank_name VARCHAR(100),
ADD COLUMN account_number VARCHAR(50),
ADD COLUMN ifsc_code VARCHAR(20);
