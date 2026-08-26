delete process.env.NORTHVEIL_DEMO_MODE;
delete process.env.TURNKEY_ORGANIZATION_ID;
process.env.NODE_ENV = 'production';

import http from 'http';
import { app } from '../mcp-server/index.js';

async function runClaudeFlowTests() {
  console.log('🧪 Testing Claude/AI Agent send_transfer & approve_transaction flows...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Test 1: send_transfer with Claude's exact arguments (recipient + amount 0.0005) via JSON-RPC /mcp
    console.log('\n1. Testing JSON-RPC /mcp with exact Claude parameters:');
    const mcpRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 101,
        method: 'tools/call',
        params: {
          name: 'send_transfer',
          arguments: {
            token: 'ETH',
            amount: 0.0005,
            recipient: '0x59148d6a9dff263a772b5a84280bc88530f38636',
            network: 'sepolia',
          },
        },
      }),
    });

    const mcpData: any = await mcpRes.json();
    console.log('MCP Response:', JSON.stringify(mcpData, null, 2));

    if (mcpData.error) {
      throw new Error(`Test 1 Failed with MCP error: ${JSON.stringify(mcpData.error)}`);
    }
    if (!mcpData.result?.txHash) {
      throw new Error('Test 1 Failed: Expected txHash in result');
    }
    console.log('✅ Test 1 Passed: Claude send_transfer executed autonomously on-chain!');

    // Test 2: send_transfer with recipientAddress & fromAddress specified
    console.log('\n2. Testing REST send_transfer with recipientAddress and fromAddress:');
    const restRes = await fetch(`${baseUrl}/api/v1/tools/send_transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        token: 'ETH',
        amount: 0.0005,
        recipientAddress: '0x59148d6a9dff263a772b5a84280bc88530f38636',
        fromAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
        chain: 'sepolia',
      }),
    });

    const restData: any = await restRes.json();
    console.log('REST Response:', JSON.stringify(restData, null, 2));
    if (!restData.success || !restData.txHash) {
      throw new Error(`Test 2 Failed: ${JSON.stringify(restData)}`);
    }
    console.log('✅ Test 2 Passed: REST send_transfer executed successfully!');

    // Test 3: approve_transaction with approval_token alias
    console.log('\n3. Testing approve_transaction with approval_token:');
    const stageRes = await fetch(`${baseUrl}/api/v1/tools/create_transaction_request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        amount: 0.0005,
        recipient: '0x59148d6a9dff263a772b5a84280bc88530f38636',
        asset: 'ETH',
        network: 'sepolia',
      }),
    });

    const stageData: any = await stageRes.json();
    const token = stageData.approvalToken;
    console.log('Staged Token:', token);

    const approveRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 102,
        method: 'tools/call',
        params: {
          name: 'approve_transaction',
          arguments: {
            approval_token: token,
          },
        },
      }),
    });

    const approveData: any = await approveRes.json();
    console.log('Approve Data:', JSON.stringify(approveData, null, 2));
    if (approveData.error || !approveData.result?.txHash) {
      throw new Error(`Test 3 Failed: ${JSON.stringify(approveData)}`);
    }
    console.log('✅ Test 3 Passed: approve_transaction executed on-chain without error!');

    // Test 4: Idempotent re-approval
    console.log('\n4. Testing idempotent re-approval:');
    const reApproveRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 103,
        method: 'tools/call',
        params: {
          name: 'approve_transaction',
          arguments: {
            approvalToken: token,
          },
        },
      }),
    });

    const reApproveData: any = await reApproveRes.json();
    if (reApproveData.error || !reApproveData.result?.txHash) {
      throw new Error(`Test 4 Failed: ${JSON.stringify(reApproveData)}`);
    }
    console.log('✅ Test 4 Passed: Idempotent re-approval returned confirmed data!');

    console.log('\n🎉 ALL CLAUDE / AI AGENT TRANSACTION FLOWS PASSED (4/4)!');
  } finally {
    server.close();
    process.exit(0);
  }
}

runClaudeFlowTests().catch((err) => {
  console.error('❌ Test run failed:', err);
  process.exit(1);
});
