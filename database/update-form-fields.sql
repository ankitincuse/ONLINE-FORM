-- Remove bank details columns except bank_details_url
ALTER TABLE form_data
DROP COLUMN IF EXISTS bank_name,
DROP COLUMN IF EXISTS account_number,
DROP COLUMN IF EXISTS ifsc_code;

-- Add new columns
ALTER TABLE form_data
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2), -- in cm
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2), -- in kg
ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5),
ADD COLUMN IF NOT EXISTS bank_details_url TEXT;
