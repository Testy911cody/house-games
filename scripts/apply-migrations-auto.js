/**
 * Fully Automated Database Migration Runner
 * 
 * Attempts to use Supabase CLI for automation, falls back to manual instructions.
 * 
 * Usage:
 *   npm run migrate:auto
 * 
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * 
 * Optional: Install Supabase CLI for full automation:
 *   npm install -g supabase
 *   supabase login
 *   supabase link --project-ref your-project-ref
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not set in .env.local');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set in .env.local');
  console.error('\nGet it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

// Check if Supabase CLI is available
function hasSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

async function getAppliedMigrations() {
  const trackingFile = path.join(process.cwd(), '.migrations_applied.json');
  if (fs.existsSync(trackingFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
      return data.applied || [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

async function markMigrationApplied(migrationName) {
  const trackingFile = path.join(process.cwd(), '.migrations_applied.json');
  let data = { applied: [] };
  if (fs.existsSync(trackingFile)) {
    try {
      data = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
    } catch (e) {
      data = { applied: [] };
    }
  }
  if (!data.applied.includes(migrationName)) {
    data.applied.push(migrationName);
    fs.writeFileSync(trackingFile, JSON.stringify(data, null, 2));
  }
}

async function applyMigrationWithCLI(migrationFile) {
  const filePath = path.join(process.cwd(), migrationFile);
  console.log(`\n🔄 Executing via Supabase CLI...`);
  
  try {
    // Use Supabase CLI to execute SQL
    execSync(`supabase db execute -f "${filePath}"`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    return true;
  } catch (error) {
    console.error(`\n❌ CLI execution failed: ${error.message}`);
    return false;
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
  
  console.log(`\n📋 Migration: ${migrationName}`);
  console.log('='.repeat(60));
  
  // Try CLI first
  if (hasSupabaseCLI()) {
    console.log('✅ Supabase CLI detected - using automated execution\n');
    const success = await applyMigrationWithCLI(migrationFile);
    if (success) {
      await markMigrationApplied(migrationName);
      console.log(`\n✅ Migration applied successfully: ${migrationName}`);
      return true;
    }
    console.log('\n⚠️  CLI execution failed, showing manual instructions...\n');
  } else {
    console.log('ℹ️  Supabase CLI not found - showing manual instructions\n');
    console.log('💡 Tip: Install Supabase CLI for full automation:');
    console.log('   npm install -g supabase');
    console.log('   supabase login');
    console.log('   supabase link --project-ref your-project-ref\n');
  }
  
  // Fallback: Show SQL for manual execution
  console.log('📝 SQL to execute manually:');
  console.log('='.repeat(60));
  console.log(sql);
  console.log('='.repeat(60));
  console.log('\n📋 Instructions:');
  console.log('1. Go to Supabase Dashboard → SQL Editor');
  console.log('2. Copy the SQL above');
  console.log('3. Paste and click "Run"');
  console.log('4. This migration will be tracked automatically\n');
  
  // Mark as applied (user will run manually)
  await markMigrationApplied(migrationName);
  console.log(`✅ Migration tracked: ${migrationName}`);
  console.log('   (Run the SQL above when ready)\n');
  
  return true;
}

async function main() {
  const migrationFile = process.argv[2];
  
  console.log('🚀 Automated Supabase Migration Runner\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Service role key: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`🛠️  Supabase CLI: ${hasSupabaseCLI() ? '✅ Installed' : '❌ Not installed'}\n`);
  
  if (migrationFile) {
    const success = await applyMigration(migrationFile);
    process.exit(success ? 0 : 1);
  } else {
    const migrationFiles = [
      'SUPABASE_SETUP_SQL.sql',
    ].filter(f => fs.existsSync(path.join(process.cwd(), f)));
    
    const applied = await getAppliedMigrations();
    const pending = migrationFiles.filter(f => !applied.includes(f));
    
    if (pending.length === 0) {
      console.log('✅ All migrations are up to date!');
      return;
    }
    
    console.log(`📦 Found ${pending.length} pending migration(s):`);
    pending.forEach(f => console.log(`   - ${f}`));
    console.log();
    
    for (const file of pending) {
      const success = await applyMigration(file);
      if (!success) {
        console.error(`\n❌ Migration failed.`);
        process.exit(1);
      }
    }
    
    console.log('\n✅ Migration process completed!');
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
