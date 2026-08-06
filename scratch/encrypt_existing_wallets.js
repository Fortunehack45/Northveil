import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://ulkbchewsrksgvlbzjzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MASTER_SECRET = 'northveil_production_master_vault_key_2026';

function getMasterKey() {
  return crypto.createHash('sha256').update(MASTER_SECRET).digest();
}

function encryptCredential(plaintext) {
  const iv = crypto.randomBytes(12);
  const masterKey = getMasterKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

async function fixWallets() {
  console.log('Fetching all rows from wallets table...');
  const { data: rows, error } = await supabase.from('wallets').select('*');

  if (error) {
    console.error('Error fetching wallets:', error.message);
    return;
  }

  console.log(`Found ${rows.length} rows in wallets table.`);

  for (const row of rows) {
    const rawCredential = row.seed_phrase || row.private_key;
    if (rawCredential) {
      const encrypted = encryptCredential(rawCredential);
      const credType = row.seed_phrase ? 'seed_phrase' : 'private_key';

      console.log(`Encrypting wallet address: ${row.address} (type: ${credType})`);
      const { error: updateErr } = await supabase
        .from('wallets')
        .update({
          encrypted_credential: encrypted.ciphertext,
          iv: encrypted.iv,
          auth_tag: encrypted.authTag,
          credential_type: credType
        })
        .eq('id', row.id);

      if (updateErr) {
        console.error(`Failed to update ${row.address}:`, updateErr.message);
      } else {
        console.log(`SUCCESS! Updated encrypted credentials for ${row.address}`);
      }
    } else {
      console.warn(`Wallet ${row.address} has no plaintext private_key or seed_phrase to encrypt.`);
    }
  }
}

fixWallets();
