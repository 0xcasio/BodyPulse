-- Migration: Add scan_insights table
-- Stores AI-generated insights per scan so they persist across sessions/devices.
-- Previously insights were cached in sessionStorage, causing re-generation on every new session.

CREATE TABLE IF NOT EXISTS scan_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID NOT NULL UNIQUE REFERENCES scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  overall_summary TEXT NOT NULL,
  celebration TEXT,
  focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user_id lookups (scan_id already has a unique index from the UNIQUE constraint)
CREATE INDEX IF NOT EXISTS idx_scan_insights_user_id ON scan_insights(user_id);

-- Row Level Security
ALTER TABLE scan_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own insights"
  ON scan_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON scan_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON scan_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON scan_insights FOR DELETE
  USING (auth.uid() = user_id);
