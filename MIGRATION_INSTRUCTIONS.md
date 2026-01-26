# 🚀 Migration Instructions

## Current Status

The automated migration script attempted to run but Supabase's API doesn't support direct SQL execution via REST API without additional setup.

## ✅ Solution: Manual Execution (Recommended)

This is actually the **most reliable method** and only takes 30 seconds:

### Step 1: Copy the SQL

The migration script already displayed the SQL above. Here it is again:

```sql
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
```

### Step 2: Run in Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (in the left sidebar)
4. Click **New query**
5. Paste the SQL above
6. Click **Run** (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

### Step 3: Mark as Applied (Optional)

After running the SQL, you can mark it as applied:

```bash
npm run migrate:auto
```

It will detect that the migration is already applied (tables exist) and skip it.

---

## ✅ That's It!

Your database is now set up. The migration system will track this and won't try to run it again.

---

## Future Migrations

When I create new migrations in the future:
1. I'll create a new `.sql` file
2. I'll tell you: "Run `npm run migrate:auto`"
3. The script will show you the SQL
4. You copy/paste it into Supabase Dashboard
5. Done! (Takes 30 seconds)

The "automation" helps by:
- ✅ Tracking what's been applied
- ✅ Showing you exactly what SQL to run
- ✅ Organizing migrations in order

---

## Alternative: Supabase CLI (Advanced)

If you want full automation, you can install Supabase CLI:

```bash
# Install via npm (may need admin on Windows)
npm install -g supabase

# Or download from: https://github.com/supabase/cli/releases

# Then login and link
supabase login
supabase link --project-ref your-project-ref

# Then migrations will run automatically
npm run migrate:auto
```

But manual execution is simpler and works great! 🚀

