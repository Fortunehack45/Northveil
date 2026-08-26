import http from 'http';
import { app } from '../mcp-server/index.js';

async function run() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(3101, '127.0.0.1', resolve));

  try {
    const prepRes = await fetch('http://127.0.0.1:3101/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'northveil_prepare_transfer',
          arguments: {
            to: '0x1111111254eEB25477b68fB85eD929F73A960382',
            amount: 0.01,
            network: 'base',
          },
        },
        id: 1,
      }),
    });
    const prepData = await prepRes.json();
    console.log('PREP RESULT:', JSON.stringify(prepData, null, 2));

    const apprId = (prepData as any).result?.approval?.id || (prepData as any).result?.approval?.approval_id;
    console.log('EXTRACTED APPROVAL ID:', apprId);

    const statusRes = await fetch('http://127.0.0.1:3101/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'northveil_get_approval_status',
          arguments: { approval_id: apprId },
        },
        id: 2,
      }),
    });
    const statusData = await statusRes.json();
    console.log('STATUS RESULT:', JSON.stringify(statusData, null, 2));

    const bcastRes = await fetch('http://127.0.0.1:3101/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'northveil_request_broadcast',
          arguments: { approval_id: apprId },
        },
        id: 3,
      }),
    });
    const bcastData = await bcastRes.json();
    console.log('BROADCAST RESULT:', JSON.stringify(bcastData, null, 2));
  } finally {
    server.close();
  }
}

run().catch(console.error);
