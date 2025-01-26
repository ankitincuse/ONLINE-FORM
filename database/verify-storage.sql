-- Check storage bucket
SELECT name, public, owner FROM storage.buckets WHERE name = 'form-uploads';

-- Check storage policies
SELECT name, definition FROM storage.policies WHERE bucket_id = 'form-uploads';
