-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for form_data" ON form_data;
DROP POLICY IF EXISTS "Allow all operations for academic_details" ON academic_details;
DROP POLICY IF EXISTS "Allow all operations for reference_details" ON reference_details;

-- Enable RLS
ALTER TABLE form_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_details ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable all access for form_data" ON form_data
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for academic_details" ON academic_details
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for reference_details" ON reference_details
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON form_data TO anon;
GRANT ALL ON academic_details TO anon;
GRANT ALL ON reference_details TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
