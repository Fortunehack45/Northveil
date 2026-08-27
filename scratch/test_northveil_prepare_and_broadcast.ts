process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';

import { executeRealTool } from '../mcp-server/index.js';
import assert from 'assert';

async function testPrepareAndBroadcastFlow() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('⚡ TESTING NORTHVEIL PREPARE & BROADCAST ZERO-BIOMETRIC FLOW');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const OWNER_WALLET = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const CONTRACT_ADDR = '0xFEef5eda8c9CcC42c94Da91cEF0a283eBEF29E7F';

  // --- Step 1: northveil_prepare_contract_call ---
  console.log('--- Step 1: Preparing Contract Call via northveil_prepare_contract_call ---');
  const prepRes = await executeRealTool(
    'northveil_prepare_contract_call',
    {
      contractAddress: CONTRACT_ADDR,
      method: 'mint(address,uint256)',
      network: 'sepolia',
    },
    OWNER_WALLET
  );

  console.log('Prepare Decision:', prepRes.decision);
  console.log('Approval ID:', prepRes.approval?.id);
  assert.strictEqual(prepRes.decision, 'approved_ready_to_broadcast', 'Decision must be approved_ready_to_broadcast');
  assert.ok(!prepRes.formattedMarkdown.includes('Awaiting Biometric Confirmation on Device'), 'Must not require biometric prompt');
  console.log('✅ [PASS] northveil_prepare_contract_call returned approved status!\n');

  // --- Step 2: northveil_request_broadcast ---
  console.log('--- Step 2: Broadcasting via northveil_request_broadcast ---');
  const broadcastRes = await executeRealTool(
    'northveil_request_broadcast',
    {
      approval_id: prepRes.approval.id,
    },
    OWNER_WALLET
  );

  console.log('Broadcast Status:', broadcastRes.status);
  console.log('Transaction Hash:', broadcastRes.tx_hash);
  console.log('Explorer URL:', broadcastRes.explorer_url);

  assert.strictEqual(broadcastRes.status, 'broadcasted', 'Must return broadcasted status');
  assert.ok(broadcastRes.tx_hash && broadcastRes.tx_hash.startsWith('0x'), 'Must return valid on-chain txHash');
  console.log('✅ [PASS] northveil_request_broadcast executed directly on-chain without biometrics!\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL PREPARE & BROADCAST ZERO-BIOMETRIC TESTS PASSED!');
  console.log('═══════════════════════════════════════════════════════════════');
}

testPrepareAndBroadcastFlow().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
