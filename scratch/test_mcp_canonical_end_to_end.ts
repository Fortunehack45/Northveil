process.env.NODE_ENV = 'test';
import http from 'http';
import { app } from '../mcp-server/index.js';
import { MCP_TOOLS } from '../mcp-server/tools.js';

async function runTests() {
  console.log('============================================================');
  console.log('🚀 TESTING NORTHVEIL MCP END-TO-END SUITE');
  console.log('============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, label: string, details?: any) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${label}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${label}`);
      if (details) console.error('     Details:', JSON.stringify(details, null, 2));
    }
  }

  // Start local test server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(3099, '127.0.0.1', resolve));
  console.log('🟢 Test server running at http://127.0.0.1:3099\n');

  try {
    // ------------------------------------------------------------
    // TEST 1: OpenAPI 3.0 Specification
    // ------------------------------------------------------------
    console.log('📡 [1/4] Testing OpenAPI 3.0 Specification (/openapi.json)...');
    const openapiRes = await fetch('http://127.0.0.1:3099/openapi.json');
    assert(openapiRes.status === 200, 'GET /openapi.json returns 200 OK');
    const openapiData: any = await openapiRes.json();
    assert(openapiData.openapi === '3.0.3', 'Valid OpenAPI 3.0.3 version');
    assert(!!openapiData.paths['/mcp'], 'Exposes /mcp JSON-RPC endpoint');
    assert(!!openapiData.paths['/api/v1/northveil_health'], 'Exposes /api/v1/northveil_health');
    assert(!!openapiData.paths['/api/v1/northveil_prepare_transfer'], 'Exposes /api/v1/northveil_prepare_transfer');
    assert(!!openapiData.paths['/api/v1/northveil_request_broadcast'], 'Exposes /api/v1/northveil_request_broadcast');

    // ------------------------------------------------------------
    // TEST 2: HTTP JSON-RPC 2.0 Transport (POST /mcp)
    // ------------------------------------------------------------
    console.log('\n📡 [2/4] Testing HTTP JSON-RPC 2.0 Transport (POST /mcp)...');

    // 2a. initialize
    const initRes = await fetch('http://127.0.0.1:3099/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'Claude Desktop', version: '0.1.0' },
        },
        id: 1,
      }),
    });
    assert(initRes.status === 200, 'POST /mcp initialize returns 200');
    const initJson: any = await initRes.json();
    assert(initJson.result?.protocolVersion === '2024-11-05', 'Protocol version 2024-11-05 returned');
    assert(initJson.result?.serverInfo?.name !== undefined, 'serverInfo present');

    // 2b. tools/list
    const toolsListRes = await fetch('http://127.0.0.1:3099/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2,
      }),
    });
    assert(toolsListRes.status === 200, 'POST /mcp tools/list returns 200');
    const toolsListJson: any = await toolsListRes.json();
    const toolNames = (toolsListJson.result?.tools || []).map((t: any) => t.name);
    assert(toolNames.includes('northveil_health'), 'tools/list includes northveil_health');
    assert(toolNames.includes('northveil_list_wallets'), 'tools/list includes northveil_list_wallets');
    assert(toolNames.includes('northveil_get_balances'), 'tools/list includes northveil_get_balances');
    assert(toolNames.includes('northveil_get_portfolio'), 'tools/list includes northveil_get_portfolio');
    assert(toolNames.includes('northveil_prepare_transfer'), 'tools/list includes northveil_prepare_transfer');
    assert(toolNames.includes('northveil_request_broadcast'), 'tools/list includes northveil_request_broadcast');
    assert(toolNames.includes('northveil_get_approval_status'), 'tools/list includes northveil_get_approval_status');

    // Check that every tool has a valid inputSchema
    let validSchemas = true;
    for (const tool of toolsListJson.result?.tools || []) {
      if (!tool.inputSchema || tool.inputSchema.type !== 'object' || typeof tool.inputSchema.properties !== 'object') {
        validSchemas = false;
        console.error('Invalid tool inputSchema:', tool.name);
      }
    }
    assert(validSchemas, 'All tool inputSchemas are valid JSON Schema objects');

    // 2c. tools/call: northveil_health
    const healthCallRes = await fetch('http://127.0.0.1:3099/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'northveil_health', arguments: {} },
        id: 3,
      }),
    });
    assert(healthCallRes.status === 200, 'tools/call northveil_health returns 200');
    const healthJson: any = await healthCallRes.json();
    assert(healthJson.result?.serverVersion === '1.0.0', 'Health returns serverVersion 1.0.0');
    assert(healthJson.result?.signerStatus === 'online', 'Health returns signerStatus: online');
    assert(healthJson.result?.authStatus === 'authenticated', 'Health returns authStatus: authenticated');

    // 2d. tools/call: northveil_list_wallets
    const walletsCallRes = await fetch('http://127.0.0.1:3099/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'northveil_list_wallets', arguments: {} },
        id: 4,
      }),
    });
    assert(walletsCallRes.status === 200, 'tools/call northveil_list_wallets returns 200');
    const walletsJson: any = await walletsCallRes.json();
    assert(Array.isArray(walletsJson.result?.wallets) && walletsJson.result.wallets.length > 0, 'Returns authorized vaults list');

    // 2e. tools/call: northveil_get_balances
    const balancesCallRes = await fetch('http://127.0.0.1:3099/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'northveil_get_balances', arguments: { network: 'base' } },
        id: 5,
      }),
    });
    assert(balancesCallRes.status === 200, 'tools/call northveil_get_balances returns 200');
    const balancesJson: any = await balancesCallRes.json();
    assert(balancesJson.result?.ok === true && balancesJson.result?.native !== undefined, 'Returns on-chain native balance');

    // 2f. tools/call: northveil_prepare_transfer (STRICT NO-LINK PREVIEW)
    const prepTransferRes = await fetch('http://127.0.0.1:3099/mcp', {
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
            asset: 'ETH',
            network: 'base',
            reason: 'Coffee payout',
          },
        },
        id: 6,
      }),
    });
    assert(prepTransferRes.status === 200, 'tools/call northveil_prepare_transfer returns 200');
    const prepJson: any = await prepTransferRes.json();
    assert(prepJson.result?.ok === true, 'prepare_transfer returns ok: true');
    assert(typeof prepJson.result?.preview_id === 'string', 'Returns preview_id string');
    assert(prepJson.result?.action === 'transfer', 'Action is transfer');
    assert(prepJson.result?.decision === 'needs_device_approval', 'Decision is needs_device_approval');
    assert(typeof (prepJson.result?.approval?.id || prepJson.result?.approval?.approval_id) === 'string', 'Returns approval.id');
    const approvalId = prepJson.result?.approval?.id || prepJson.result?.approval?.approval_id;

    // Check that NO confirmation links were returned in the markdown
    const mdText = prepJson.result?.content?.[0]?.text || '';
    assert(!mdText.includes('Passkey Authorization Link'), 'No confirmation link in preview markdown');
    assert(!mdText.includes('https://mcp.northveil.xyz/approve'), 'No external approve link');

    // 2g. tools/call: northveil_get_approval_status
    const statusCallRes = await fetch('http://127.0.0.1:3099/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'northveil_get_approval_status', arguments: { approval_id: approvalId } },
        id: 7,
      }),
    });
    assert(statusCallRes.status === 200, 'tools/call northveil_get_approval_status returns 200');
    const statusJson: any = await statusCallRes.json();
    assert(statusJson.result?.status === 'pending', 'Approval status is pending');

    // 2h. tools/call: northveil_request_broadcast (Executes staged transfer on-chain)
    const broadcastCallRes = await fetch('http://127.0.0.1:3099/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'northveil_request_broadcast', arguments: { approval_id: approvalId } },
        id: 8,
      }),
    });
    assert(broadcastCallRes.status === 200, 'tools/call northveil_request_broadcast returns 200');
    const broadcastJson: any = await broadcastCallRes.json();
    assert(broadcastJson.result?.status === 'broadcasted', 'Status is broadcasted');
    assert(typeof broadcastJson.result?.tx_hash === 'string', 'Returns on-chain tx_hash');
    assert(typeof broadcastJson.result?.explorer_url === 'string', 'Returns explorer_url');

    // ------------------------------------------------------------
    // TEST 3: SSE Transport (GET /sse and POST /messages)
    // ------------------------------------------------------------
    console.log('\n📡 [3/4] Testing Server-Sent Events (SSE) Transport (/sse)...');
    const sseRes = await fetch('http://127.0.0.1:3099/sse');
    assert(sseRes.status === 200, 'GET /sse returns 200 OK');
    assert(sseRes.headers.get('content-type')?.includes('text/event-stream') || false, 'Content-Type is text/event-stream');

    const reader = sseRes.body?.getReader();
    let sseEndpoint = '';
    if (reader) {
      const { value } = await reader.read();
      const text = new TextDecoder().decode(value);
      const match = text.match(/data:\s*(http[^\s]+)/);
      if (match) sseEndpoint = match[1];
    }
    assert(!!sseEndpoint && sseEndpoint.includes('/messages?sessionId='), 'SSE stream sent messages URL endpoint');

    if (sseEndpoint) {
      const sseMsgRes = await fetch(sseEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: { name: 'northveil_health', arguments: {} },
          id: 99,
        }),
      });
      assert(sseMsgRes.status === 202 || sseMsgRes.status === 200, 'POST /messages returns 202/200');
      const sseMsgData: any = await sseMsgRes.json();
      assert(sseMsgData.result?.content !== undefined, 'SSE tool result formatted in standard MCP content[] array');
    }

    // ------------------------------------------------------------
    // TEST 4: Verification of All 15 Canonical Tools
    // ------------------------------------------------------------
    console.log('\n📡 [4/4] Verifying all canonical tools in MCP_TOOLS...');
    const canonicalList = [
      'northveil_health',
      'northveil_list_wallets',
      'northveil_get_balances',
      'northveil_get_portfolio',
      'northveil_list_nfts',
      'northveil_get_tx',
      'northveil_simulate_tx',
      'northveil_inspect_contract',
      'northveil_audit_contract',
      'northveil_prepare_transfer',
      'northveil_prepare_swap',
      'northveil_prepare_contract_call',
      'northveil_prepare_deploy',
      'northveil_request_broadcast',
      'northveil_get_approval_status',
    ];

    let allFound = true;
    for (const cName of canonicalList) {
      const found = MCP_TOOLS.some((t) => t.name === cName);
      if (!found) {
        allFound = false;
        console.error(`Missing canonical tool in MCP_TOOLS: ${cName}`);
      }
    }
    assert(allFound, 'All 15 Canonical Northveil tools are defined in MCP_TOOLS');

    console.log('\n============================================================');
    console.log(`📊 FINAL TEST SUMMARY: ${passed}/${total} (${((passed / total) * 100).toFixed(1)}%) PASSED`);
    console.log('============================================================');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
