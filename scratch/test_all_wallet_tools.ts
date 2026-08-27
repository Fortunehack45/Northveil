process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import assert from 'assert';
import {
  createMpcWallet,
  executeAutonomousTransaction,
  approveAndExecuteWithPasskey,
} from '../mcp-server/mpcControlPlaneService.js';
import { executeRealTool } from '../mcp-server/index.js';

async function testAllWalletTools() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 TESTING ALL WALLET & CONTRACT OPERATIONS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Test Create Wallet Tool
  console.log('--- 1. Testing create_wallet ---');
  const createdWallet = await createMpcWallet('user_test_all', 'Northveil Primary Test Vault');
  console.log('Created Wallet Address:', createdWallet.address);
  console.log('Seed Phrase (12 Words):', createdWallet.seedPhrase || createdWallet.mnemonic);
  assert.ok(createdWallet.address.startsWith('0x'), 'Must produce a valid 0x address');
  assert.ok(createdWallet.seedPhrase || createdWallet.mnemonic, 'Must produce a 12-word seed phrase');
  console.log('✅ [PASS] create_wallet generated address and seed phrase successfully.\n');

  // 2. Test create_wallet via executeRealTool MCP dispatcher
  console.log('--- 2. Testing MCP tool: create_wallet ---');
  const mcpWalletResult = await executeRealTool('create_wallet', { walletName: 'MCP Created Vault' }, createdWallet.address);
  assert.ok(mcpWalletResult.address, 'MCP create_wallet must return address');
  assert.ok(mcpWalletResult.formattedMarkdown, 'MCP create_wallet must return markdown');
  console.log('✅ [PASS] MCP create_wallet tool executed cleanly.\n');

  // 3. Test get_wallet_info
  console.log('--- 3. Testing MCP tool: get_wallet_info ---');
  const walletInfoResult = await executeRealTool('get_wallet_info', {}, createdWallet.address);
  assert.ok(walletInfoResult.formattedMarkdown, 'get_wallet_info must return markdown');
  console.log('✅ [PASS] MCP get_wallet_info executed cleanly.\n');

  // 4. Test Autonomous Transfer (Sepolia ETH)
  console.log('--- 4. Testing send_transfer / autonomous ETH transfer ---');
  const transferRes = await executeRealTool(
    'send_transfer',
    {
      toAddress: '0x000000000000000000000000000000000000dEaD',
      amount: '0.0001',
      token: 'ETH',
      network: 'sepolia',
    },
    '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417'
  );
  console.log('Transfer Result status:', transferRes.status);
  console.log('Transfer Tx Hash:', transferRes.txHash || transferRes.transactionHash);
  assert.ok(transferRes.txHash || transferRes.transactionHash, 'Transfer must produce a transaction hash');
  console.log('✅ [PASS] send_transfer executed successfully.\n');

  // 5. Test Smart Contract Deployment (Deploy ERC-20 token)
  console.log('--- 5. Testing deploy_smart_contract ---');
  const deployRes = await executeRealTool(
    'deploy_smart_contract',
    {
      name: 'TestVolt',
      symbol: 'VOLT',
      totalSupply: 1000000,
      network: 'sepolia',
      reserveAllocationPercentage: 20,
      ownerAllocationPercentage: 80,
    },
    '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417'
  );
  console.log('Deployment Result status:', deployRes.status);
  console.log('Deployed Contract Address:', deployRes.contractAddress);
  console.log('Deploy Tx Hash:', deployRes.txHash);
  assert.ok(deployRes.contractAddress, 'Must return deployed contract address');
  assert.ok(deployRes.txHash, 'Must return deploy transaction hash');
  console.log('✅ [PASS] deploy_smart_contract deployed on-chain successfully.\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL WALLET, TRANSFER, & DEPLOYMENT TOOLS ARE WORKING PERFECTLY!');
  console.log('═══════════════════════════════════════════════════════════════');
}

testAllWalletTools().catch((err) => {
  console.error('Test Execution Failed:', err);
  process.exit(1);
});
