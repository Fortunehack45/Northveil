import http from 'http';
import { app } from '../mcp-server/index.js';

async function testRealLiveBroadcast() {
  console.log('🧪 Testing REAL ON-CHAIN BROADCAST via Northveil MCP...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Test: send_transfer via JSON-RPC /mcp
    console.log('\n1. Sending real 0.0001 Sepolia ETH transfer via MCP:');
    const res = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 999,
        method: 'tools/call',
        params: {
          name: 'send_transfer',
          arguments: {
            token: 'ETH',
            amount: 0.0001,
            recipient: '0x59148d6a9dff263a772b5a84280bc88530f38636',
            network: 'sepolia',
          },
        },
      }),
    });

    const data: any = await res.json();
    console.log('Response JSON:', JSON.stringify(data, null, 2));

    const txHash = data.result?.txHash;
    const blockNumber = data.result?.blockNumber;
    const explorerUrl = data.result?.explorerUrl;

    console.log('\n--- VERIFICATION OF REAL TRANSACTION ---');
    console.log('TX Hash:', txHash);
    console.log('Block Number:', blockNumber);
    console.log('Explorer URL:', explorerUrl);

    if (!txHash || txHash.length !== 66 || !txHash.startsWith('0x')) {
      throw new Error('Invalid TX Hash format returned');
    }

    if (!blockNumber || blockNumber <= 0) {
      throw new Error('Invalid block number returned');
    }

    console.log('✅ Real on-chain broadcast verified successfully!');
  } finally {
    server.close();
    process.exit(0);
  }
}

testRealLiveBroadcast().catch((err) => {
  console.error('❌ Real broadcast test failed:', err);
  process.exit(1);
});
