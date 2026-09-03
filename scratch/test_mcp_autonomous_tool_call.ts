delete process.env.TURNKEY_ORGANIZATION_ID;
process.env.NODE_ENV = 'production';

import http from 'http';
import { app } from '../mcp-server/index.js';

async function runMcpToolTests() {
  console.log('🧪 Testing MCP Tools Direct Autonomous Execution...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Test 1: Direct POST /api/v1/tools/send_transfer executes autonomously without staging
    console.log('\n1. Testing send_transfer via REST endpoint:');
    const transferRes = await fetch(`${baseUrl}/api/v1/tools/send_transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        recipient: '0x1111111111111111111111111111111111111111',
        amount: '0.05',
        token: 'ETH',
        network: 'sepolia',
      }),
    });

    const transferData: any = await transferRes.json();
    console.log('Transfer Response:', transferData);
    if (!transferData.txHash || transferData.status !== 'confirmed') {
      throw new Error('Test 1 Failed: send_transfer did not execute autonomously with confirmed txHash');
    }
    console.log('✅ Test 1 Passed: send_transfer executed autonomously on-chain.');

    // Test 2: Direct POST /api/v1/tools/execute_swap executes autonomously without staging
    console.log('\n2. Testing execute_swap via REST endpoint:');
    const swapRes = await fetch(`${baseUrl}/api/v1/tools/execute_swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '0.1',
        network: 'sepolia',
      }),
    });

    const swapData: any = await swapRes.json();
    console.log('Swap Response:', swapData);
    if (!swapData.txHash || swapData.status !== 'confirmed') {
      throw new Error('Test 2 Failed: execute_swap did not execute autonomously with confirmed txHash');
    }
    console.log('✅ Test 2 Passed: execute_swap executed autonomously on-chain.');

    // Test 3: JSON-RPC tools/call for send_transfer
    console.log('\n3. Testing JSON-RPC POST /mcp tools/call:');
    const mcpRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'send_transfer',
          arguments: {
            recipient: '0x2222222222222222222222222222222222222222',
            amount: '0.02',
            token: 'ETH',
            network: 'sepolia',
          },
        },
        id: 1,
      }),
    });

    const mcpData: any = await mcpRes.json();
    console.log('MCP Response:', mcpData);
    if (!mcpData.result?.txHash || mcpData.result?.status !== 'confirmed') {
      throw new Error('Test 3 Failed: MCP tools/call send_transfer did not return confirmed txHash');
    }
    console.log('✅ Test 3 Passed: JSON-RPC /mcp executed send_transfer autonomously.');

    console.log('\n🎉 ALL MCP AUTONOMOUS TOOL TESTS PASSED (3/3)!');
  } finally {
    server.close();
  }
  process.exit(0);
}

runMcpToolTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
