/**
 * Database Migration Runner
 * 
 * This script helps you run SQL migrations from the command line.
 * It reads SQL files and provides them in a format ready to paste into Supabase.
 * 
 * Usage:
 *   node scripts/run-migration.js SUPABASE_SETUP_SQL.sql
 */

const fs = require('fs');
const path = require('path');

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.log('❌ Please provide a migration file name');
  console.log('\nUsage: node scripts/run-migration.js <migration-file.sql>');
  console.log('\nExample: node scripts/run-migration.js SUPABASE_SETUP_SQL.sql');
  process.exit(1);
}

const filePath = path.join(process.cwd(), migrationFile);

if (!fs.existsSync(filePath)) {
  console.log(`❌ File not found: ${filePath}`);
  process.exit(1);
}

const sql = fs.readFileSync(filePath, 'utf8');

console.log('\n📋 SQL Migration Ready to Copy:\n');
console.log('='.repeat(60));
console.log(sql);
console.log('='.repeat(60));
console.log('\n✅ Copy the SQL above and paste it into Supabase SQL Editor');
console.log('   Then click "Run" to execute the migration.\n');

