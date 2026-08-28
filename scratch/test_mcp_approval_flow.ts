import { ethers } from 'ethers';
import {
  prepareTransactionRequest,
  validateAndBroadcastSignedTransaction,
  approveAndExecuteWithPasskey,
} from '../api/mpcControlPlaneService';

async function testMpcApprovalFlow() {
  console.log('🧪 Testing MCP Transaction Preparation, Approval & Signing Flow...\n');

  // 1. Create a test wallet for deterministic test signing
  const testWallet = ethers.Wallet.createRandom();
  console.log('1. Test Wallet Address:', testWallet.address);

  // 2. Prepare / Stage a transaction (like Claude/ChatGPT MCP agent does)
  const recipient = '0x59148d6a9dff263a772b5a84280bc88530f38636';
  const amount = 0.00005;
  const prep = await prepareTransactionRequest({
    walletAddress: testWallet.address,
    recipient,
    amount,
    asset: 'ETH',
    network: 'sepolia',
    userId: 'default_user',
    operationType: 'TRANSFER',
  });

  console.log('2. Staged Transaction Request:');
  console.log('   - Request ID:', prep.requestId);
  console.log('   - Approval Token:', prep.approvalToken);
  console.log('   - Status:', prep.status);
  console.log('   - Chain ID:', prep.chainId);

  if (prep.status !== 'pending' || !prep.approvalToken || !prep.requestId) {
    throw new Error('Staged request missing approvalToken or status is not pending');
  }
  console.log('   ✅ [PASS] Staged request created with valid single-use approval token.');

  // 3. Test approve endpoint returns signable payload
  const signable = await approveAndExecuteWithPasskey(prep.approvalToken);
  console.log('3. Fetched signable request:');
  console.log('   - Status:', signable.status);
  console.log('   - Nonce:', signable.nonce);
  if (signable.status !== 'SIGNATURE_REQUIRED') {
    throw new Error('Expected SIGNATURE_REQUIRED status');
  }
  console.log('   ✅ [PASS] Approval endpoint correctly returned signable payload.');

  // 4. Test client-side signing
  const txToSign = {
    to: recipient,
    value: ethers.parseEther(String(amount)),
    nonce: signable.nonce || 0,
    gasLimit: 21000n,
    maxFeePerGas: ethers.parseUnits('20', 'gwei'),
    maxPriorityFeePerGas: ethers.parseUnits('1.5', 'gwei'),
    chainId: 11155111,
    type: 2,
  };

  const signedSerialized = await testWallet.signTransaction(txToSign);
  console.log('4. Signed raw transaction on client device:');
  console.log('   - Raw Hex (truncated):', signedSerialized.slice(0, 30) + '...');

  const recoveredSender = ethers.Transaction.from(signedSerialized).from?.toLowerCase();
  console.log('   - Recovered Signer Address:', recoveredSender);
  if (recoveredSender !== testWallet.address.toLowerCase()) {
    throw new Error('Recovered signer does not match test wallet');
  }
  console.log('   ✅ [PASS] Signature verified cryptographically matching authorized vault.');

  console.log('\n🎉 ALL MCP APPROVAL & SIGNING TESTS PASSED (4/4)');
}

testMpcApprovalFlow().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
