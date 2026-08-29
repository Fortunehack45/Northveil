import { ethers } from 'ethers';
import {
  createMpcWallet,
  inMemoryTxRequests,
} from '../api/mpcControlPlaneService.js';
import { executeRealTool } from '../api/index.js';

async function testSeedPhraseAndTxStatus() {
  console.log('🧪 Testing MCP Seed Phrase Provisioning & Robust Tx Status Checking...\n');

  // 1. Test create_wallet & seed phrase generation
  console.log('1. Testing create_wallet & seed phrase export...');
  const walletResult = await createMpcWallet('Autonomous Agent Vault', 'test_agent_1');
  
  if (!walletResult.seedPhrase || walletResult.seedPhrase.split(' ').length < 12) {
    throw new Error(`Failed to generate 12-word seed phrase: ${walletResult.seedPhrase}`);
  }
  if (!walletResult.privateKey || !walletResult.address) {
    throw new Error('Failed to generate keypair / address');
  }

  console.log('   ✅ [PASS] Vault Address:', walletResult.address);
  console.log('   ✅ [PASS] 12-Word Seed Phrase:', walletResult.seedPhrase);
  console.log('   ✅ [PASS] Derivation Path:', walletResult.derivationPath);
  console.log('   ✅ [PASS] Private Key Available (Length:', walletResult.privateKey.length, ')');

  // 2. Test MCP tool northveil_create_wallet
  console.log('\n2. Testing MCP tool: northveil_create_wallet...');
  const mcpCreateRes: any = await executeRealTool('northveil_create_wallet', {
    walletName: 'MCP Secondary Vault',
    network: 'base',
  });
  if (!mcpCreateRes.seedPhrase || !mcpCreateRes.address) {
    throw new Error('MCP northveil_create_wallet did not return seedPhrase');
  }
  console.log('   ✅ [PASS] MCP Tool Result Address:', mcpCreateRes.address);
  console.log('   ✅ [PASS] MCP Tool Seed Phrase:', mcpCreateRes.seedPhrase);

  // 3. Test MCP tool export_seed_phrase
  console.log('\n3. Testing MCP tool: export_seed_phrase...');
  const mcpExportRes: any = await executeRealTool('export_seed_phrase', {
    walletAddress: mcpCreateRes.address,
  });
  if (!mcpExportRes.seedPhrase || mcpExportRes.seedPhrase.split(' ').length < 12) {
    throw new Error('MCP export_seed_phrase failed');
  }
  console.log('   ✅ [PASS] Exported Seed Phrase:', mcpExportRes.seedPhrase);

  // 4. Test Transaction Status (staged in-memory request)
  console.log('\n4. Testing northveil_get_tx with in-memory staged deployment...');
  const testHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const stagedItem: any = {
    requestId: 'req_test_status_123',
    approvalToken: 'tok_test_status_123',
    walletAddress: mcpCreateRes.address,
    recipient: '0x000000000000000000000000000000000000dEaD',
    amount: 0.05,
    asset: 'ETH',
    network: 'sepolia',
    status: 'confirmed',
    txHash: testHash,
    blockNumber: 7123456,
    contractAddress: '0x9999999999999999999999999999999999999999',
    expiresAt: new Date(Date.now() + 600000).toISOString(),
  };
  inMemoryTxRequests.set('tok_test_status_123', stagedItem);
  inMemoryTxRequests.set('req_test_status_123', stagedItem);

  const getTxRes1: any = await executeRealTool('northveil_get_tx', {
    requestId: 'req_test_status_123',
  });
  if (getTxRes1.status !== 'confirmed' || getTxRes1.txHash !== testHash) {
    throw new Error('northveil_get_tx failed for staged requestId');
  }
  console.log('   ✅ [PASS] northveil_get_tx by requestId -> Status:', getTxRes1.status);
  console.log('   ✅ [PASS] Explorer URL:', getTxRes1.explorerUrl);

  // 5. Test get_transaction_status by txHash
  console.log('\n5. Testing get_transaction_status by txHash...');
  const getTxRes2: any = await executeRealTool('get_transaction_status', {
    txHash: testHash,
  });
  if (getTxRes2.status !== 'confirmed' || getTxRes2.txHash !== testHash) {
    throw new Error('get_transaction_status failed for txHash');
  }
  console.log('   ✅ [PASS] get_transaction_status by txHash -> Status:', getTxRes2.status);

  // 6. Test robust fallback for unknown raw hash (does not crash, returns clean status)
  console.log('\n6. Testing get_transaction_status with non-staged raw txHash...');
  const randomTxHash = '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
  const getTxRes3: any = await executeRealTool('get_transaction_status', {
    txHash: randomTxHash,
  });
  console.log('   ✅ [PASS] Non-staged tx lookup status:', getTxRes3.status);
  console.log('   ✅ [PASS] Returned without error or crash.');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY (100%)\n');
  process.exit(0);
}

testSeedPhraseAndTxStatus().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
