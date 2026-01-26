# 🤖 Automated Database Migrations

## How It Works

When I update the codebase and it requires database changes, I will:

1. ✅ **Create a new migration SQL file** (e.g., `migration_001_add_feature.sql`)
2. ✅ **Update the code** to use the new schema
3. ✅ **Update the migration list** in `scripts/apply-migrations.js`

You then run **one command** to apply all pending migrations:

```bash
npm run migrate
```

---

## Setup (One-Time)

### Option 1: Manual Migration (Easiest, No Setup)

Just run migrations manually in Supabase dashboard when I tell you to. I'll provide the SQL file.

### Option 2: Semi-Automated (Recommended)

1. Make sure your `.env.local` has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

2. Run migrations:
   ```bash
   npm run migrate
   ```

   This will:
   - Show you which migrations are pending
   - Display the SQL to run
   - Track which ones you've applied

### Option 3: Fully Automated (Advanced)

For full automation, you need the **Supabase Service Role Key**:

1. Get it from: Supabase Dashboard → Settings → API → `service_role` key (secret)

2. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. Run:
   ```bash
   npm run migrate:auto SUPABASE_SETUP_SQL.sql
   ```

   ⚠️ **Security Note:** Never commit the service role key to git!

---

## How I'll Handle Future Updates

When code changes require database updates, I will:

### 1. Create Migration File
```sql
-- migration_001_add_user_preferences.sql
ALTER TABLE users ADD COLUMN preferences JSONB;
```

### 2. Update Migration List
I'll add it to the list in `scripts/apply-migrations.js`:
```javascript
const migrationFiles = [
  'SUPABASE_SETUP_SQL.sql',
  'migration_001_add_user_preferences.sql',  // ← New
];
```

### 3. Tell You to Run
I'll say: "Run `npm run migrate` to apply the new migration"

---

## Current Migration Status

Run this to see what's pending:
```bash
npm run migrate
```

---

## Migration Files Location

All migration files are in the project root:
- `SUPABASE_SETUP_SQL.sql` - Initial setup
- `migration_001_*.sql` - Future migrations
- `migration_002_*.sql` - Future migrations
- etc.

---

## Troubleshooting

### "Missing Supabase credentials"
- Create `.env.local` with your Supabase URL and anon key
- Restart your terminal/IDE

### "Migration already applied"
- That's fine! The system tracks what's been applied
- It will skip already-applied migrations

### "Service role key required"
- For full automation, you need the service role key
- Or just run migrations manually (Option 1)

---

## Manual Override

If automation doesn't work, you can always:
1. Open the migration `.sql` file
2. Copy the SQL
3. Paste into Supabase SQL Editor
4. Click "Run"

The migration system just makes it easier! 🚀

