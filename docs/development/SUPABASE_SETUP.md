# 🗄️ Supabase Setup Guide

This guide will help you set up Supabase for persistent team storage across devices.

---

## Why Supabase?

- ✅ **Free tier** - Perfect for getting started
- ✅ **PostgreSQL database** - Reliable and powerful
- ✅ **Easy setup** - No complex configuration
- ✅ **Works with Netlify** - Seamless integration
- ✅ **Real-time capable** - Can add real-time features later

---

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Create a new organization (if needed)

---

## Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in:
   - **Name**: `house-games` (or any name you like)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup to complete

---

## Step 3: Get Your API Keys

1. In your project dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

Copy both of these - you'll need them!

---

## Step 4: Create the Database Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste **ONLY the SQL code below** (do NOT include the ```sql markers):

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

4. **Important:** Make sure you only copied the SQL code (lines starting with `--` or `CREATE`), NOT the markdown code block markers (```sql and ```)
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

**Alternative:** You can also copy the SQL from the `SUPABASE_SETUP_SQL.sql` file in the project root, which contains only the SQL code without any markdown formatting.

---

## Step 5: Set Environment Variables

### For Netlify:

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add these two variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Click **"Save"**
6. **Redeploy** your site (go to Deploys → Trigger deploy)

### For Local Development:

1. Create `.env.local` file in project root (if it doesn't exist)
2. Add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Restart your dev server: `npm run dev`

---

## Step 6: Verify It Works

1. Deploy your site (or restart dev server)
2. Create a team on one device
3. Open the teams page on another device
4. Click **"REFRESH"**
5. The team should appear! 🎉

---

## Troubleshooting

### Teams not showing?

1. **Check environment variables** are set correctly
2. **Check Supabase dashboard** → Table Editor → `teams` table
   - You should see teams appearing there
3. **Check browser console** for errors
4. **Verify API keys** are correct (no extra spaces)

### Database errors?

1. Make sure the SQL table was created successfully
2. Check Supabase dashboard → Logs for errors
3. Verify Row Level Security policies are set correctly

### Still not working?

- Check that `NEXT_PUBLIC_` prefix is on both variables
- Make sure you redeployed after adding environment variables
- Try creating a new team to test

---

## Security Notes

⚠️ **Current setup allows all operations** - This is fine for now, but for production you may want to:
- Add authentication
- Restrict who can create/delete teams
- Add rate limiting

The `anon` key is safe to use in client-side code, but you can add more security later.

---

## What's Next?

Once Supabase is set up:
- ✅ Teams persist across server restarts
- ✅ Teams visible across all devices
- ✅ Real-time updates possible (can add later)
- ✅ Scalable to thousands of teams

---

## Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check your Supabase dashboard → Logs for errors

---

**You're all set!** Teams will now persist across devices! 🎉

