process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runEnforcementTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🛡️ TESTING STRICT NON-CUSTODIAL TURNKEY ENFORCEMENT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 1: Byte-identical verification between api/ and mcp-server/
  console.log('--- Test 1: Verifying api/ and mcp-server/ mpcControlPlaneService.ts Parity ---');
  const apiFile = fs.readFileSync(path.resolve(__dirname, '..', 'api', 'mpcControlPlaneService.ts'), 'utf8');
  const mcpFile = fs.readFileSync(path.resolve(__dirname, '..', 'mcp-server', 'mpcControlPlaneService.ts'), 'utf8');
  assert.strictEqual(apiFile, mcpFile, 'api/ and mcp-server/ copies of mpcControlPlaneService.ts MUST be byte-identical');
  console.log('✅ [PASS] Both file copies are 100% byte-identical.\n');

  // Import services dynamically
  const {
    createMpcWallet,
    approveAndExecuteWithPasskey,
    executeAutonomousTransaction,
    TurnkeyEnclaveError,
  } = await import('../mcp-server/mpcControlPlaneService.js');

  // Ensure Turnkey env vars and demo mode are unset for tests
  delete process.env.TURNKEY_API_PUBLIC_KEY;
  delete process.env.TURNKEY_API_PRIVATE_KEY;
  delete process.env.TURNKEY_ORGANIZATION_ID;
  delete process.env.NORTHVEIL_DEMO_MODE;

  // Test 2: createMpcWallet throws TurnkeyEnclaveError when Turnkey unset & demo mode off
  console.log('--- Test 2: createMpcWallet Fails Loudly When Unconfigured ---');
  let walletThrew = false;
  try {
    await createMpcWallet('test_user_strict', 'Strict Vault');
  } catch (err: any) {
    walletThrew = true;
    console.log('Caught expected error:', err.message);
    assert.ok(err instanceof TurnkeyEnclaveError || err.name === 'TurnkeyEnclaveError', 'Must throw TurnkeyEnclaveError');
    assert.ok(err.message.includes('TurnkeyEnclaveError'), 'Message must contain TurnkeyEnclaveError');
  }
  assert.strictEqual(walletThrew, true, 'createMpcWallet MUST throw TurnkeyEnclaveError when unconfigured');
  console.log('✅ [PASS] createMpcWallet refused server-side key generation.\n');

  // Test 3: createMpcWallet refuses any server-side key generation
  console.log('--- Test 3: createMpcWallet Rejects Any Server-Side Key Generation ---');
  let exportThrew = false;
  try {
    await createMpcWallet('test_user_export', 'Export Vault', 'self_custody_export');
  } catch (err: any) {
    exportThrew = true;
    assert.ok(err instanceof TurnkeyEnclaveError || err.name === 'TurnkeyEnclaveError', 'Must throw TurnkeyEnclaveError');
  }
  assert.strictEqual(exportThrew, true, 'Server-side key generation must be refused under all provisioning modes without Turnkey/Demo');
  console.log('✅ [PASS] createMpcWallet refuses server-side generation across all non-Turnkey invocations.\n');

  // Test 4: executeAutonomousTransaction throws TurnkeyEnclaveError when Turnkey unset & demo mode off
  console.log('--- Test 4: executeAutonomousTransaction Fails Loudly When Unconfigured ---');
  let autoThrew = false;
  try {
    await executeAutonomousTransaction(
      '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
      '0x000000000000000000000000000000000000dEaD',
      0.01,
      'ETH',
      'sepolia',
      { to: '0x000000000000000000000000000000000000dEaD', value: 1000 },
      'scope_test_123',
      'test_user'
    );
  } catch (err: any) {
    autoThrew = true;
    console.log('Caught expected error:', err.message);
    assert.ok(err instanceof TurnkeyEnclaveError || err.name === 'TurnkeyEnclaveError', 'Must throw TurnkeyEnclaveError');
  }
  assert.strictEqual(autoThrew, true, 'executeAutonomousTransaction MUST throw TurnkeyEnclaveError');
  console.log('✅ [PASS] executeAutonomousTransaction refused fallback signing.\n');

  // Test 5: approveAndExecuteWithPasskey throws on non-existent token or unconfigured Turnkey
  console.log('--- Test 5: approveAndExecuteWithPasskey Fails Loudly on Missing Request ---');
  let approveThrew = false;
  try {
    await approveAndExecuteWithPasskey('non_existent_approval_token_xyz');
  } catch (err: any) {
    approveThrew = true;
    console.log('Caught expected error:', err.message);
    assert.ok(err.message.includes('STAGING_REQUEST_NOT_FOUND'), 'Must reject unknown approval tokens');
  }
  assert.strictEqual(approveThrew, true, 'approveAndExecuteWithPasskey MUST throw error for non-existent token');
  console.log('✅ [PASS] approveAndExecuteWithPasskey does not fabricate success.\n');

  // Test 6: Demo Mode Isolation
  console.log('--- Test 6: Demo Mode Isolation (NORTHVEIL_DEMO_MODE=true) ---');
  process.env.NORTHVEIL_DEMO_MODE = 'true';

  const demoWallet = await createMpcWallet('demo_user_test', 'Demo Testing Vault');
  console.log('Demo Wallet Result:', demoWallet);
  assert.strictEqual(demoWallet.status, 'demo_unspendable');
  assert.strictEqual(demoWallet.mpcProvider, 'turnkey-demo');
  assert.strictEqual(demoWallet.privateKey, undefined);
  assert.strictEqual(demoWallet.mnemonic, undefined);

  const demoAutoRes = await executeAutonomousTransaction(
    demoWallet.address,
    '0x000000000000000000000000000000000000dEaD',
    0.01,
    'ETH',
    'sepolia',
    {},
    'scope_demo_123',
    'demo_user_test'
  );
  console.log('Demo Autonomous Result:', demoAutoRes);
  assert.strictEqual(demoAutoRes.status, 'simulated');
  assert.strictEqual(demoAutoRes.simulated, true);
  assert.strictEqual(demoAutoRes.txHash, null);
  console.log('✅ [PASS] Demo mode produces unspendable wallets and simulated non-broadcast signing.\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL NON-CUSTODIAL ENFORCEMENT TESTS PASSED!');
  console.log('═══════════════════════════════════════════════════════════════');
}

runEnforcementTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
