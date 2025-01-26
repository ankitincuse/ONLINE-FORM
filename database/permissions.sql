-- First, disable RLS
ALTER TABLE form_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE reference_details DISABLE ROW LEVEL SECURITY;

-- Grant full access to the anon role
GRANT ALL PRIVILEGES ON TABLE form_data TO anon;
GRANT ALL PRIVILEGES ON TABLE academic_details TO anon;
GRANT ALL PRIVILEGES ON TABLE reference_details TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE form_data_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE academic_details_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE reference_details_id_seq TO anon;
