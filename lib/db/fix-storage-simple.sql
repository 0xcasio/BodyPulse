-- Simple Storage Policy Fix - RUN THIS NOW
-- Run this in Supabase SQL Editor

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload scans" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read own scans" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read" ON storage.objects;
DROP POLICY IF EXISTS "Public can read" ON storage.objects;

-- Simple policy: Allow any authenticated user to upload to scan-images bucket
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'scan-images');

-- Simple policy: Allow any authenticated user to read from scan-images bucket
CREATE POLICY "Authenticated users can read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'scan-images');

-- Allow public read (if bucket is public)
CREATE POLICY "Public can read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'scan-images');
