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

