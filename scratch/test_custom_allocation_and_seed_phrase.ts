process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';
process.on('unhandledRejection', (reason) => {
  console.warn('[Global Unhandled Rejection Caught]:', (reason as any)?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.warn('[Global Uncaught Exception Caught]:', err?.message || err);
});

import { executeRealTool } from '../mcp-server/index.js';
import { ethers } from 'ethers';
import assert from 'assert';

async function testAllocationAndSeedPhrase() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 TESTING DYNAMIC PERCENTAGE ALLOCATIONS & SEED PHRASE RECOVERY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // --- 1. Test create_wallet seed phrase recovery ---
  console.log('--- 1. Testing create_wallet & 12-word Seed Phrase Recovery ---');
  const walletRes = await executeRealTool('create_wallet', {
    walletName: 'Test Recovery Vault',
  }, '');

  console.log('Created Wallet Address:', walletRes.address);
  console.log('Recovery Seed Phrase:', walletRes.mnemonic || walletRes.seedPhrase);
  console.log('Private Key:', walletRes.privateKey);
  console.log('Derivation Path:', walletRes.derivationPath);

  assert.ok(walletRes.address && walletRes.address.startsWith('0x'), 'Address should be valid 0x');
  assert.ok(walletRes.mnemonic || walletRes.seedPhrase, 'Mnemonic seed phrase must be present');
  const seedPhrase = walletRes.mnemonic || walletRes.seedPhrase;
  const wordCount = seedPhrase.trim().split(/\s+/).length;
  assert.strictEqual(wordCount, 12, 'Seed phrase must contain exactly 12 words');
  assert.ok(walletRes.privateKey && walletRes.privateKey.startsWith('0x'), 'Private key must be present');

  // Validate seed phrase with ethers BIP-39 mnemonic derivation
  const hdWallet = ethers.HDNodeWallet.fromPhrase(seedPhrase, '', "m/44'/60'/0'/0/0");
  assert.strictEqual(hdWallet.address.toLowerCase(), walletRes.address.toLowerCase(), 'Derived BIP-39 address must match vault address');
  assert.strictEqual(hdWallet.privateKey.toLowerCase(), walletRes.privateKey.toLowerCase(), 'Derived BIP-39 private key must match vault private key');
  console.log('✅ [PASS] Seed phrase is 100% valid BIP-39 and derives exact vault address and private key!\n');

  // --- 2. Test Dynamic Percentage Allocation Choices in Smart Contract Deployment ---
  console.log('--- 2. Testing Custom Percentage Choices in deploy_smart_contract ---');

  // Case A: 15% owner allocation (85% reserve)
  const deploy15 = await executeRealTool('deploy_smart_contract', {
    contractName: 'FifteenPercentToken',
    symbol: 'FPT',
    contractType: 'erc20',
    totalSupply: 1000000,
    ownerAllocationPercentage: 15,
    network: 'sepolia',
  }, '0x56F0Fdbe1B09C0f65DA1cb73ef878C07EC645417');

  console.log('Case A (15% Allocation):', {
    contractAddress: deploy15.contractAddress,
    status: deploy15.status,
    txHash: deploy15.txHash,
  });
  assert.ok(deploy15.contractAddress && deploy15.contractAddress.startsWith('0x'), 'Should deploy with 15% allocation');
  console.log('✅ [PASS] 15% owner allocation successfully deployed on Sepolia!\n');

  // Case B: Minting from the 85% reserve
  console.log('--- 3. Testing Minting from Reserve against Deployed Contract ---');
  const mintRes = await executeRealTool('mint_tokens', {
    contractAddress: deploy15.contractAddress,
    recipientAddress: '0x000000000000000000000000000000000000dEaD',
    amount: '10000',
    network: 'sepolia',
  }, '0x56F0Fdbe1B09C0f65DA1cb73ef878C07EC645417');

  console.log('Mint Result:', {
    txHash: mintRes.txHash,
    status: mintRes.status,
    amount: mintRes.amount,
  });
  assert.ok(mintRes.txHash && mintRes.txHash.startsWith('0x'), 'Mint transaction should succeed on-chain');
  console.log('✅ [PASS] Successfully minted 10,000 tokens from the custom reserve on Sepolia!\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL DYNAMIC ALLOCATIONS & SEED PHRASE CHECKS PASSED!');
  console.log('═══════════════════════════════════════════════════════════════');
}

testAllocationAndSeedPhrase().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
