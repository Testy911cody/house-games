# 🗄️ Database Migrations Guide

This guide helps you keep your Supabase database schema up-to-date with the latest code changes.

---

## How It Works

When the codebase is updated with new database requirements, migration SQL files will be created here. You can run these in your Supabase SQL Editor to update your database schema.

---

## Migration Files

### Initial Setup (Run First)

**File:** `SUPABASE_SETUP_SQL.sql`

This creates the initial tables:
- `teams` - For team management
- `game_states` - For multiplayer game synchronization

**How to run:**
1. Open Supabase dashboard → SQL Editor
2. Copy the contents of `SUPABASE_SETUP_SQL.sql`
3. Paste and click "Run"

---

## Future Migrations

When new features require database changes, migration files will be added here with names like:
- `migration_001_add_new_table.sql`
- `migration_002_add_columns.sql`
- etc.

Each migration file will include:
- What it does
- When to run it
- How to verify it worked

---

## Checking Your Current Schema

To see what tables you currently have:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check teams table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'teams';

-- Check game_states table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'game_states';
```

---

## Troubleshooting

### "Table already exists" error
- This is fine! The `IF NOT EXISTS` clause means it won't create duplicates
- You can safely ignore this error

### "Policy already exists" error
- Drop the existing policy first:
```sql
DROP POLICY IF EXISTS "Allow all operations" ON teams;
DROP POLICY IF EXISTS "Allow all operations" ON game_states;
```
- Then re-run the migration

### Need to reset everything?
```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS game_states CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
```
- Then re-run `SUPABASE_SETUP_SQL.sql`

---

## Best Practices

1. **Backup first** - Before running migrations, export your data from Supabase dashboard
2. **Test in development** - If you have a dev Supabase project, test migrations there first
3. **Run one at a time** - Don't run multiple migrations simultaneously
4. **Verify after** - Check that tables/columns were created correctly

---

## Need Help?

- Check Supabase dashboard → Logs for errors
- Verify your SQL syntax matches the migration file exactly
- Make sure you're copying only the SQL code (not markdown markers)

