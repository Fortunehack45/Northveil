import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulkbchewsrksgvlbzjzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testOrQuery(addr) {
  console.log(`\nTesting .or() with address: ${addr}`);
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .or(`address.ilike.${addr},user_id.eq.${addr}`)
      .maybeSingle();

    if (error) {
      console.error('ERROR in .or() query:', error.message);
    } else {
      console.log('SUCCESS in .or() query:', data?.address);
    }
  } catch (e) {
    console.error('EXCEPTION:', e.message);
  }
}

async function testCleanQuery(addr) {
  console.log(`\nTesting clean .eq('address', ...) with: ${addr}`);
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .ilike('address', addr)
      .maybeSingle();

    if (error) {
      console.error('ERROR in clean query:', error.message);
    } else {
      console.log('SUCCESS in clean query:', data?.address, 'pk:', !!data?.private_key);
    }
  } catch (e) {
    console.error('EXCEPTION:', e.message);
  }
}

async function run() {
  await testOrQuery('0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417');
  await testCleanQuery('0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417');
}

run();
