-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for form_data" ON form_data;
DROP POLICY IF EXISTS "Allow all operations for academic_details" ON academic_details;
DROP POLICY IF EXISTS "Allow all operations for reference_details" ON reference_details;

-- Create new policies that explicitly allow insert operations
CREATE POLICY "Enable insert for form_data" ON form_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for academic_details" ON academic_details
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for reference_details" ON reference_details
    FOR INSERT WITH CHECK (true);

-- Also add select policies to view the data
CREATE POLICY "Enable select for form_data" ON form_data
    FOR SELECT USING (true);

CREATE POLICY "Enable select for academic_details" ON academic_details
    FOR SELECT USING (true);

CREATE POLICY "Enable select for reference_details" ON reference_details
    FOR SELECT USING (true);
