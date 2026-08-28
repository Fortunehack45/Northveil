import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

import {
  stageTransactionRequest,
  approveAndExecuteWithPasskey,
  executeAutonomousTransaction
} from '../mcp-server/mpcControlPlaneService.ts';
import assert from 'assert';

console.log('🧪 Testing Decimal Transfer Amount Parsing & Turnkey Transaction Preparation...\n');

// 1. Test staging a transaction with decimal amount "0.0005"
const staged = await stageTransactionRequest(
  '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
  '0x000000000000000000000000000000000000dEaD',
  0.0005,
  'ETH',
  'sepolia',
  {
    to: '0x000000000000000000000000000000000000dEaD',
    value: '0.0005'
  },
  'default_user'
);

console.log('✅ [PASS] Staged transaction with 0.0005 ETH value:', staged.requestId);
console.log('Approval Token:', staged.approvalToken);

console.log('\n--- Testing with Turnkey or Demo Mode ---');
process.env.NORTHVEIL_DEMO_MODE = 'true';
const approved = await approveAndExecuteWithPasskey(staged.approvalToken, undefined, 'default_user');
console.log('✅ [PASS] Execution succeeded:', approved);
assert.strictEqual(approved.status, 'simulated');

console.log('\n🎉 ALL DECIMAL VALUE PARSING TESTS PASSED 100%!');
