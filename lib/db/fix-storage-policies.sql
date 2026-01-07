-- Fix Storage Bucket Policies
-- Run this in Supabase SQL Editor

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to upload scans" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read own scans" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Policy: Allow authenticated users to upload to scan-images bucket
CREATE POLICY "Allow authenticated users to upload scans"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'scan-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to read their own files
CREATE POLICY "Allow authenticated users to read own scans"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'scan-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access (if bucket is public)
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'scan-images');



