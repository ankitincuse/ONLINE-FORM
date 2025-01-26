-- First, drop all existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow file updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow file deletions" ON storage.objects;

-- Disable RLS temporarily
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create a single policy that allows everything for the form-uploads bucket
CREATE POLICY "Allow all operations"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'form-uploads')
WITH CHECK (bucket_id = 'form-uploads');

-- Enable RLS again
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Ensure proper permissions
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- Make sure the bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'form-uploads';
