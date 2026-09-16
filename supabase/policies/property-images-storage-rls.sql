-- RLS policies for the "property-images" storage bucket
-- Run in Supabase SQL Editor. Assumes the bucket already exists and is marked public.

-- 1. Public read access (anyone, including anonymous users, can view/download files)
create policy "Public read access for property-images"
on storage.objects
for select
to public
using (bucket_id = 'property-images');

-- 2. Authenticated users can upload files
create policy "Authenticated users can upload property-images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'property-images');

-- 3. Authenticated users can update files
create policy "Authenticated users can update property-images"
on storage.objects
for update
to authenticated
using (bucket_id = 'property-images')
with check (bucket_id = 'property-images');

-- 4. Authenticated users can delete files
create policy "Authenticated users can delete property-images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'property-images');
