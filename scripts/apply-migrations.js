/**
 * Automated Database Migration Runner
 * 
 * This script automatically applies SQL migrations to your Supabase database.
 * It uses your Supabase credentials from environment variables.
 * 
 * Usage:
 *   node scripts/apply-migrations.js
 * 
 * Or with a specific migration:
 *   node scripts/apply-migrations.js SUPABASE_SETUP_SQL.sql
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('\nPlease set these environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\nOr create a .env.local file with:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration tracking table name
const MIGRATIONS_TABLE = 'schema_migrations';

async function ensureMigrationsTable() {
  // Check if migrations table exists, create if not
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        migration_name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }).catch(async () => {
    // If exec_sql doesn't exist, try direct SQL (requires service role key)
    // For now, we'll use a simpler approach with a migrations file
    console.log('⚠️  Note: Using file-based migration tracking');
  });
}

async function getAppliedMigrations() {
  try {
    const { data, error } = await supabase
      .from(MIGRATIONS_TABLE)
      .select('migration_name');
    
    if (error) {
      // Table doesn't exist yet, return empty array
      return [];
    }
    
    return data.map(row => row.migration_name);
  } catch (e) {
    // Fallback: check local file
    const trackingFile = path.join(process.cwd(), '.migrations_applied.json');
    if (fs.existsSync(trackingFile)) {
      const data = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
      return data.applied || [];
    }
    return [];
  }
}

async function markMigrationApplied(migrationName) {
  try {
    await supabase
      .from(MIGRATIONS_TABLE)
      .insert({ migration_name: migrationName });
  } catch (e) {
    // Fallback: save to file
    const trackingFile = path.join(process.cwd(), '.migrations_applied.json');
    let data = { applied: [] };
    if (fs.existsSync(trackingFile)) {
      data = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
    }
    if (!data.applied.includes(migrationName)) {
      data.applied.push(migrationName);
      fs.writeFileSync(trackingFile, JSON.stringify(data, null, 2));
    }
  }
}

async function applyMigration(migrationFile) {
  const filePath = path.join(process.cwd(), migrationFile);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`);
    return false;
  }
  
  const sql = fs.readFileSync(filePath, 'utf8');
  const migrationName = path.basename(migrationFile, '.sql');
  
  console.log(`\n📋 Applying migration: ${migrationName}`);
  console.log('='.repeat(60));
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  try {
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // Try alternative: direct query (may require service role)
          console.log(`⚠️  Note: Some operations may require manual execution`);
          console.log(`   Run this SQL manually in Supabase dashboard:`);
          console.log(`\n${sql}\n`);
          return false;
        }
      }
    }
    
    // Mark as applied
    await markMigrationApplied(migrationName);
    console.log(`✅ Migration applied successfully: ${migrationName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error applying migration: ${error.message}`);
    console.log(`\n📋 Please run this SQL manually in Supabase dashboard:`);
    console.log('='.repeat(60));
    console.log(sql);
    console.log('='.repeat(60));
    return false;
  }
}

async function main() {
  const migrationFile = process.argv[2];
  
  console.log('🚀 Supabase Migration Runner\n');
  
  if (migrationFile) {
    // Apply specific migration
    await applyMigration(migrationFile);
  } else {
    // Apply all pending migrations
    const migrationsDir = process.cwd();
    const migrationFiles = [
      'SUPABASE_SETUP_SQL.sql',
      // Add more migration files here as they're created
    ].filter(f => fs.existsSync(path.join(migrationsDir, f)));
    
    const applied = await getAppliedMigrations();
    const pending = migrationFiles.filter(f => !applied.includes(f));
    
    if (pending.length === 0) {
      console.log('✅ All migrations are up to date!');
      return;
    }
    
    console.log(`📦 Found ${pending.length} pending migration(s):`);
    pending.forEach(f => console.log(`   - ${f}`));
    
    for (const file of pending) {
      const success = await applyMigration(file);
      if (!success) {
        console.error(`\n❌ Migration failed. Please fix errors and try again.`);
        process.exit(1);
      }
    }
    
    console.log('\n✅ All migrations applied successfully!');
  }
}

main().catch(console.error);

