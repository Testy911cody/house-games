# 🗄️ Supabase Setup Guide

This guide will help you set up Supabase for persistent group storage across devices.

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
3. Paste this SQL:

```sql
-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
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
CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(code);

-- Enable Row Level Security (optional, for future security)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for now)
-- You can restrict this later for better security
CREATE POLICY "Allow all operations" ON groups
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

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
2. Create a group on one device
3. Open the groups page on another device
4. Click **"REFRESH"**
5. The group should appear! 🎉

---

## Troubleshooting

### Groups not showing?

1. **Check environment variables** are set correctly
2. **Check Supabase dashboard** → Table Editor → `groups` table
   - You should see groups appearing there
3. **Check browser console** for errors
4. **Verify API keys** are correct (no extra spaces)

### Database errors?

1. Make sure the SQL table was created successfully
2. Check Supabase dashboard → Logs for errors
3. Verify Row Level Security policies are set correctly

### Still not working?

- Check that `NEXT_PUBLIC_` prefix is on both variables
- Make sure you redeployed after adding environment variables
- Try creating a new group to test

---

## Security Notes

⚠️ **Current setup allows all operations** - This is fine for now, but for production you may want to:
- Add authentication
- Restrict who can create/delete groups
- Add rate limiting

The `anon` key is safe to use in client-side code, but you can add more security later.

---

## What's Next?

Once Supabase is set up:
- ✅ Groups persist across server restarts
- ✅ Groups visible across all devices
- ✅ Real-time updates possible (can add later)
- ✅ Scalable to thousands of groups

---

## Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check your Supabase dashboard → Logs for errors

---

**You're all set!** Groups will now persist across devices! 🎉

