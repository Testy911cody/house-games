-- Game Rooms table for multiplayer lobby system
-- This table manages game rooms/lobbies where players can join before starting a game

-- Create game_rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,              -- 6-char room code (e.g., "ABC123")
  game_type TEXT NOT NULL,                -- "codenames", "ludo", "taboo", etc.
  host_id TEXT NOT NULL,                  -- User ID who created the room
  host_name TEXT NOT NULL,                -- Display name of the host
  is_private BOOLEAN DEFAULT false,       -- Private (code-only) vs public (visible in lobby)
  status TEXT DEFAULT 'waiting',          -- waiting, playing, finished
  max_players INTEGER DEFAULT 4,          -- Maximum players allowed
  min_players INTEGER DEFAULT 2,          -- Minimum players to start
  current_players JSONB DEFAULT '[]',     -- Array of {id, name, team, isReady, joinedAt}
  settings JSONB DEFAULT '{}',            -- Game-specific settings (difficulty, time limits, etc.)
  team_mode BOOLEAN DEFAULT false,        -- Whether this is a team-based game
  teams JSONB DEFAULT '[]',               -- Array of {id, name, color, players: []}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,                 -- When the game started
  finished_at TIMESTAMPTZ                 -- When the game finished
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_rooms_code ON game_rooms(code);
CREATE INDEX IF NOT EXISTS idx_game_rooms_game_type ON game_rooms(game_type);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_host_id ON game_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_is_private ON game_rooms(is_private);
CREATE INDEX IF NOT EXISTS idx_game_rooms_created_at ON game_rooms(created_at);

-- Composite index for public lobby queries (find public waiting rooms by game type)
CREATE INDEX IF NOT EXISTS idx_game_rooms_public_waiting 
  ON game_rooms(game_type, status, is_private) 
  WHERE status = 'waiting' AND is_private = false;

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Allow all operations on game_rooms" ON game_rooms;
DROP POLICY IF EXISTS "Allow read access to game_rooms" ON game_rooms;
DROP POLICY IF EXISTS "Allow insert to game_rooms" ON game_rooms;
DROP POLICY IF EXISTS "Allow update to game_rooms" ON game_rooms;
DROP POLICY IF EXISTS "Allow delete to game_rooms" ON game_rooms;

-- Create policy to allow all operations (permissive for now, can be restricted later)
CREATE POLICY "Allow all operations on game_rooms" ON game_rooms
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_game_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_game_rooms_updated_at ON game_rooms;
CREATE TRIGGER trigger_update_game_rooms_updated_at
  BEFORE UPDATE ON game_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_game_rooms_updated_at();

-- Function to clean up old/stale rooms (rooms older than 24 hours or finished > 1 hour ago)
CREATE OR REPLACE FUNCTION cleanup_stale_game_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM game_rooms
  WHERE 
    -- Delete rooms that have been waiting for more than 24 hours
    (status = 'waiting' AND created_at < NOW() - INTERVAL '24 hours')
    OR
    -- Delete rooms that finished more than 1 hour ago
    (status = 'finished' AND finished_at < NOW() - INTERVAL '1 hour')
    OR
    -- Delete rooms that have been playing for more than 12 hours (likely abandoned)
    (status = 'playing' AND started_at < NOW() - INTERVAL '12 hours');
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up stale rooms (requires pg_cron extension)
-- If pg_cron is available, uncomment the following:
-- SELECT cron.schedule('cleanup-stale-rooms', '0 * * * *', 'SELECT cleanup_stale_game_rooms()');

COMMENT ON TABLE game_rooms IS 'Stores multiplayer game rooms/lobbies for matchmaking';
COMMENT ON COLUMN game_rooms.code IS '6-character alphanumeric room code for sharing';
COMMENT ON COLUMN game_rooms.game_type IS 'Type of game: codenames, taboo, jeopardy, drawguess, werewolf, ludo, monopoly';
COMMENT ON COLUMN game_rooms.status IS 'Room status: waiting (in lobby), playing (game in progress), finished (game ended)';
COMMENT ON COLUMN game_rooms.current_players IS 'JSON array of player objects: [{id, name, team, isReady, joinedAt}]';
COMMENT ON COLUMN game_rooms.settings IS 'Game-specific settings like difficulty, time limits, custom rules';
COMMENT ON COLUMN game_rooms.teams IS 'For team games: [{id, name, color, players: [{id, name}]}]';

