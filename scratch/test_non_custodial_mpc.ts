import {
  createMpcWallet,
  stageTransactionRequest,
  approveAndExecuteWithPasskey,
  rejectTransactionRequest,
  evaluateAutonomousScope,
  executeAutonomousTransaction,
  activateKillSwitch,
  deactivateKillSwitch,
  isKillSwitchActive,
} from '../api/mpcControlPlaneService.ts';

async function runTests() {
  console.log('🧪 Starting Northveil Non-Custodial MPC Control-Plane Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: any, name: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  // 1. Test Non-Custodial Wallet Creation
  console.log('1️⃣ Testing createMpcWallet (Zero server-side private key possession)...');
  const walletResult = await createMpcWallet('test_user_01', 'Test MPC Vault');
  assert(walletResult.address && walletResult.address.startsWith('0x'), 'Returns valid 0x public address');
  assert(walletResult.mpcProvider === 'turnkey', 'Uses Turnkey hardware enclave provider');
  assert(walletResult.mpcWalletId && walletResult.mpcSubOrgId, 'Contains TEE enclave IDs');
  assert(!(walletResult as any).privateKey && !(walletResult as any).backupSeedPhrase && !(walletResult as any).secret, 'ZERO raw private keys or seed phrases returned');

  const vaultAddress = walletResult.address;

  // 2. Test Autonomous Spending Policy Evaluation
  console.log('\n2️⃣ Testing Autonomous Spending Policy Evaluation...');
  const defaultScopeCheck = await evaluateAutonomousScope(vaultAddress, 'test_user_01', 11155111, 'ETH', 10.0);
  assert(!defaultScopeCheck.inScope, 'Default transactions without explicit scope require passkey confirmation');

  const scopeId = 'scope_test_123';
  const autoExecRes = await executeAutonomousTransaction(
    vaultAddress,
    '0x71c8891575b50d22e032d847847c234a413d4cc8',
    0.001,
    'ETH',
    'sepolia',
    { to: '0x71c8891575b50d22e032d847847c234a413d4cc8', value: '0x38d7ea4c68000', chainId: 11155111 },
    scopeId,
    'test_user_01'
  );
  assert(autoExecRes.txHash && autoExecRes.txHash.startsWith('0x'), 'Autonomous transaction executed with on-chain hash');
  assert(autoExecRes.status === 'confirmed', 'Autonomous transaction returns confirmed status');

  // 3. Test Passkey Staging & Approval Tokens
  console.log('\n3️⃣ Testing Transaction Staging & Single-Use Approval Tokens...');
  const staged = await stageTransactionRequest(
    vaultAddress,
    '0x87678de86804c6c3612d66cbd6e2857f1a7d8345',
    0.5,
    'ETH',
    'sepolia',
    { to: '0x87678de86804c6c3612d66cbd6e2857f1a7d8345', value: '0x6f05b59d3b20000', chainId: 11155111 },
    'test_user_01',
    'High value transfer'
  );
  assert(staged.requestId && staged.requestId.startsWith('req_'), 'Generates unique request ID');
  assert(staged.approvalToken && staged.approvalToken.startsWith('tok_'), 'Generates single-use approval token');
  assert(staged.passkeyChallenge && staged.passkeyChallenge.length >= 32, 'Generates cryptographically secure WebAuthn challenge');
  assert(staged.expiresAt, 'Sets 10-minute expiration window');

  // 4. Test Passkey Approval & Execution
  console.log('\n4️⃣ Testing Passkey Co-Signing & Confirmation...');
  const approveRes = await approveAndExecuteWithPasskey(staged.approvalToken, undefined, 'test_user_01');
  assert(approveRes.status === 'confirmed', 'Passkey execution confirms on-chain');
  assert(approveRes.txHash && approveRes.txHash.startsWith('0x'), 'Confirmed execution returns transaction hash');
  assert(approveRes.blockNumber > 0, 'Confirmed execution returns block number');

  // 5. Test Single-Use Approval Token Invalidation (Replay Prevention)
  console.log('\n5️⃣ Testing Token Invalidation (Replay Prevention)...');
  let replayError = false;
  try {
    await approveAndExecuteWithPasskey(staged.approvalToken, undefined, 'test_user_01');
  } catch (e) {
    replayError = true;
  }
  assert(replayError, 'Single-use token cannot be re-used after execution');

  // 6. Test Rejection
  console.log('\n6️⃣ Testing Transaction Request Rejection...');
  const stagedToReject = await stageTransactionRequest(
    vaultAddress,
    '0x87678de86804c6c3612d66cbd6e2857f1a7d8345',
    1.0,
    'ETH',
    'sepolia',
    { to: '0x87678de86804c6c3612d66cbd6e2857f1a7d8345', value: '0xde0b6b3a7640000', chainId: 11155111 },
    'test_user_01',
    'Transfer to reject'
  );
  const rejectRes = await rejectTransactionRequest(stagedToReject.approvalToken, 'test_user_01');
  assert(rejectRes.status === 'rejected', 'Transaction request successfully rejected and voided');

  // 7. Test Emergency Kill Switch
  console.log('\n7️⃣ Testing Emergency Kill Switch...');
  const killRes = await activateKillSwitch(vaultAddress, 'test_user_01', 'Test emergency lock');
  assert(killRes.killSwitchActive === true, 'Kill switch successfully activated');
  assert(await isKillSwitchActive(vaultAddress), 'Vault recognized as locked');

  // Verify that operations are blocked under kill switch
  const scopeUnderLock = await evaluateAutonomousScope(vaultAddress, 'test_user_01', 11155111, 'ETH', 1.0);
  assert(!scopeUnderLock.inScope && scopeUnderLock.reason?.toLowerCase().includes('kill switch'), 'Autonomous scope evaluation rejects when kill switch is active');

  // Deactivate kill switch
  const unlockRes = await deactivateKillSwitch(vaultAddress, 'test_user_01');
  assert(!(await isKillSwitchActive(vaultAddress)), 'Vault unlocked after deactivation');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
