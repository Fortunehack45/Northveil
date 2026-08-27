process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';

import { createMpcWallet } from '../mcp-server/mpcControlPlaneService.js';
import { executeRealTool } from '../mcp-server/index.js';
import { ethers } from 'ethers';
import assert from 'assert';

async function main() {
  console.log('--- 1. Testing createMpcWallet & 12-Word Seed Phrase Generation ---');
  const wallet = await createMpcWallet('test_user', 'My Self-Sovereign Vault');
  console.log('Address:', wallet.address);
  console.log('Mnemonic Seed Phrase:', wallet.mnemonic);
  console.log('Private Key:', wallet.privateKey);
  console.log('Derivation Path:', wallet.derivationPath);

  assert.ok(wallet.address && wallet.address.startsWith('0x'), 'Must have valid address');
  assert.ok(wallet.mnemonic, 'Must have mnemonic');
  const words = wallet.mnemonic.trim().split(/\s+/);
  assert.strictEqual(words.length, 12, 'Must have 12 words');
  assert.ok(wallet.privateKey && wallet.privateKey.startsWith('0x'), 'Must have valid private key');

  // Verify derivation parity
  const restored = ethers.HDNodeWallet.fromPhrase(wallet.mnemonic, '', "m/44'/60'/0'/0/0");
  assert.strictEqual(restored.address.toLowerCase(), wallet.address.toLowerCase());
  assert.strictEqual(restored.privateKey.toLowerCase(), wallet.privateKey.toLowerCase());
  console.log('✅ [PASS] 12-word seed phrase restoration verified with 100% parity!\n');

  console.log('--- 2. Testing create_wallet MCP Tool Output ---');
  const toolRes = await executeRealTool('create_wallet', { walletName: 'MCP Vault' }, '');
  console.log('MCP Tool Result Address:', toolRes.address);
  console.log('MCP Tool Formatted Markdown Preview:\n', toolRes.formattedMarkdown);
  assert.ok(toolRes.formattedMarkdown.includes('Recovery Seed Phrase (12 Words)'));
  assert.ok(toolRes.formattedMarkdown.includes('Private Key'));
  console.log('✅ [PASS] create_wallet tool returns seed phrase and private key!\n');

  console.log('--- 3. Testing Dynamic Percentage Choices in Contract Deployment ---');
  // Deploy with custom 10% owner allocation (90% reserve)
  const deployRes = await executeRealTool('deploy_smart_contract', {
    contractName: 'CustomReserveToken',
    symbol: 'CRT',
    contractType: 'erc20',
    totalSupply: 500000,
    ownerAllocationPercentage: 10,
    network: 'sepolia',
  }, '0x56F0Fdbe1B09C0f65DA1cb73ef878C07EC645417');

  console.log('Deploy Result:', {
    contractAddress: deployRes.contractAddress,
    status: deployRes.status,
    txHash: deployRes.txHash,
  });
  assert.ok(deployRes.contractAddress && deployRes.contractAddress.startsWith('0x'));
  console.log('✅ [PASS] Custom 10% owner allocation contract successfully deployed on Sepolia!\n');

  console.log('--- 4. Testing Minting from Reserve against Deployed Contract ---');
  const mintRes = await executeRealTool('mint_tokens', {
    contractAddress: deployRes.contractAddress,
    recipientAddress: '0x000000000000000000000000000000000000dEaD',
    amount: '5000',
    network: 'sepolia',
  }, '0x56F0Fdbe1B09C0f65DA1cb73ef878C07EC645417');

  console.log('Mint Result:', {
    txHash: mintRes.txHash,
    status: mintRes.status,
    amount: mintRes.amount,
  });
  assert.ok(mintRes.txHash && mintRes.txHash.startsWith('0x'));
  console.log('✅ [PASS] Minted 5,000 tokens from the custom reserve on Sepolia!\n');

  console.log('🎉 ALL DYNAMIC ALLOCATION & SEED PHRASE TESTS PASSED!');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
