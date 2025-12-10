/**
 * Test Supabase Connection and Permissions
 * 
 * This script tests if Supabase is configured correctly and if RLS policies allow access.
 * 
 * Usage:
 *   node scripts/test-supabase-connection.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

console.log('✅ Credentials found');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('📊 Testing database connection...\n');
  
  // Test 1: Check if we can query teams table
  console.log('1️⃣ Testing SELECT query on teams table...');
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('   ❌ Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      
      if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy')) {
        console.error('\n   ⚠️  RLS Policy Issue Detected!');
        console.error('   The "Allow all operations" policy might not be set correctly.');
        console.error('   Run this SQL in Supabase Dashboard → SQL Editor:');
        console.error('\n   DROP POLICY IF EXISTS "Allow all operations" ON teams;');
        console.error('   CREATE POLICY "Allow all operations" ON teams');
        console.error('     FOR ALL');
        console.error('     USING (true)');
        console.error('     WITH CHECK (true);\n');
      }
    } else {
      console.log(`   ✅ Success! Found ${data?.length || 0} teams`);
      if (data && data.length > 0) {
        console.log('   Sample team:', data[0]);
      }
    }
  } catch (e) {
    console.error('   ❌ Exception:', e.message);
  }
  
  // Test 2: Try to insert a test team
  console.log('\n2️⃣ Testing INSERT query on teams table...');
  const testTeam = {
    id: `test_${Date.now()}`,
    name: 'Test Team',
    code: 'TEST01',
    admin_id: 'test_admin',
    admin_name: 'Test Admin',
    members: [],
    created_at: new Date().toISOString(),
  };
  
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([testTeam])
      .select()
      .single();
    
    if (error) {
      console.error('   ❌ Error:', error.message);
      console.error('   Code:', error.code);
      
      if (error.code === '23505') {
        console.log('   ⚠️  Duplicate key (expected if test team already exists)');
      } else if (error.code === 'PGRST301' || error.message?.includes('permission')) {
        console.error('\n   ⚠️  RLS Policy Issue Detected!');
        console.error('   The "Allow all operations" policy might not be set correctly.');
      }
    } else {
      console.log('   ✅ Success! Test team inserted:', data.id);
      
      // Clean up: delete test team
      console.log('\n3️⃣ Cleaning up test team...');
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', testTeam.id);
      
      if (deleteError) {
        console.error('   ⚠️  Could not delete test team:', deleteError.message);
      } else {
        console.log('   ✅ Test team deleted');
      }
    }
  } catch (e) {
    console.error('   ❌ Exception:', e.message);
  }
  
  console.log('\n✅ Connection test complete!');
  console.log('\n💡 If you see RLS policy errors, run the SQL from SUPABASE_SETUP_SQL.sql');
  console.log('   in Supabase Dashboard → SQL Editor to fix the policies.\n');
}

testConnection().catch(console.error);

