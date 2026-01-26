-- Safe version: Drops existing policies before creating new ones
-- Use this if you get "policy already exists" errors

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  admin_id TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  members JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(code);

-- Create game_states table for multiplayer game synchronization
CREATE TABLE IF NOT EXISTS game_states (
  id TEXT PRIMARY KEY,
  game_type TEXT NOT NULL,
  team_id TEXT,
  state JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_states_game_type ON game_states(game_type);
CREATE INDEX IF NOT EXISTS idx_game_states_team_id ON game_states(team_id);
CREATE INDEX IF NOT EXISTS idx_game_states_last_updated ON game_states(last_updated);

-- Enable Row Level Security (optional, for future security)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Allow all operations" ON teams;
DROP POLICY IF EXISTS "Allow all operations" ON game_states;

-- Create policy to allow all operations (for now)
-- You can restrict this later for better security
CREATE POLICY "Allow all operations" ON teams
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON game_states
  FOR ALL
  USING (true)
  WITH CHECK (true);

