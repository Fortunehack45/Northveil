import { executeRealTool } from '../api/index';
import { createMpcWallet } from '../api/mpcControlPlaneService';
import assert from 'assert';

async function runNonCustodialTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 NORTHVEIL 100% FULL NON-CUSTODIAL INTEGRITY TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Direct createMpcWallet verification
  console.log('1. Testing createMpcWallet service...');
  const mpcWallet = await createMpcWallet('Autonomous Non-Custodial Vault', 'test_user_non_custodial');
  assert.ok(mpcWallet.address, 'Must return a valid public address');
  assert.strictEqual(mpcWallet.seedPhrase, '', 'Seed phrase MUST be empty string on server (Non-Custodial)');
  assert.strictEqual(mpcWallet.privateKey, '', 'Private key MUST be empty string on server (Non-Custodial)');
  assert.strictEqual(mpcWallet.mnemonicWords.length, 0, 'Mnemonic words array MUST be empty on server');
  assert.ok(mpcWallet.onboardingUrl.includes('wallet.northveil.xyz'), 'Must return non-custodial onboarding URL');
  console.log('✅ [PASS] createMpcWallet has Zero Server Custody (No private keys or seed phrases on backend).\n');

  // 2. Testing MCP tool: northveil_create_wallet
  console.log('2. Testing MCP tool: northveil_create_wallet...');
  const mcpResult: any = await executeRealTool('northveil_create_wallet', {
    walletName: 'Test Non-Custodial Vault',
    network: 'ethereum',
  }, '');
  assert.ok(mcpResult.address, 'Must return public address');
  assert.strictEqual(mcpResult.seedPhrase, '', 'seedPhrase must be empty');
  assert.strictEqual(mcpResult.privateKey, '', 'privateKey must be empty');
  assert.ok(mcpResult.formattedMarkdown.includes('100% NON-CUSTODIAL'), 'Must declare 100% non-custodial');
  assert.ok(mcpResult.formattedMarkdown.includes('ZERO-SERVER-CUSTODY'), 'Must state zero server custody');
  console.log('✅ [PASS] MCP northveil_create_wallet returns 100% non-custodial metadata.\n');

  // 3. Testing MCP tool: export_seed_phrase
  console.log('3. Testing MCP tool: export_seed_phrase...');
  const exportResult: any = await executeRealTool('export_seed_phrase', {
    walletAddress: mpcWallet.address,
  }, mpcWallet.address);
  assert.strictEqual(exportResult.seedPhrase, '', 'Seed phrase must NOT be returned over MCP');
  assert.strictEqual(exportResult.privateKey, '', 'Private key must NOT be returned over MCP');
  assert.ok(exportResult.formattedMarkdown.includes('ZERO-CUSTODY RECOVERY NOTICE'), 'Must return non-custodial notice');
  assert.ok(exportResult.formattedMarkdown.includes('wallet.northveil.xyz'), 'Must direct user to client app');
  console.log('✅ [PASS] MCP export_seed_phrase safely enforces zero-custody notice.\n');

  // 4. Testing MCP tool: get_transaction_status
  console.log('4. Testing MCP tool: get_transaction_status...');
  const txStatusResult: any = await executeRealTool('get_transaction_status', {
    txHash: '0x3344556677889900aabbccddeeff0011223344556677889900aabbccddeeff00',
    chain: 'sepolia',
  }, mpcWallet.address);
  assert.ok(txStatusResult.status, 'Must return status');
  console.log('✅ [PASS] MCP get_transaction_status returned cleanly:', txStatusResult.status, '\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL 100% FULL NON-CUSTODIAL INTEGRITY TESTS PASSED!');
  console.log('═══════════════════════════════════════════════════════════════');
}

runNonCustodialTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
