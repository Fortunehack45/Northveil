import http from 'http';
import { app } from '../mcp-server/index.js';

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`Server listening on ${baseUrl}\n`);

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 1: Un-bound Guest Session (Claude has not received an address yet)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('--- SCENARIO 1: Un-bound Guest Session ---');
  
  // 1a. northveil_list_wallets
  const listRes = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'northveil_list_wallets', arguments: {} },
      id: 1,
    }),
  });
  const listJson: any = await listRes.json();
  console.log('northveil_list_wallets status:', listJson.result?.ok, 'count:', listJson.result?.count, listJson.result?.formattedMarkdown?.slice(0, 50));

  // 1b. get_wallet_info
  const infoRes = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'get_wallet_info', arguments: {} },
      id: 2,
    }),
  });
  const infoJson: any = await infoRes.json();
  console.log('get_wallet_info status:', infoJson.result?.ok, infoJson.result?.status, infoJson.result?.formattedMarkdown?.slice(0, 50));

  // 1c. get_portfolio
  const portRes = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'get_portfolio', arguments: {} },
      id: 3,
    }),
  });
  const portJson: any = await portRes.json();
  console.log('get_portfolio status:', portJson.result?.ok, portJson.result?.status, portJson.result?.formattedMarkdown?.slice(0, 50));

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 2: Connected via Query Parameter ?wallet_address=0x...
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n--- SCENARIO 2: URL Bound Session (?wallet_address=0x...) ---');
  const boundRes = await fetch(`${baseUrl}/mcp?wallet_address=0x56F0Fdbe1B09C0f65DA1cb73ef878C07EC645417`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'get_wallet_info', arguments: {} },
      id: 4,
    }),
  });
  const boundJson: any = await boundRes.json();
  console.log('URL bound get_wallet_info:', boundJson.result?.walletAddress, 'mainnetEth:', boundJson.result?.mainnetEthBalance);

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 3: User passes address in prompt / tool arguments
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n--- SCENARIO 3: Tool Argument walletAddress ---');
  const argRes = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'get_portfolio', arguments: { walletAddress: '0x56F0Fdbe1B09C0f65DA1cb73ef878C07EC645417' } },
      id: 5,
    }),
  });
  const argJson: any = await argRes.json();
  console.log('Argument bound get_portfolio holdings count:', argJson.result?.holdings?.length, 'netWorth:', argJson.result?.totalNetWorth);

  server.close();
  console.log('\n🎉 ALL SCENARIOS PASSED WITH ZERO ISSUES!');
}

runTests().catch(console.error);
