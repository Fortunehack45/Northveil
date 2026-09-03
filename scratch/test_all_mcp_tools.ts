process.env.NODE_ENV = 'test';

async function run() {
  const { app } = await import('../mcp-server/index.js');
  const { MCP_TOOLS } = await import('../mcp-server/tools.js');
  const { stageTransactionRequest } = await import('../mcp-server/mpcControlPlaneService.js');

  const server = app.listen(0, '127.0.0.1', async () => {
    const addr: any = server.address();
    const PORT = addr.port;
    console.log(`Server started on http://127.0.0.1:${PORT}`);
    console.log(`Verifying MCP Connection Spec Compliance & Auditing all ${MCP_TOOLS.length} MCP tools...\n`);

    let passed = 0;
    let failed = 0;

    // 1. Verify Gap 1: GET /mcp returns 405 Method Not Allowed with Allow: POST header
    try {
      const getMcpRes = await fetch(`http://127.0.0.1:${PORT}/mcp`);
      const allowHeader = getMcpRes.headers.get('allow');
      const getMcpJson: any = await getMcpRes.json();
      if (getMcpRes.status === 405 && allowHeader?.includes('POST') && getMcpJson.error?.code === -32601) {
        console.log(`[PASS] Compliance Gap 1: GET /mcp returns 405 Method Not Allowed with Allow: POST header`);
        passed++;
      } else {
        console.log(`[FAIL] Compliance Gap 1: GET /mcp returned status ${getMcpRes.status}, Allow: ${allowHeader}`);
        failed++;
      }
    } catch (e: any) {
      console.log(`[ERROR] Compliance Gap 1 -> ${e.message}`);
      failed++;
    }

    // 2. Verify Gap 2: GET /.well-known/oauth-protected-resource returns valid RFC 9728 metadata
    try {
      const protRes = await fetch(`http://127.0.0.1:${PORT}/.well-known/oauth-protected-resource`);
      const protJson: any = await protRes.json();
      if (protRes.ok && protJson.resource && Array.isArray(protJson.authorization_servers)) {
        console.log(`[PASS] Compliance Gap 2: GET /.well-known/oauth-protected-resource returns valid RFC 9728 metadata`);
        passed++;
      } else {
        console.log(`[FAIL] Compliance Gap 2: GET /.well-known/oauth-protected-resource failed`);
        failed++;
      }
    } catch (e: any) {
      console.log(`[ERROR] Compliance Gap 2 -> ${e.message}`);
      failed++;
    }

    // 3. Verify OAuth Authorization Server Metadata (RFC 8414)
    try {
      const authMetaRes = await fetch(`http://127.0.0.1:${PORT}/.well-known/oauth-authorization-server`);
      const authMetaJson: any = await authMetaRes.json();
      if (authMetaRes.ok && authMetaJson.authorization_endpoint && authMetaJson.token_endpoint) {
        console.log(`[PASS] Compliance: GET /.well-known/oauth-authorization-server returns valid RFC 8414 metadata`);
        passed++;
      } else {
        console.log(`[FAIL] Compliance: GET /.well-known/oauth-authorization-server failed`);
        failed++;
      }
    } catch (e: any) {
      console.log(`[ERROR] Compliance -> ${e.message}`);
      failed++;
    }

    // 4. Verify OpenAPI 3.0 endpoint
    try {
      const openapiRes = await fetch(`http://127.0.0.1:${PORT}/openapi.json`);
      const openapiJson: any = await openapiRes.json();
      if (openapiRes.ok && openapiJson.openapi && openapiJson.info?.title) {
        console.log(`[PASS] Compliance: GET /openapi.json returns valid OpenAPI 3.0 specification`);
        passed++;
      } else {
        console.log(`[FAIL] Compliance: GET /openapi.json failed`);
        failed++;
      }
    } catch (e: any) {
      console.log(`[ERROR] Compliance -> ${e.message}`);
      failed++;
    }

    // Pre-stage transaction requests for tests
    const req1 = await stageTransactionRequest('0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417', '0x0000000000000000000000000000000000000001', 0.01, 'ETH', 'sepolia', {}, 'default_user', 'Stage for approve');
    const req2 = await stageTransactionRequest('0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417', '0x0000000000000000000000000000000000000002', 0.02, 'ETH', 'sepolia', {}, 'default_user', 'Stage for reject');
    const req3 = await stageTransactionRequest('0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417', '0x0000000000000000000000000000000000000003', 0.03, 'ETH', 'sepolia', {}, 'default_user', 'Stage for passkey approve');

    const passkeyUserId = `user_${Date.now()}`;

    const testArgs: Record<string, any> = {
      create_wallet: { userId: 'test_user', walletName: 'Test Vault', chain: 'ethereum' },
      import_wallet: { address: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417', walletName: 'Test' },
      get_wallet_info: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      get_portfolio: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      get_wallet_balance: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      get_token_balance: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417', token: 'ETH' },
      get_transaction_history: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      get_active_orders: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      check_wallet_health: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      scan_wallet_security: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      get_nft_gallery: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      list_reservations: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      search_flights: { fromCity: 'New York', toCity: 'London', departDate: '2026-09-01' },
      search_hotels: { city: 'Tokyo', checkInDate: '2026-09-01', checkOutDate: '2026-09-05' },
      search_events_and_movies: { city: 'San Francisco', category: 'concert' },
      get_realtime_prices: { symbols: 'ETH,BTC,SOL' },
      get_trending_memecoins: {},
      get_gas_estimate: { network: 'ethereum' },
      audit_smart_contract: { contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
      audit_token: { tokenAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
      verify_smart_contract: { contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
      estimate_swap_output: { fromToken: 'ETH', toToken: 'USDC', amount: 1 },
      search_uniswap_pools: { tokenA: 'ETH', tokenB: 'USDC' },
      create_smart_contract: { name: 'TestToken', symbol: 'TTK', type: 'erc20', initialSupply: 1000 },
      upload_contract_asset: { fileBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
      generate_passkey_registration_options: { userId: 'user_test' },
      set_autonomous_spending_scope: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417', maxAmountPerTxUsd: 50, maxDailyBudgetUsd: 200 },
      activate_kill_switch: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      deactivate_kill_switch: { walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417' },
      create_transaction_request: {
        walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
        recipient: '0x0000000000000000000000000000000000000001',
        amount: 0.01,
        asset: 'ETH',
        network: 'sepolia',
      },
      approve_transaction: { approvalToken: req1.approvalToken },
      reject_transaction: { approvalToken: req2.approvalToken },
      get_transaction_status: { requestId: req1.requestId },
      approve_transaction_with_passkey: { approvalToken: req3.approvalToken },
      send_transfer: {
        fromAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
        recipientAddress: '0x0000000000000000000000000000000000000001',
        token: 'ETH',
        amount: 0.01,
        chain: 'sepolia',
      },
      execute_swap: {
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: 0.01,
        network: 'sepolia',
      },
      buy_tokens: {
        token: 'USDC',
        amount: 10,
        network: 'sepolia',
      },
      sell_tokens: {
        token: 'USDC',
        amount: 10,
        network: 'sepolia',
      },
      deploy_smart_contract: {
        contractName: 'TestToken',
        symbol: 'TTK',
        network: 'sepolia',
        contractType: 'erc20',
        totalSupply: 1000000,
      },
      mint_tokens: {
        contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        recipientAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
        amount: 100,
        network: 'sepolia',
      },
      mint_nft: {
        walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
        recipient: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
        name: 'Test NFT',
        tokenUri: 'https://example.com/nft.json',
        network: 'sepolia',
      },
      northveil_prepare_transfer: {
        to: '0x1111111254eeb25477b68fb85ed929f73a960382',
        amount: '0.01',
        asset: 'ETH',
        network: 'sepolia',
      },
      northveil_request_broadcast: {
        approval_id: req1.requestId,
        approvalToken: req1.approvalToken,
      },
      northveil_get_approval_status: {
        approval_id: req1.requestId,
        approvalToken: req1.approvalToken,
      },
      set_trade_order: {
        token: 'ETH',
        amount: 0.1,
        triggerPrice: 4000,
        orderType: 'LIMIT_BUY',
        walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
      },
      cancel_trade_order: {
        orderId: 'ord_sample',
        walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
      },
    };

    for (const tool of MCP_TOOLS) {
      if (tool.name === 'verify_passkey_registration') continue;
      const args = testArgs[tool.name] || {};
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/call',
            params: {
              name: tool.name,
              arguments: args,
            },
            id: `test-${tool.name}`,
          }),
        });

        const json: any = await res.json();
        if (res.ok && !json.error) {
          console.log(`[PASS] ${tool.name}`);
          passed++;
        } else {
          console.log(`[FAIL] ${tool.name} -> ${json.error?.message || json.error || res.status}`);
          failed++;
        }
      } catch (e: any) {
        console.log(`[ERROR] ${tool.name} -> ${e.message}`);
        failed++;
      }
    }

    console.log(`\n========================================`);
    console.log(`Summary: ${passed} passed, ${failed} failed.`);
    console.log(`========================================`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
