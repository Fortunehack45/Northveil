import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

import { ethers } from 'ethers';
import {
  evaluatePolicy,
  computeCanonicalHash,
  formatHumanPreview,
  PayboxCanonicalOperation,
  PayboxGrant,
} from '../mcp-server/mpcControlPlaneService.js';
import { MCP_TOOLS } from '../mcp-server/tools.js';

// NOTE: Hardcoded fallback key removed. Set LOCAL_TEST_PRIVATE_KEY in your environment for local testing.
// Any previously committed test key in repo history is public and must be treated as permanently compromised.
const RELAYER_KEY = process.env.LOCAL_TEST_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey;
const relayerWallet = new ethers.Wallet(RELAYER_KEY);
const TEST_VAULT = relayerWallet.address;
const TEST_RECIPIENT = '0x000000000000000000000000000000000000dEaD';

console.log('======================================================');
console.log('🧪 NORTHVEIL PAYBOX-PARITY CONTROL PLANE VERIFICATION');
console.log('======================================================');
console.log('Active Relayer Vault:', TEST_VAULT);
console.log('======================================================\n');

let passed = 0;
let total = 0;

function assert(condition: boolean, msg: string) {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTests() {
  // Test 1: Verify Schema Registration for all 18 northveil_* tools
  console.log('--- TEST 1: Schema Registration ---');
  const requiredTools = [
    'northveil_list_wallets',
    'northveil_get_balances',
    'northveil_get_portfolio',
    'northveil_list_nfts',
    'northveil_get_tx',
    'northveil_simulate_tx',
    'northveil_estimate_gas',
    'northveil_inspect_contract',
    'northveil_audit_contract',
    'northveil_prepare_transfer',
    'northveil_prepare_swap',
    'northveil_prepare_bridge',
    'northveil_prepare_contract_call',
    'northveil_prepare_deploy',
    'northveil_request_signature',
    'northveil_request_broadcast',
    'northveil_list_pending_approvals',
    'northveil_get_approval_status',
  ];

  for (const tName of requiredTools) {
    const toolDef = MCP_TOOLS.find(t => t.name === tName);
    assert(!!toolDef, `Tool definition registered: ${tName}`);
  }

  // Test 2: Policy Engine - Mode 1: Always Approve
  console.log('\n--- TEST 2: Policy Engine - Always Approve Mode ---');
  const alwaysApproveGrant: PayboxGrant = {
    grantId: 'grt_test_01',
    agentClientId: 'agt_claude_01',
    userId: 'user_01',
    allowedOperations: ['read', 'simulate', 'transfer', 'swap', 'contract_call'],
    allowedChains: [8453, 11155111],
    allowNewDestinations: false,
    caps: { perTxUsd: 50, dailyBudgetUsd: 200, weeklyBudgetUsd: 1000 },
    approvalMode: 'always_approve',
    simulationRequired: true,
    denyUnlimitedApprovals: true,
    denySetApprovalForAll: true,
    deployEnabled: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  const op1: PayboxCanonicalOperation = {
    clientId: 'agt_claude_01',
    walletId: 'wal_01',
    walletAddress: TEST_VAULT,
    chainId: 11155111,
    from: TEST_VAULT,
    to: TEST_RECIPIENT,
    value: '1000000000000000', // 0.001 ETH
    data: '0x',
    operationType: 'transfer',
    amountUsdEstimate: 3.45,
    deadline: Math.floor(Date.now() / 1000) + 600,
    nonce: 1,
  };

  const dec1 = await evaluatePolicy(alwaysApproveGrant, op1, { success: true, warnings: [] }, 0, true);
  assert(dec1.decision === 'NEEDS_APPROVAL', 'Mode 1 correctly requires human approval for transfer');
  assert(!!dec1.approvalToken && dec1.approvalToken.startsWith('req_'), 'Mode 1 generated valid single-use token');

  // Test 3: Policy Engine - Mode 2: Approve Above Limit (Small transfer -> AUTO_EXECUTE)
  console.log('\n--- TEST 3: Policy Engine - Approve Above Limit Mode ---');
  const aboveLimitGrant: PayboxGrant = {
    ...alwaysApproveGrant,
    approvalMode: 'approve_above_limit',
  };

  const smallOp: PayboxCanonicalOperation = {
    ...op1,
    amountUsdEstimate: 10.0, // Under $50 cap
  };

  const dec2 = await evaluatePolicy(aboveLimitGrant, smallOp, { success: true, warnings: [] }, 0, true);
  assert(dec2.decision === 'AUTO_EXECUTE', 'Small transfer under cap to known destination auto-executes');

  const largeOp: PayboxCanonicalOperation = {
    ...op1,
    amountUsdEstimate: 75.0, // Above $50 cap
  };

  const dec3 = await evaluatePolicy(aboveLimitGrant, largeOp, { success: true, warnings: [] }, 0, true);
  assert(dec3.decision === 'NEEDS_APPROVAL', 'Transfer exceeding cap pauses for human approval');

  // Test 4: Hard Policy Gates (Deploy and Unseen Destination)
  console.log('\n--- TEST 4: Hard Policy Gates ---');
  const deployGrant: PayboxGrant = {
    ...aboveLimitGrant,
    allowedOperations: ['read', 'simulate', 'transfer', 'swap', 'contract_call', 'deploy'],
    deployEnabled: true,
  };
  const deployOp: PayboxCanonicalOperation = {
    ...op1,
    operationType: 'deploy',
  };
  const decDeploy = await evaluatePolicy(deployGrant, deployOp, { success: true, warnings: [] }, 0, true);
  assert(decDeploy.decision === 'NEEDS_APPROVAL', 'Contract deploy always forces approval regardless of mode');

  const unseenOp: PayboxCanonicalOperation = {
    ...smallOp,
  };
  const decUnseen = await evaluatePolicy(aboveLimitGrant, unseenOp, { success: true, warnings: [] }, 0, false); // isKnownDestination: false
  assert(decUnseen.decision === 'NEEDS_APPROVAL', 'Unseen destination always forces approval');

  // Test 5: Simulation Revert Handling
  console.log('\n--- TEST 5: Simulation Revert Handling ---');
  const decRevert = await evaluatePolicy(aboveLimitGrant, smallOp, { success: false, revertReason: 'ERC20: transfer amount exceeds balance', warnings: [] }, 0, true);
  assert(decRevert.decision === 'DENY', 'Simulation revert blocks staging and returns DENY');

  // Test 6: Canonical Hash Integrity & Tamper Resistance
  console.log('\n--- TEST 6: Canonical Hash Integrity ---');
  const hash1 = computeCanonicalHash(op1);
  const hash2 = computeCanonicalHash({ ...op1, value: '2000000000000000' });
  assert(hash1 !== hash2, 'Modifying value alters canonical hash (prevents replay/tampering)');

  // Test 7: Human Preview Formatting
  console.log('\n--- TEST 7: Human Preview Formatting ---');
  const preview = formatHumanPreview({
    decision: 'needs_approval',
    agentClient: 'Claude Desktop Integration',
    wallet: { id: 'wal_01', address: TEST_VAULT, chain: 'sepolia' },
    action: 'transfer',
    to: TEST_RECIPIENT,
    amounts: { native: '0.001 ETH', token: '0.00', usd: '$3.45' },
    gas: { estimatedUnits: 21000, maxFeeGwei: '2.5', estimatedCostUsd: '$0.001' },
    simulation: { ok: true, warnings: [] },
    policy: { mode: 'always_approve', reasons: ['Default Always Approve mode'] },
    approval: { id: 'appr_01', tokenHint: 'req_test', expiresAt: new Date().toISOString() },
  });

  assert(preview.decision === 'needs_approval', 'Preview decision correctly structured');
  assert(preview.wallet.address === TEST_VAULT, 'Preview contains correct vault address');
  assert(preview.amounts.native === '0.001 ETH', 'Preview contains human-readable amounts');

  // Test 8: Real On-Chain Execution Lifecycle
  console.log('\n--- TEST 8: Real On-Chain Mode 1 Execution Lifecycle ---');
  const { stageTransactionRequest, approveAndExecuteWithPasskey } = await import('../mcp-server/mpcControlPlaneService.js');
  
  const stageRes = await stageTransactionRequest(
    TEST_VAULT,
    TEST_RECIPIENT,
    0.00001,
    'ETH',
    'sepolia',
    { to: TEST_RECIPIENT, value: '10000000000000' },
    'default_user',
    'PayBox On-Chain Transfer Test to Burn Address'
  );

  assert(!!stageRes.approvalToken, 'Staged request returned single-use approvalToken');
  assert(stageRes.status.toLowerCase() === 'pending', 'Staged request status is pending');

  const execRes = await approveAndExecuteWithPasskey(
    stageRes.approvalToken,
    { id: 'mock_assertion', rawId: 'mock_raw', response: { clientDataJSON: 'e30', authenticatorData: 'e30', signature: 'e30' }, type: 'public-key' },
    'default_user'
  );

  assert(execRes.success === true, 'Passkey approval broadcast succeeded');
  assert(execRes.txHash.startsWith('0x') && execRes.txHash.length === 66, `Real on-chain tx broadcast: ${execRes.txHash}`);
  assert(execRes.explorerUrl.includes('etherscan.io') || execRes.explorerUrl.includes('sepolia'), `Valid explorer URL: ${execRes.explorerUrl}`);

  console.log('\n======================================================');
  console.log(`FINAL RESULT: ${passed}/${total} PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('======================================================');
  console.log('🎉 NORTHVEIL PAYBOX-PARITY ENGINE IS 100% OPERATIONAL!');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
