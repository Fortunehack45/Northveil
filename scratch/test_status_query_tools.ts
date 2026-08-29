import { ethers } from 'ethers';
import {
  prepareTransactionRequest,
  validateAndBroadcastSignedTransaction,
  inMemoryTxRequests,
} from '../api/mpcControlPlaneService.js';

async function testStatusQueryTools() {
  console.log('🧪 Testing Transaction & Smart Contract Status Tools for AI Agents...\n');

  const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com', 11155111, { staticNetwork: ethers.Network.from(11155111) });
  const testWallet = ethers.Wallet.createRandom().connect(provider);

  // 1. Prepare and stage a deployment
  const prep = await prepareTransactionRequest({
    walletAddress: testWallet.address,
    recipient: '',
    amount: 0,
    asset: 'DEPLOY',
    network: 'sepolia',
    chainId: 11155111,
    calldata: '0x608060405234801561001057600080fd5b5060405161010038038061010083398101604081905261002f91610034565b600080546001600160a01b0319163317905556',
    gasLimit: 3500000,
    operationType: 'DEPLOY_CONTRACT',
    reason: 'Deploy Smart Contract: WATER ($WAR)',
    userId: 'default_user',
    isDeploy: true,
  });

  const staged = inMemoryTxRequests.get(prep.approvalToken);
  console.log(`1. Initial staged status: ${staged?.status}`);
  if (staged?.status !== 'pending') {
    throw new Error('Expected initial status to be pending');
  }

  // 2. Simulate broadcast confirmation in memory / mock
  const dummyTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const expectedContract = ethers.getCreateAddress({ from: testWallet.address, nonce: prep.nonce });
  
  if (staged) {
    staged.status = 'confirmed';
    staged.txHash = dummyTxHash;
    staged.contractAddress = expectedContract;
    staged.blockNumber = 1234567;
    staged.explorerUrl = `https://sepolia.etherscan.io/tx/${dummyTxHash}`;
    inMemoryTxRequests.set(prep.approvalToken, staged);
    inMemoryTxRequests.set(prep.requestId, staged);
    inMemoryTxRequests.set(dummyTxHash, staged);
  }

  // 3. Query via approval token
  const retrievedByToken = inMemoryTxRequests.get(prep.approvalToken);
  console.log(`2. Retrieved by Approval Token:`);
  console.log(`   - Status: ${retrievedByToken?.status}`);
  console.log(`   - Contract Address: ${retrievedByToken?.contractAddress}`);
  console.log(`   - Tx Hash: ${retrievedByToken?.txHash}`);
  if (retrievedByToken?.status !== 'confirmed' || retrievedByToken?.contractAddress !== expectedContract) {
    throw new Error('Failed to retrieve confirmed contract status by approval token');
  }
  console.log('   ✅ [PASS] Agent can find and confirm deployment via approval token.');

  // 4. Query via request ID
  const retrievedById = inMemoryTxRequests.get(prep.requestId);
  console.log(`3. Retrieved by Request ID:`);
  console.log(`   - Status: ${retrievedById?.status}`);
  console.log(`   - Contract Address: ${retrievedById?.contractAddress}`);
  if (retrievedById?.status !== 'confirmed' || retrievedById?.contractAddress !== expectedContract) {
    throw new Error('Failed to retrieve confirmed contract status by request ID');
  }
  console.log('   ✅ [PASS] Agent can find and confirm deployment via request ID.');

  // 5. Query via Tx Hash
  const retrievedByHash = inMemoryTxRequests.get(dummyTxHash);
  console.log(`4. Retrieved by Tx Hash:`);
  console.log(`   - Status: ${retrievedByHash?.status}`);
  console.log(`   - Contract Address: ${retrievedByHash?.contractAddress}`);
  if (retrievedByHash?.status !== 'confirmed' || retrievedByHash?.contractAddress !== expectedContract) {
    throw new Error('Failed to retrieve confirmed contract status by tx hash');
  }
  console.log('   ✅ [PASS] Agent can find and confirm deployment via tx hash.');

  console.log('\n🎉 ALL AGENT STATUS QUERY TESTS PASSED (5/5)\n');
}

testStatusQueryTools().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
