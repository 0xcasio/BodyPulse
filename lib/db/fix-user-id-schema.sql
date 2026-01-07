-- Fix user_id to work with Supabase Auth
-- Run this in Supabase SQL Editor

-- Drop the foreign key constraint (user_id should reference auth.users, not our users table)
ALTER TABLE scans DROP CONSTRAINT IF EXISTS scans_user_id_fkey;

-- Change user_id to not have a foreign key (it will use auth.uid() from Supabase Auth)
-- The RLS policies will ensure users can only access their own data
ALTER TABLE scans ALTER COLUMN user_id DROP NOT NULL;

-- Note: user_id will now store auth.uid() directly from Supabase Auth
-- The RLS policies check auth.uid() = user_id, which will work correctly



