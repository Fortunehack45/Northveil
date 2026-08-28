import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Inspecting passkey_credentials table...');
try {
  const { data, error } = await supabase.from('passkey_credentials').select('*');
  if (error) {
    console.error('Supabase error:', error.message);
  } else {
    console.log('Passkey Records count:', data?.length);
    console.log('Records:', JSON.stringify(data, null, 2));
  }
} catch (e) {
  console.error('Error:', e.message);
}
