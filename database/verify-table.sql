-- Check form_data table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'form_data'
ORDER BY ordinal_position;
