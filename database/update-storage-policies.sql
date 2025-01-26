-- Drop existing policies
DROP POLICY IF EXISTS "Give public access to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow file updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow file deletions" ON storage.objects;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new policies that allow anonymous access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'form-uploads');

CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'form-uploads');

CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'form-uploads');

CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'form-uploads');

-- Grant necessary permissions to anonymous users
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO anon;

-- Update bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'form-uploads';
