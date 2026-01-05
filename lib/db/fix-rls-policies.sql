-- Fix RLS Policies for Authentication
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies on scans table (both MVP and auth-based)
DROP POLICY IF EXISTS "Users can read own scans" ON scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON scans;
DROP POLICY IF EXISTS "Users can update own scans" ON scans;
DROP POLICY IF EXISTS "Users can delete own scans" ON scans;
DROP POLICY IF EXISTS "Allow read scans for MVP" ON scans;
DROP POLICY IF EXISTS "Allow insert scans for MVP" ON scans;
DROP POLICY IF EXISTS "Allow update scans for MVP" ON scans;
DROP POLICY IF EXISTS "Allow delete scans for MVP" ON scans;

-- Create auth-based policies
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
