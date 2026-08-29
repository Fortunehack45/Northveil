import {
  prepareTransactionRequest,
  approveAndExecuteWithPasskey,
  inMemoryTxRequests,
} from '../api/mpcControlPlaneService';

async function runApprovalTest() {
  console.log('🧪 Starting Approval Permanence Integrity Verification...\n');

  // 1. Stage a transaction request
  const walletAddress = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const recipient = '0x1111111111111111111111111111111111111111';
  const staged = await prepareTransactionRequest({
    walletAddress,
    recipient,
    amount: 0.05,
    asset: 'ETH',
    network: 'sepolia',
    userId: 'test_user_approval',
    reason: 'Test approval persistence',
  });

  console.log('1. Staged Request:');
  console.log('   Approval Token:', staged.approvalToken);
  console.log('   Status:', staged.status);

  if (staged.status !== 'pending' && staged.status !== 'SIGNATURE_REQUIRED') {
    throw new Error(`Unexpected initial status: ${staged.status}`);
  }

  // 2. Check inMemoryTxRequests before approval
  const itemBefore = inMemoryTxRequests.get(staged.approvalToken);
  console.log('2. Staged item in memory status before approval:', itemBefore?.status);
  if (!itemBefore || (itemBefore.status !== 'pending' && itemBefore.status !== 'SIGNATURE_REQUIRED')) {
    throw new Error('Staged request not in pending/signature_required status');
  }

  // 3. Approve with passkey assertion
  console.log('\n3. Executing approveAndExecuteWithPasskey with passkey assertion...');
  const approved = await approveAndExecuteWithPasskey(
    staged.approvalToken,
    { id: 'passkey_assertion_test', rawId: 'test' },
    'test_user_approval'
  );

  console.log('   Approved Response:');
  console.log('   Status:', approved.status);
  console.log('   TxHash:', approved.txHash);

  if (approved.status !== 'confirmed' || !approved.txHash) {
    throw new Error(`Approval failed to confirm: ${JSON.stringify(approved)}`);
  }

  // 4. Check that inMemoryTxRequests has updated status to 'confirmed'
  console.log('\n4. Checking memory store after approval...');
  const itemAfter = inMemoryTxRequests.get(staged.approvalToken);
  console.log('   Status in memory:', itemAfter?.status);
  console.log('   TxHash in memory:', itemAfter?.txHash);

  if (itemAfter?.status !== 'confirmed' || !itemAfter?.txHash) {
    throw new Error('FAILED: Request status in memory did not stay confirmed!');
  }

  // 5. Subsequent call to approve returns already confirmed with same txHash
  console.log('\n5. Re-checking approval result...');
  const recheck = await approveAndExecuteWithPasskey(
    staged.approvalToken,
    { id: 'passkey_assertion_test', rawId: 'test' },
    'test_user_approval'
  );

  if (recheck.status !== 'confirmed' || recheck.txHash !== approved.txHash) {
    throw new Error('FAILED: Recheck did not retain confirmed status and txHash');
  }

  console.log('\n🎉 ALL APPROVAL PERMANENCE TESTS PASSED (5/5)! Transaction confirms and NEVER reverts to pending.');
}

runApprovalTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
