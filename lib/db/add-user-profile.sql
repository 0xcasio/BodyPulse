-- Migration: Add user profile fields to users table
-- This migration adds profile information fields to the users table

-- Add profile fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS default_age INTEGER,
ADD COLUMN IF NOT EXISTS default_height NUMERIC(6, 2),
ADD COLUMN IF NOT EXISTS default_height_unit TEXT CHECK (default_height_unit IN ('in', 'cm', 'ft')),
ADD COLUMN IF NOT EXISTS default_weight NUMERIC(8, 2),
ADD COLUMN IF NOT EXISTS default_weight_unit TEXT CHECK (default_weight_unit IN ('kg', 'lbs')),
ADD COLUMN IF NOT EXISTS default_gender TEXT CHECK (default_gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS preferred_units TEXT CHECK (preferred_units IN ('metric', 'imperial'));

-- Row Level Security (RLS) policies for users table
-- Note: These policies ensure users can only access their own profile data

-- Policy: Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (when creating account)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

