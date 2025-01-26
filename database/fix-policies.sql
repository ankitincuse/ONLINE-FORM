-- Temporarily disable RLS for testing
ALTER TABLE form_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE reference_details DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON form_data TO anon;
GRANT ALL ON academic_details TO anon;
GRANT ALL ON reference_details TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
