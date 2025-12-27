-- Add last_game_access column to teams table
-- This tracks when a team last accessed any game

ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS last_game_access TIMESTAMPTZ;

-- Create index for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_teams_last_game_access ON teams(last_game_access);

-- Update existing teams to have null last_game_access (they haven't accessed games yet)
UPDATE teams 
SET last_game_access = NULL 
WHERE last_game_access IS NULL;

-- Function to clean up inactive/empty teams (aggressive cleanup)
CREATE OR REPLACE FUNCTION cleanup_inactive_teams()
RETURNS void AS $$
BEGIN
  DELETE FROM teams
  WHERE 
    -- Delete teams with no members (empty teams) older than 10 minutes
    ((members = '[]'::jsonb OR members IS NULL OR jsonb_array_length(members) = 0) 
     AND created_at < NOW() - INTERVAL '10 minutes')
    OR
    -- Delete teams with no game access in the last 10 minutes and older than 10 minutes
    (last_game_access IS NOT NULL 
     AND last_game_access < NOW() - INTERVAL '10 minutes'
     AND created_at < NOW() - INTERVAL '10 minutes')
    OR
    -- Delete teams that never played a game and are older than 1 hour
    (last_game_access IS NULL AND created_at < NOW() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql;

