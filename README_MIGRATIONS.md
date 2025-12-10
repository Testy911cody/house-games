# 🚀 Quick Migration Guide

## I can't access your Supabase directly, but here's the easiest way to run migrations:

### Option 1: Use the Migration Script (Easiest)

```bash
npm run migration SUPABASE_SETUP_SQL.sql
```

This will display the SQL code ready to copy/paste into Supabase.

### Option 2: Manual Copy

1. Open `SUPABASE_SETUP_SQL.sql` in your editor
2. Copy all the SQL code
3. Go to Supabase Dashboard → SQL Editor
4. Paste and click "Run"

---

## When Code Changes Require Database Updates

I'll create new migration files with clear names like:
- `migration_001_description.sql`
- `migration_002_description.sql`

Just run them in order using the same process above.

---

## Current Required Migration

**File:** `SUPABASE_SETUP_SQL.sql`

This creates:
- ✅ `teams` table (for team management)
- ✅ `game_states` table (for multiplayer game sync)

**Status:** ⚠️ **You need to run this now** for multiplayer games to work!

---

## Quick Check: Is Your Database Set Up?

Run this in Supabase SQL Editor to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'game_states');
```

If you see both tables, you're good! ✅
If not, run `SUPABASE_SETUP_SQL.sql` first.

