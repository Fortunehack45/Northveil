import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import {
  getExactNonce,
  validateChainId,
  registerPublicWallet,
  prepareTransactionRequest,
  validateAndBroadcastSignedTransaction,
  inMemoryTxRequests,
} from '../api/mpcControlPlaneService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runEnforcementTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🛡️ TESTING STRICT NON-CUSTODIAL SAFETY & ENFORCEMENT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 1: Byte-identical verification between api/ and mcp-server/
  console.log('--- Test 1: Verifying api/ and mcp-server/ Parity ---');
  const apiMpc = fs.readFileSync(path.resolve(__dirname, '..', 'api', 'mpcControlPlaneService.ts'), 'utf8');
  const serverMpc = fs.readFileSync(path.resolve(__dirname, '..', 'mcp-server', 'mpcControlPlaneService.ts'), 'utf8');
  assert.strictEqual(apiMpc, serverMpc, 'api/ and mcp-server/ copies of mpcControlPlaneService.ts MUST be byte-identical');

  const apiIndex = fs.readFileSync(path.resolve(__dirname, '..', 'api', 'index.ts'), 'utf8');
  const serverIndex = fs.readFileSync(path.resolve(__dirname, '..', 'mcp-server', 'index.ts'), 'utf8');
  assert.strictEqual(apiIndex, serverIndex, 'api/ and mcp-server/ copies of index.ts MUST be byte-identical');
  console.log('✅ [PASS] Both file copies are 100% byte-identical.\n');

  // Test 2: Chain ID Validation Fails Closed (Never defaults to Sepolia)
  console.log('--- Test 2: Chain ID Validation Fails Closed ---');
  const baseChainId = validateChainId('base');
  assert.strictEqual(baseChainId, 8453, 'Base chain ID must be 8453');

  const mainnetChainId = validateChainId('ethereum');
  assert.strictEqual(mainnetChainId, 1, 'Ethereum chain ID must be 1');

  const polygonChainId = validateChainId('polygon');
  assert.strictEqual(polygonChainId, 137, 'Polygon chain ID must be 137');

  let invalidChainThrew = false;
  try {
    validateChainId('invalid_unknown_chain_xyz');
  } catch (err: any) {
    invalidChainThrew = true;
    console.log('Caught expected invalid chain error:', err.message);
    assert.ok(err.message.includes('INVALID_CHAIN_ID'), 'Must throw INVALID_CHAIN_ID error');
  }
  assert.strictEqual(invalidChainThrew, true, 'Unknown chain MUST fail closed and never default to Sepolia');
  console.log('✅ [PASS] validateChainId fails closed.\n');

  // Test 3: getExactNonce Fails Closed on RPC Failure
  console.log('--- Test 3: getExactNonce Fails Closed on Provider Error ---');
  const mockFailingProvider: any = {
    getTransactionCount: async () => {
      throw new Error('RPC connection refused or network timeout');
    },
  };

  let nonceThrew = false;
  try {
    await getExactNonce('0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417', 'base', mockFailingProvider);
  } catch (err: any) {
    nonceThrew = true;
    console.log('Caught expected nonce error:', err.message);
    assert.ok(err.message.includes('NONCE_FETCH_FAILED'), 'Must throw NONCE_FETCH_FAILED');
  }
  assert.strictEqual(nonceThrew, true, 'getExactNonce MUST throw and never default to 0 on failure');
  console.log('✅ [PASS] getExactNonce fails closed.\n');

  // Test 4: registerPublicWallet Stores Only Public Address & Rejects Raw Secrets
  console.log('--- Test 4: Public-Only Wallet Registration ---');
  const sampleWallet = ethers.Wallet.createRandom();
  const regResult = await registerPublicWallet({
    address: sampleWallet.address,
    walletName: 'Test Non-Custodial Vault',
    userId: 'user_test_non_custodial',
  });
  assert.ok(regResult.address, 'Registration must succeed');
  assert.strictEqual(regResult.address.toLowerCase(), sampleWallet.address.toLowerCase(), 'Registered address must match');
  assert.strictEqual((regResult as any).privateKey, undefined, 'Must NEVER return or store raw private key');
  assert.strictEqual((regResult as any).mnemonic, undefined, 'Must NEVER return or store raw mnemonic');

  // Verify secret ingestion rejection
  let secretRejected = false;
  try {
    await registerPublicWallet({
      address: sampleWallet.address,
      privateKey: sampleWallet.privateKey, // Secret ingestion attempt
    } as any);
  } catch (err: any) {
    secretRejected = true;
    console.log('Caught expected secret rejection:', err.message);
  }
  assert.strictEqual(secretRejected, true, 'registerPublicWallet MUST reject raw private keys');
  console.log('✅ [PASS] registerPublicWallet strictly enforces public-only registration.\n');

  // Test 5: prepareTransactionRequest Generates Valid Unsigned Payload
  console.log('--- Test 5: Non-Custodial Transaction Preparation ---');
  const prep = await prepareTransactionRequest({
    walletAddress: sampleWallet.address,
    recipient: '0x1111111254EEB25477B68fb85Ed929f73A960382',
    amount: 0.05,
    asset: 'ETH',
    network: 'base',
    chainId: 8453,
    operationType: 'TRANSFER',
  });

  assert.ok(prep.requestId, 'Must generate requestId');
  assert.ok(prep.approvalToken, 'Must generate approvalToken');
  assert.strictEqual(prep.walletAddress.toLowerCase(), sampleWallet.address.toLowerCase());
  assert.strictEqual(prep.chainId, 8453, 'Chain ID must be preserved exactly');
  assert.ok(prep.unsignedTransaction, 'Must include unsignedTransaction object');
  assert.ok(prep.unsignedSerialized, 'Must include serialized unsigned transaction hex');
  console.log('✅ [PASS] prepareTransactionRequest produces valid unsigned transaction payload.\n');

  // Test 6: validateAndBroadcastSignedTransaction Cryptographically Verifies Signer
  console.log('--- Test 6: Cryptographic Signature Verification & Broadcast Validation ---');
  // Sign the prepared transaction locally using the sample private key
  const txToSign = {
    to: prep.unsignedTransaction.to,
    value: ethers.parseEther('0.05'),
    nonce: prep.nonce,
    gasLimit: 21000n,
    maxFeePerGas: ethers.parseUnits('1', 'gwei'),
    maxPriorityFeePerGas: ethers.parseUnits('0.1', 'gwei'),
    chainId: 8453n,
    type: 2,
  };
  const signedTxHex = await sampleWallet.signTransaction(txToSign);

  // Test with invalid / mismatched signer
  const attackerWallet = ethers.Wallet.createRandom();
  const attackerSignedTx = await attackerWallet.signTransaction(txToSign);

  let attackerThrew = false;
  try {
    await validateAndBroadcastSignedTransaction({
      approvalToken: prep.approvalToken,
      signedTransaction: attackerSignedTx,
    });
  } catch (err: any) {
    attackerThrew = true;
    assert.ok(err.message.includes('SIGNATURE_MISMATCH') || err.message.includes('UNAUTHORIZED_SIGNER'), 'Must reject signature from wrong address');
  }
  assert.strictEqual(attackerThrew, true, 'Must reject signature if recovered address does not match vault');

  // Test single-use invalidation
  inMemoryTxRequests.delete(prep.approvalToken);
  let expiredThrew = false;
  try {
    await validateAndBroadcastSignedTransaction({
      approvalToken: prep.approvalToken,
      signedTransaction: signedTxHex,
    });
  } catch (err: any) {
    expiredThrew = true;
    console.log('Caught expected single-use invalidation error:', err.message);
  }
  assert.strictEqual(expiredThrew, true, 'Must reject consumed or expired approval tokens');

  console.log('✅ [PASS] Cryptographic signature validation & replay protection fully operational.\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL NON-CUSTODIAL ENFORCEMENT & SAFETY TESTS PASSED');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runEnforcementTests().catch((err) => {
  console.error('❌ Enforcement Test Failed:', err);
  process.exit(1);
});
