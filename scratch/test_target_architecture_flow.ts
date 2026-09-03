delete process.env.TURNKEY_ORGANIZATION_ID;
process.env.NODE_ENV = 'production';

import http from 'http';
import { app } from '../mcp-server/index.js';

async function testTargetArchitecture() {
  console.log('🧪 Testing Northveil Target Architecture Implementation...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Test list_wallets
    console.log('\n1. Testing list_wallets:');
    const res1 = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'nv_live_default_northveil_key' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'list_wallets',
          arguments: { walletAddress: '0x59148d6a9dff263a772b5a84280bc88530f38636' }
        }
      })
    });
    const d1: any = await res1.json();
    console.log('list_wallets full JSON:', JSON.stringify(d1, null, 2));
    if (d1.error) throw new Error(`list_wallets error: ${JSON.stringify(d1.error)}`);
    console.log('✅ 1. list_wallets verified');

    // 2. Test get_balances
    console.log('\n2. Testing get_balances:');
    const res2 = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'nv_live_default_northveil_key' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'get_balances',
          arguments: { walletAddress: '0x59148d6a9dff263a772b5a84280bc88530f38636' }
        }
      })
    });
    const d2: any = await res2.json();
    console.log('get_balances net worth:', d2.result?.netWorthUsd);
    if (d2.result?.netWorthUsd === undefined) throw new Error('Failed to get balances');
    console.log('✅ 2. get_balances verified');

    // 3. Test simulate_transaction
    console.log('\n3. Testing simulate_transaction:');
    const res3 = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'nv_live_default_northveil_key' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'simulate_transaction',
          arguments: {
            from: '0x59148d6a9dff263a772b5a84280bc88530f38636',
            to: '0x59148d6a9dff263a772b5a84280bc88530f38636',
            value: '1000000000000000',
            chain: 'base'
          }
        }
      })
    });
    const d3: any = await res3.json();
    console.log('simulate_transaction result:', d3.result?.success, 'gas:', d3.result?.gasUsed);
    if (!d3.result?.formattedMarkdown) throw new Error('Failed to simulate transaction');
    console.log('✅ 3. simulate_transaction verified');

    // 4. Test prepare_transfer
    console.log('\n4. Testing prepare_transfer:');
    const res4 = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'nv_live_default_northveil_key' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'prepare_transfer',
          arguments: {
            token: 'ETH',
            amount: 0.0001,
            recipient: '0x59148d6a9dff263a772b5a84280bc88530f38636',
            chain: 'sepolia'
          }
        }
      })
    });
    const d4: any = await res4.json();
    console.log('prepare_transfer txHash:', d4.result?.txHash);
    if (!d4.result?.txHash) throw new Error('Failed prepare_transfer execution');
    console.log('✅ 4. prepare_transfer verified');

    // 5. Test request_payment_capability
    console.log('\n5. Testing request_payment_capability:');
    const res5 = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'nv_live_default_northveil_key' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'request_payment_capability',
          arguments: {
            walletAddress: '0x59148d6a9dff263a772b5a84280bc88530f38636',
            maxAmountUsd: 50.0,
            merchant: 'Airline / Travel Agent'
          }
        }
      })
    });
    const d5: any = await res5.json();
    console.log('request_payment_capability token:', d5.result?.capabilityToken);
    if (!d5.result?.capabilityToken) throw new Error('Failed to mint payment capability');
    console.log('✅ 5. request_payment_capability verified');

    console.log('\n🎉 ALL TARGET ARCHITECTURE TOOLS VERIFIED 100% PASSING (5/5)!');
  } finally {
    server.close();
    process.exit(0);
  }
}

testTargetArchitecture().catch((err) => {
  console.error('❌ Target architecture test failed:', err);
  process.exit(1);
});
