delete process.env.TURNKEY_ORGANIZATION_ID;
process.env.NODE_ENV = 'production';

import http from 'http';
import { app } from '../mcp-server/index.js';
import {
  evaluateAutonomousScope,
  executeAutonomousTransaction,
  stageTransactionRequest,
  approveAndExecuteWithPasskey,
  inMemoryTxRequests,
} from '../mcp-server/mpcControlPlaneService.js';

async function runTests() {
  console.log('🧪 Testing Autonomous Execution & /approve HTML Route...');

  const testWallet = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';

  // Test 1: evaluateAutonomousScope grants default autonomous scope
  console.log('\n1. Testing evaluateAutonomousScope default grant:');
  const scopeRes = await evaluateAutonomousScope(testWallet, 'default_user', 11155111, 'ETH', 50.0);
  console.log('Scope Result:', scopeRes);
  if (!scopeRes.inScope) {
    throw new Error('Test 1 Failed: evaluateAutonomousScope should return inScope: true by default');
  }
  console.log('✅ Test 1 Passed: Default autonomous scope granted.');

  // Test 2: executeAutonomousTransaction signs and broadcasts
  console.log('\n2. Testing executeAutonomousTransaction:');
  const autoTx = await executeAutonomousTransaction(
    testWallet,
    '0x0000000000000000000000000000000000000001',
    0.005,
    'ETH',
    'sepolia',
    { to: '0x0000000000000000000000000000000000000001', value: '5000000000000000' },
    scopeRes.scopeId || 'test_scope',
    'default_user'
  );
  if (!autoTx.approvalToken && !autoTx.txHash) {
    throw new Error('Test 2 Failed: Autonomous transaction did not return approvalToken or txHash');
  }
  console.log('✅ Test 2 Passed: Autonomous transaction prepared with valid token.');

  // Test 3: Staged Request & approveAndExecuteWithPasskey without passkeyAssertion
  console.log('\n3. Testing stageTransactionRequest & auto-approval:');
  const staged = await stageTransactionRequest(
    testWallet,
    '0x0000000000000000000000000000000000000002',
    0.01,
    'ETH',
    'sepolia',
    { to: '0x0000000000000000000000000000000000000002', value: '10000000000000000' },
    'default_user',
    'Automated Test Staging'
  );
  console.log('Staged Request Token:', staged.approvalToken);

  const approved = await approveAndExecuteWithPasskey(staged.approvalToken, undefined, 'default_user');
  console.log('Approved Result:', approved);
  if (!approved.txHash || approved.status !== 'confirmed') {
    throw new Error('Test 3 Failed: approveAndExecuteWithPasskey failed to confirm without assertion');
  }
  console.log('✅ Test 3 Passed: Staged transaction auto-approved & broadcasted.');

  // Start ephemeral test server on random free port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const testPort = address.port;
  const baseUrl = `http://127.0.0.1:${testPort}`;

  try {
    // Test 4: HTTP GET /approve route returns HTML
    console.log('\n4. Testing HTTP GET /approve HTML Route:');
    const stagedForWeb = await stageTransactionRequest(
      testWallet,
      '0x0000000000000000000000000000000000000003',
      0.025,
      'ETH',
      'sepolia',
      { to: '0x0000000000000000000000000000000000000003', value: '25000000000000000' },
      'default_user',
      'Interactive Web Approval Test'
    );

    const getRes = await fetch(`${baseUrl}/approve?token=${stagedForWeb.approvalToken}`);
    const htmlText = await getRes.text();

    if (getRes.status !== 200 || !htmlText.includes('NORTHVEIL VAULT') || !htmlText.includes('0.025 ETH')) {
      throw new Error(`Test 4 Failed: /approve HTML did not contain expected content (status ${getRes.status})`);
    }
    console.log('✅ Test 4 Passed: GET /approve served interactive HTML page (Status 200).');

    // Test 5: HTTP POST /api/v1/approvals/execute executes the staged request
    console.log('\n5. Testing HTTP POST /api/v1/approvals/execute:');
    const postRes = await fetch(`${baseUrl}/api/v1/approvals/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: stagedForWeb.approvalToken }),
    });

    const postData: any = await postRes.json();
    console.log('Execute API Response:', postData);
    if (!postData.txHash || postData.status !== 'confirmed') {
      throw new Error('Test 5 Failed: /api/v1/approvals/execute did not return confirmed transaction');
    }
    console.log('✅ Test 5 Passed: /api/v1/approvals/execute confirmed on-chain.');

    console.log('\n🎉 ALL AUTONOMOUS EXECUTION & /APPROVE ROUTE TESTS PASSED (5/5)!');
  } finally {
    server.close();
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
