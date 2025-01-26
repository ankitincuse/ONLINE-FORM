-- Enable the storage extension if not already enabled
create extension if not exists "storage";

-- Create a new storage bucket for form uploads
insert into storage.buckets (id, name, public)
values ('form-uploads', 'form-uploads', true);

-- Create a policy to allow public read access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'form-uploads' );

-- Create a policy to allow authenticated uploads
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'form-uploads' );

-- Create a policy to allow authenticated updates
create policy "Allow Updates"
  on storage.objects for update
  using ( bucket_id = 'form-uploads' );

-- Create a policy to allow authenticated deletes
create policy "Allow Deletes"
  on storage.objects for delete
  using ( bucket_id = 'form-uploads' );
