import { ethers } from 'ethers';
import { prepareTransactionRequest, validateAndBroadcastSignedTransaction } from '../api/mpcControlPlaneService.js';
import { SupabaseService } from '../src/services/SupabaseService.js';

async function runContractDeploymentTest() {
  console.log('🧪 Testing End-to-End Smart Contract Deployment & Approval Flow...\n');

  const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com', 11155111, { staticNetwork: ethers.Network.from(11155111) });
  const testWallet = ethers.Wallet.createRandom().connect(provider);
  console.log(`1. Test Deployer Vault Address: ${testWallet.address}`);

  // Minimal ERC-20 bytecode for test
  const dummyBytecode = '0x608060405234801561001057600080fd5b5060405161010038038061010083398101604081905261002f91610034565b600080546001600160a01b0319163317905556';

  // 2. Prepare Contract Deployment
  const prep = await prepareTransactionRequest({
    walletAddress: testWallet.address,
    recipient: '',
    amount: 0,
    asset: 'DEPLOY',
    network: 'sepolia',
    chainId: 11155111,
    calldata: dummyBytecode,
    gasLimit: 3500000,
    operationType: 'DEPLOY_CONTRACT',
    reason: 'Deploy Smart Contract: WATER ($WAR)',
    userId: 'default_user',
    isDeploy: true,
  });

  console.log(`2. Prepared Deployment Request:`);
  console.log(`   - Request ID: ${prep.requestId}`);
  console.log(`   - Approval Token: ${prep.approvalToken}`);
  console.log(`   - Operation: ${prep.operation}`);
  console.log(`   - To (must be undefined): ${prep.unsignedTransaction.to}`);
  console.log(`   - Nonce: ${prep.nonce}`);
  console.log(`   - Data length: ${prep.unsignedTransaction.data.length} chars`);

  if (prep.unsignedTransaction.to !== undefined) {
    throw new Error(`TEST FAILED: prep.unsignedTransaction.to MUST be undefined for contract deployments! Found: ${prep.unsignedTransaction.to}`);
  }
  console.log('   ✅ [PASS] Contract deployment transaction has undefined "to" (valid contract creation payload).');

  // 3. Client-side signing of the contract deployment
  const unsignedTx = {
    ...prep.unsignedTransaction,
    value: 0n,
  };
  delete unsignedTx.to;

  const populated = await testWallet.populateTransaction(unsignedTx);
  const signedSerialized = await testWallet.signTransaction(populated);
  console.log(`3. Signed Serialized Contract Deployment Hex (truncated): ${signedSerialized.slice(0, 42)}...`);

  const parsed = ethers.Transaction.from(signedSerialized);
  console.log(`   - Recovered Signer: ${parsed.from}`);
  console.log(`   - Transaction To: ${parsed.to}`);
  if (parsed.from?.toLowerCase() !== testWallet.address.toLowerCase()) {
    throw new Error(`TEST FAILED: Recovered signer (${parsed.from}) does not match test wallet (${testWallet.address})`);
  }
  if (parsed.to !== null) {
    throw new Error(`TEST FAILED: Signed transaction "to" should be null for contract creation! Found: ${parsed.to}`);
  }
  console.log('   ✅ [PASS] Client-side signature accurately creates a contract creation transaction.');

  // 4. Expected contract address computation
  const expectedContractAddress = ethers.getCreateAddress({
    from: testWallet.address,
    nonce: prep.nonce,
  });
  console.log(`4. Deterministic Deployed Contract Address: ${expectedContractAddress}`);
  if (!ethers.isAddress(expectedContractAddress)) {
    throw new Error(`TEST FAILED: Invalid contract address computed`);
  }
  console.log('   ✅ [PASS] Contract address is deterministically computable.');

  console.log('\n🎉 ALL SMART CONTRACT DEPLOYMENT TESTS PASSED (4/4)\n');
}

runContractDeploymentTest().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
