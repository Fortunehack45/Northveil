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

async function testSyncWallet(address, name) {
  console.log('Testing non-custodial metadata syncWallet for address:', address);
  const cleanAddr = address.toLowerCase();

  const record = {
    address: cleanAddr,
    name: name,
    chain_id: 'ethereum',
    user_id: 'default_user',
    wallet_status: 'active',
    derivation_path: "m/44'/60'/0'/0/0",
  };

  console.log('Record to upsert (non-custodial metadata only):', record);

  const { data, error } = await supabase
    .from('wallets')
    .upsert([record], { onConflict: 'address' })
    .select();

  if (error) {
    console.error('Upsert ERROR:', error);
  } else {
    console.log('Upsert SUCCESS! Returned data:', data);
  }
}

testSyncWallet('0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417', 'My Northveil Vault');
