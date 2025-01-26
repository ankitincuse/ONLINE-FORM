-- Drop existing policies if any
DROP POLICY IF EXISTS "Give public access to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow file updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow file deletions" ON storage.objects;

-- Create new policies
CREATE POLICY "Give public access to files"
ON storage.objects FOR SELECT
USING (bucket_id = 'form-uploads');

CREATE POLICY "Allow file uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'form-uploads');

CREATE POLICY "Allow file updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'form-uploads');

CREATE POLICY "Allow file deletions"
ON storage.objects FOR DELETE
USING (bucket_id = 'form-uploads');

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO anon;
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO anon;
