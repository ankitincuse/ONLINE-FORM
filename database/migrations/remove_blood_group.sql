-- Remove blood_group column from form_data table
ALTER TABLE form_data DROP COLUMN IF EXISTS blood_group;
