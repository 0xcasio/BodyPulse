-- InBody Scan Analyzer Database Schema
-- For Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simple auth for MVP)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- Stores auth.uid() from Supabase Auth (no foreign key needed)
  scan_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_image_url TEXT, -- Optional: can be null if not storing images
  extraction_confidence NUMERIC(5, 2),

  -- Personal info
  user_height NUMERIC(6, 2),
  user_height_unit TEXT CHECK (user_height_unit IN ('in', 'cm', 'ft')),
  user_age INTEGER,
  user_gender TEXT CHECK (user_gender IN ('male', 'female')),
  test_time TEXT,

  -- Core metrics
  weight NUMERIC(8, 2) NOT NULL,
  weight_unit TEXT NOT NULL CHECK (weight_unit IN ('kg', 'lbs')),
  skeletal_muscle_mass NUMERIC(8, 2),
  body_fat_mass NUMERIC(8, 2),
  body_fat_percentage NUMERIC(5, 2),
  bmi NUMERIC(5, 2),

  -- Body composition
  protein NUMERIC(8, 2),
  protein_unit TEXT CHECK (protein_unit IN ('kg', 'lbs')),
  mineral NUMERIC(8, 2),
  mineral_unit TEXT CHECK (mineral_unit IN ('kg', 'lbs')),
  fat_free_mass NUMERIC(8, 2),

  -- Body water
  total_body_water NUMERIC(8, 2),
  intracellular_water NUMERIC(8, 2),
  extracellular_water NUMERIC(8, 2),
  ecw_ratio NUMERIC(5, 3),

  -- Segmental analysis (stored as JSONB for flexibility)
  segmental_lean JSONB,
  segmental_fat JSONB,

  -- Weight control targets
  target_weight NUMERIC(8, 2),
  weight_control NUMERIC(8, 2),
  fat_control NUMERIC(8, 2),
  muscle_control NUMERIC(8, 2),

  -- Body balance
  waist_hip_ratio NUMERIC(5, 3),
  upper_lower_balance TEXT,
  left_right_balance TEXT,

  -- Metabolic
  basal_metabolic_rate INTEGER,
  recommended_calorie_intake INTEGER,
  visceral_fat_level INTEGER,
  obesity_degree NUMERIC(5, 2),

  -- Scores & evaluations
  inbody_score INTEGER,
  phase_angle NUMERIC(5, 2),
  bmc_evaluation TEXT CHECK (bmc_evaluation IN ('Low', 'Normal', 'High')),
  pgc_evaluation TEXT CHECK (pgc_evaluation IN ('Normal', 'Slightly High', 'High')),

  -- Impedance data (JSONB for flexibility)
  impedance_data JSONB,

  -- Edit tracking
  manually_edited BOOLEAN DEFAULT FALSE,
  edited_fields TEXT[]
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_scan_date ON scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_user_date ON scans(user_id, scan_date DESC);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own scans
CREATE POLICY "Users can read own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own scans
CREATE POLICY "Users can insert own scans"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own scans
CREATE POLICY "Users can update own scans"
  ON scans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own scans
CREATE POLICY "Users can delete own scans"
  ON scans FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_scans_updated_at
  BEFORE UPDATE ON scans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

