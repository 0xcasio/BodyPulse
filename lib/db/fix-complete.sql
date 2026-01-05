-- Complete Fix for Authentication Issues
-- Run this in Supabase SQL Editor

-- Step 1: Fix scans table - remove foreign key constraint
ALTER TABLE scans DROP CONSTRAINT IF EXISTS scans_user_id_fkey;

-- Step 2: Ensure user_id is NOT NULL (it will store auth.uid())
ALTER TABLE scans ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Drop old RLS policies
DROP POLICY IF EXISTS "Users can read own scans" ON scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON scans;
DROP POLICY IF EXISTS "Users can update own scans" ON scans;
DROP POLICY IF EXISTS "Users can delete own scans" ON scans;
DROP POLICY IF EXISTS "Allow read scans for MVP" ON scans;
DROP POLICY IF EXISTS "Allow insert scans for MVP" ON scans;
DROP POLICY IF EXISTS "Allow update scans for MVP" ON scans;
DROP POLICY IF EXISTS "Allow delete scans for MVP" ON scans;

-- Step 4: Create correct auth-based RLS policies
CREATE POLICY "Users can read own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON scans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON scans FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Fix Storage bucket policies
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Allow authenticated users to upload scans" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read own scans" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Policy: Allow authenticated users to upload to scan-images bucket
-- Files are stored as {user_id}/{timestamp}.{ext}
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

