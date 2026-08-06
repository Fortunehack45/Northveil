import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulkbchewsrksgvlbzjzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function dump() {
  const { data, error } = await supabase.from('wallets').select('*');
  if (error) {
    console.error('Error dumping wallets:', error);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

dump();
