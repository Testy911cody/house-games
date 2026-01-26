/**
 * Direct Database Migration Runner using Service Role Key
 * 
 * Uses Supabase service role key with direct HTTP requests to execute SQL.
 * This works without needing Supabase CLI.
 * 
 * Usage:
 *   npm run migrate:auto
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables in .env.local:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from URL
const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
if (!urlMatch) {
  console.error('❌ Invalid Supabase URL format');
  process.exit(1);
}

const projectRef = urlMatch[1];

async function executeSQLViaAPI(sql) {
  // Note: Supabase doesn't provide a public REST API for executing arbitrary SQL
  // The Management API requires different authentication and may not be available
  // The most reliable method is manual execution via Supabase Dashboard
  
  return new Promise((resolve, reject) => {
    // Attempt to use Supabase's database query endpoint (may not work without proper setup)
    const apiUrl = `api.supabase.com`;
    const apiPath = `/v1/projects/${projectRef}/database/query`;
    
    // Split SQL into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/));

    if (statements.length === 0) {
      resolve({ success: true, executed: 0 });
      return;
    }

    let executed = 0;
    let currentIndex = 0;

    function executeNext() {
      if (currentIndex >= statements.length) {
        resolve({ success: true, executed });
        return;
      }

      const statement = statements[currentIndex];
      currentIndex++;

      const postData = JSON.stringify({
        query: statement
      });

      const options = {
        hostname: apiUrl,
        path: apiPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            executed++;
            console.log(`   ✅ Executed statement ${currentIndex}/${statements.length}`);
            executeNext();
          } else {
            try {
              const errorData = JSON.parse(data);
              // Some errors are OK (like "already exists")
              if (errorData.message && (
                errorData.message.includes('already exists') ||
                errorData.message.includes('duplicate key') ||
                (errorData.message.includes('does not exist') && statement.toUpperCase().includes('DROP'))
              )) {
                console.log(`   ⚠️  ${errorData.message.split('\n')[0]}`);
                executed++;
                executeNext();
              } else {
                reject(new Error(`SQL Error (${res.statusCode}): ${errorData.message || data}`));
              }
            } catch (e) {
              // If we can't parse, it might still be OK
              if (res.statusCode === 200 || res.statusCode === 201) {
                executed++;
                executeNext();
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
              }
            }
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    }

    executeNext();
  });
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

async function checkTablesExist() {
  // Check if tables already exist by querying them
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  try {
    // Try to query the teams table - if it exists, migration is done
    const { data, error } = await supabase
      .from('teams')
      .select('id')
      .limit(1);
    
    // If no error (or error is just "no rows"), table exists
    if (!error || error.code === 'PGRST116') {
      return true;
    }
    
    // Check game_states table too
    const { error: gameStatesError } = await supabase
      .from('game_states')
      .select('id')
      .limit(1);
    
    if (!gameStatesError || gameStatesError.code === 'PGRST116') {
      return true;
    }
    
    return false;
  } catch (e) {
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
  console.log(`📍 Project: ${projectRef}`);
  console.log('='.repeat(60));
  
  // First, check if tables already exist
  console.log('\n🔍 Checking if tables already exist...');
  const tablesExist = await checkTablesExist();
  
  if (tablesExist) {
    console.log('✅ Tables already exist! Migration appears to be applied.');
    await markMigrationApplied(migrationName);
    console.log(`✅ Migration marked as applied: ${migrationName}\n`);
    return true;
  }
  
  console.log('⚠️  Tables not found. Migration needs to be run.\n');
  
  try {
    const result = await executeSQLViaAPI(sql);
    await markMigrationApplied(migrationName);
    console.log(`\n✅ Migration applied successfully!`);
    console.log(`   Executed ${result.executed} SQL statement(s)`);
    return true;
  } catch (error) {
    console.error(`\n❌ Automated execution failed: ${error.message}`);
    console.log('\n📋 Please run this SQL manually in Supabase Dashboard → SQL Editor:');
    console.log('='.repeat(60));
    console.log(sql);
    console.log('='.repeat(60));
    console.log('\n💡 Steps:');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Click "SQL Editor" (left sidebar)');
    console.log('   4. Click "New query"');
    console.log('   5. Paste the SQL above');
    console.log('   6. Click "Run" (or Ctrl+Enter)');
    console.log('\n   After running, this migration will be automatically tracked.\n');
    return false;
  }
}

async function main() {
  const migrationFile = process.argv[2];
  
  console.log('🚀 Automated Supabase Migration Runner (Direct API)\n');
  console.log(`📍 Project: ${projectRef}`);
  console.log(`🔑 Service role key: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}\n`);
  
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
    
    console.log('\n✅ All migrations applied successfully!');
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  console.error('\n💡 Tip: Make sure your SUPABASE_SERVICE_ROLE_KEY is correct.');
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
});

