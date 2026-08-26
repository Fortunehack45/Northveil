import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', 'mcp-server', '.env') });

import { stageTransactionRequest, initSupabase } from '../mcp-server/mpcControlPlaneService.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : ({} as any);

initSupabase(supabase);

async function testBigIntStaging() {
  console.log('Testing stageTransactionRequest with ethers.parseEther (BigInt)...');
  try {
    const res = await stageTransactionRequest(
      '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
      '0x59148d6a9dff263a772b5a84280bc88530f38636',
      0.0005,
      'ETH',
      'sepolia',
      { to: '0x59148d6a9dff263a772b5a84280bc88530f38636', value: ethers.parseEther('0.0005'), chainId: 11155111 },
      'default_user',
      'Test BigInt staging'
    );
    console.log('Result:', res);
  } catch (e: any) {
    console.error('Caught error in BigInt staging:', e);
  }
}

testBigIntStaging();
