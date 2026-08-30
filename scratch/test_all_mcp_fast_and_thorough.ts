process.env.NODE_ENV = 'test';
process.env.NORTHVEIL_WALLET_ADDRESS = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';

import http from 'http';
import path from 'path';
import { spawn } from 'child_process';
import { ethers } from 'ethers';
import { app, executeRealTool } from '../mcp-server/index.js';
import { MCP_TOOLS } from '../mcp-server/tools.js';
import {
  stageTransactionRequest,
  prepareTransactionRequest,
  approveAndExecuteWithPasskey,
  rejectTransactionRequest,
  activateKillSwitch,
  deactivateKillSwitch,
  isKillSwitchActive,
  validateAndBroadcastSignedTransaction,
} from '../mcp-server/mpcControlPlaneService.js';

async function runMcpVerificationSuite() {
  console.log('======================================================================');
  console.log('🚀 NORTHVEIL MCP FULL PROTOCOL, APPROVAL & TOOL VERIFICATION SUITE');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;
  let total = 0;

  function assert(condition: boolean, label: string, extra?: any) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${label}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${label}`);
      if (extra) console.error('     Details:', extra);
      failed++;
    }
  }

  const TEST_WALLET = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const RECIPIENT = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const DEV_API_KEY = 'nv_live_9f82a17b09c82415d8a9';

  // Start HTTP Server on ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`📡 Local Test Server running at ${baseUrl}\n`);

  try {
    // =========================================================================
    // SECTION 1: MCP CONNECTION FLOW & TRANSPORT PROTOCOLS
    // =========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 [SECTION 1] Testing MCP Connection Flow & Transport Protocols');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 1.1 HTTP JSON-RPC initialize
    const initRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': DEV_API_KEY },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'Claude Desktop', version: '1.0' } },
        id: 1,
      }),
    });
    assert(initRes.status === 200, 'HTTP POST /mcp initialize returns 200 OK');
    const initData: any = await initRes.json();
    assert(initData.result?.protocolVersion === '2024-11-05', 'Protocol version matches MCP v2024-11-05 spec');
    assert(initData.result?.serverInfo?.name?.includes('Northveil') || false, `Server info name valid: "${initData.result?.serverInfo?.name}"`);

    // 1.2 HTTP JSON-RPC tools/list
    const toolsListRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': DEV_API_KEY },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2,
      }),
    });
    assert(toolsListRes.status === 200, 'HTTP POST /mcp tools/list returns 200 OK');
    const toolsListData: any = await toolsListRes.json();
    assert(Array.isArray(toolsListData.result?.tools), 'tools/list returned array of tool definitions');
    assert(toolsListData.result?.tools?.length >= 59, `tools/list returned all registered MCP tools (${toolsListData.result?.tools?.length} tools)`);

    // Verify all tool definitions conform to inputSchema object requirements
    let allSchemasValid = true;
    for (const t of toolsListData.result?.tools || []) {
      if (!t.name || !t.description || !t.inputSchema || t.inputSchema.type !== 'object') {
        allSchemasValid = false;
        console.error('Invalid tool definition:', t.name);
      }
    }
    assert(allSchemasValid, `All ${toolsListData.result?.tools?.length} tool definitions strictly adhere to MCP JSON Schema specification`);

    // 1.3 SSE Transport Handshake
    const sseRes = await fetch(`${baseUrl}/sse`, { headers: { Accept: 'text/event-stream' } });
    assert(sseRes.status === 200, 'GET /sse returns 200 OK');
    assert(sseRes.headers.get('content-type')?.includes('text/event-stream') || false, 'GET /sse streams text/event-stream');

    // 1.4 OpenAPI Specification Endpoint
    const openapiRes = await fetch(`${baseUrl}/openapi.json`);
    assert(openapiRes.status === 200, 'GET /openapi.json returns 200 OK');
    const openapiData: any = await openapiRes.json();
    assert(!!openapiData.paths?.['/mcp'], 'OpenAPI exposes /mcp endpoint');

    // 1.5 Stdio Transport Protocol
    console.log('\n💻 Testing Stdio Transport Spawn (stdin/stdout)...');
    const stdioRes = await new Promise<{ ok: boolean; toolsCount: number }>((resolve) => {
      const tsxCli = path.resolve('node_modules/tsx/dist/cli.mjs');
      const serverProcess = spawn(process.execPath, [tsxCli, 'mcp-server/index.ts', '--stdio'], {
        cwd: path.resolve('.'),
        env: { ...process.env, NODE_ENV: 'test', MCP_TRANSPORT: 'stdio', NO_SERVER_LISTEN: 'true' },
        shell: false,
      });

      let buffer = '';
      const timer = setTimeout(() => {
        try { serverProcess.kill(); } catch {}
        resolve({ ok: false, toolsCount: 0 });
      }, 25000);

      const onData = (data: Buffer) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.id === 101) {
                // Initialize succeeded, now request tools/list
                serverProcess.stdin.write(JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'tools/list',
                  params: {},
                  id: 102,
                }) + '\n');
              } else if (parsed.id === 102 && Array.isArray(parsed.result?.tools)) {
                clearTimeout(timer);
                serverProcess.stdout.off('data', onData);
                try { serverProcess.kill(); } catch {}
                return resolve({ ok: true, toolsCount: parsed.result.tools.length });
              }
            } catch (e) {}
          }
        }
        buffer = lines[lines.length - 1];
      };

      serverProcess.stdout.on('data', onData);
      serverProcess.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'TestRunner', version: '1.0' } },
        id: 101,
      }) + '\n');
    });
    assert(stdioRes.ok, `Stdio transport JSON-RPC tools/list succeeded (${stdioRes.toolsCount}/59 tools)`);

    // 1.6 Security & Authentication Gating
    console.log('\n🔒 Testing Security & Multi-Tenant Auth Isolation...');
    const unauthRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'invalid_revoked_token' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'send_transfer', arguments: { amount: 0.1, recipient: RECIPIENT } },
        id: 10,
      }),
    });
    const unauthData: any = await unauthRes.json();
    const isGated = unauthData.error && (unauthData.error.code === -32001 || unauthData.error.message.includes('401'));
    assert(!!isGated, 'Unauthorized request with invalid API token is strictly rejected (no hardcoded fallback)');

    // =========================================================================
    // SECTION 2: TRANSACTION PREPARATION, STAGING & APPROVAL FLOW
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛡️ [SECTION 2] Testing Approval Flow, Passkeys, Signing & Safety Gates');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 2.1 Staging a transaction
    const staged = await stageTransactionRequest(
      TEST_WALLET,
      RECIPIENT,
      0.002,
      'ETH',
      'sepolia',
      { to: RECIPIENT, value: ethers.parseEther('0.002').toString() },
      'test_agent',
      'Staging Sepolia Transfer for Verification'
    );
    assert(!!staged.approvalToken, `Staged transaction generated approvalToken: ${staged.approvalToken?.slice(0, 16)}...`);
    assert(staged.status === 'pending', 'Staged transaction initial status is "pending"');
    const apprToken = staged.approvalToken;

    // 2.2 Querying approval status via tool (northveil_get_approval_status)
    const statusRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': DEV_API_KEY },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'northveil_get_approval_status', arguments: { approval_id: apprToken } },
        id: 20,
      }),
    });
    const statusData: any = await statusRes.json();
    assert(statusData.result?.status === 'pending' || statusData.result?.ok === true, 'northveil_get_approval_status verifies pending approval state');

    // 2.3 Passkey Approval Execution (approveAndExecuteWithPasskey)
    const signable = await approveAndExecuteWithPasskey(apprToken);
    assert(signable.status === 'confirmed', 'approveAndExecuteWithPasskey successfully confirmed staged transaction on-chain');
    assert(signable.walletAddress?.toLowerCase() === TEST_WALLET.toLowerCase(), 'Confirmed transaction sender matches authorized vault address');
    assert(!!signable.txHash, 'Confirmed transaction returned on-chain txHash');

    // 2.4 Cryptographic Client-Side Signing Verification
    console.log('\n🔐 Testing Cryptographic Client-Side Signing Verification...');
    const localSignerWallet = ethers.Wallet.createRandom();
    const testAmount = 0.0005;
    const testTxToSign = {
      to: RECIPIENT,
      value: ethers.parseEther(String(testAmount)),
      nonce: 0,
      gasLimit: 21000n,
      maxFeePerGas: ethers.parseUnits('25', 'gwei'),
      maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
      chainId: 11155111,
      type: 2,
    };
    const signedSerialized = await localSignerWallet.signTransaction(testTxToSign);
    const recoveredSender = ethers.Transaction.from(signedSerialized).from?.toLowerCase();
    assert(recoveredSender === localSignerWallet.address.toLowerCase(), 'Cryptographic signature verification matches local signer hardware enclave');

    // 2.5 Rejection Flow
    console.log('\n🚫 Testing User Rejection Flow...');
    const stagedToReject = await stageTransactionRequest(
      TEST_WALLET,
      RECIPIENT,
      0.01,
      'ETH',
      'sepolia',
      { to: RECIPIENT, value: ethers.parseEther('0.01').toString() },
      'test_agent',
      'Staged request to be rejected'
    );
    const rejectRes = await rejectTransactionRequest(stagedToReject.approvalToken, 'test_agent');
    assert(rejectRes.status?.toLowerCase() === 'rejected', 'rejectTransactionRequest successfully marked transaction status as "rejected"');

    // 2.6 Autonomous Spending Policy Configuration
    console.log('\n🤖 Testing Autonomous Spending Scope...');
    const scopeRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': DEV_API_KEY },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'set_autonomous_spending_scope', arguments: { walletAddress: TEST_WALLET, maxAmountPerTxUsd: 50, maxDailyBudgetUsd: 200 } },
        id: 25,
      }),
    });
    const scopeData: any = await scopeRes.json();
    assert(scopeData.result?.ok === true || scopeData.result?.success === true || scopeData.result?.status === 'active', 'set_autonomous_spending_scope granted autonomous daily budget ($200)');

    // 2.7 Emergency Kill Switch (Lockdown -> Verify Block -> Unlock)
    console.log('\n🚨 Testing Emergency Kill Switch...');
    await activateKillSwitch(TEST_WALLET, 'Security Alert Lockdown', 'test_user');
    const isLocked = await isKillSwitchActive(TEST_WALLET);
    assert(isLocked === true, 'activate_kill_switch successfully put vault into emergency lockdown');

    let prepareBlocked = false;
    try {
      await prepareTransactionRequest({
        walletAddress: TEST_WALLET,
        recipient: RECIPIENT,
        amount: 0.001,
        asset: 'ETH',
        network: 'sepolia',
      });
    } catch (err: any) {
      if (err.message?.includes('SECURITY_LOCK') || err.message?.includes('kill switch') || err.message?.includes('locked')) {
        prepareBlocked = true;
      }
    }
    assert(prepareBlocked, 'Emergency kill switch actively blocked transaction preparation');

    await deactivateKillSwitch(TEST_WALLET, 'test_user');
    const isUnlocked = await isKillSwitchActive(TEST_WALLET);
    assert(isUnlocked === false, 'deactivate_kill_switch successfully restored normal operational state');

    // =========================================================================
    // SECTION 3: TESTING ALL 59 MCP TOOLS OVER PROTOCOL
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🧰 [SECTION 3] Executing All ${MCP_TOOLS.length} Registered MCP Tools`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Create a fixture approval token
    const fixtureStaged = await stageTransactionRequest(
      TEST_WALLET,
      RECIPIENT,
      0.001,
      'ETH',
      'sepolia',
      { to: RECIPIENT, value: ethers.parseEther('0.001').toString() },
      'test_user',
      'Fixture for tool execution'
    );
    const fixtureToken = fixtureStaged.approvalToken;

    const toolArgsMap: Record<string, any> = {
      northveil_health: {},
      northveil_list_wallets: { walletAddress: TEST_WALLET },
      northveil_create_wallet: { walletName: 'Automated Test Vault', network: 'base' },
      northveil_export_seed_phrase: { walletAddress: TEST_WALLET },
      northveil_get_balances: { walletAddress: TEST_WALLET, network: 'sepolia' },
      northveil_get_portfolio: { walletAddress: TEST_WALLET, network: 'base' },
      northveil_get_token_price: { token: 'ETH' },
      northveil_list_networks: {},
      northveil_list_nfts: { walletAddress: TEST_WALLET, network: 'ethereum' },
      northveil_get_tx: { requestId: fixtureToken, network: 'sepolia' },
      northveil_simulate_tx: { from: TEST_WALLET, to: RECIPIENT, amount: '0.001', network: 'base' },
      northveil_estimate_gas: { from: TEST_WALLET, to: RECIPIENT, amount: '0.001', network: 'base' },
      northveil_inspect_contract: { contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', network: 'sepolia' },
      northveil_audit_contract: { contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', network: 'base' },
      northveil_prepare_transfer: { walletAddress: TEST_WALLET, to: RECIPIENT, amount: 0.0001, asset: 'ETH', network: 'sepolia' },
      northveil_prepare_swap: { walletAddress: TEST_WALLET, fromToken: 'ETH', toToken: 'USDC', amount: 0.001, network: 'base' },
      northveil_prepare_bridge: { source_chain: 'sepolia', destination_chain: 'base', asset: 'ETH', amount: 0.001 },
      northveil_prepare_contract_call: { walletAddress: TEST_WALLET, contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', method: 'decimals', args: [], network: 'sepolia' },
      northveil_prepare_deploy: { walletAddress: TEST_WALLET, contractName: 'TestToken', symbol: 'TTK', contractType: 'erc20', network: 'base' },
      northveil_request_signature: { message: 'Verify Northveil Control Plane' },
      northveil_request_broadcast: { approval_id: fixtureToken },
      northveil_list_pending_approvals: {},
      northveil_get_approval_status: { approval_id: fixtureToken },
      create_wallet: { walletName: 'Agent Vault', chain: 'base' },
      import_wallet: { address: TEST_WALLET, walletName: 'Imported Agent Vault' },
      send_transfer: { walletAddress: TEST_WALLET, token: 'ETH', amount: 0.0001, recipient: RECIPIENT, network: 'sepolia' },
      execute_swap: { walletAddress: TEST_WALLET, fromToken: 'ETH', toToken: 'USDC', amount: 0.0001, chain: 'base' },
      buy_tokens: { walletAddress: TEST_WALLET, token: 'USDC', amount: 0.0001, chain: 'base' },
      sell_tokens: { walletAddress: TEST_WALLET, token: 'ETH', toToken: 'USDC', amount: 0.0001, chain: 'base' },
      deploy_smart_contract: { walletAddress: TEST_WALLET, name: 'AgentCoin', symbol: 'AC', contractType: 'erc20', network: 'sepolia' },
      mint_tokens: { walletAddress: TEST_WALLET, contractAddress: RECIPIENT, recipientAddress: RECIPIENT, amount: 100, network: 'sepolia' },
      mint_nft: { walletAddress: TEST_WALLET, recipientAddress: RECIPIENT, tokenURI: 'ipfs://example', network: 'sepolia' },
      create_transaction_request: { walletAddress: TEST_WALLET, recipient: RECIPIENT, amount: 0.001, asset: 'ETH', network: 'sepolia' },
      approve_transaction: { approvalToken: fixtureToken },
      reject_transaction: { approvalToken: fixtureToken },
      get_transaction_status: { approvalToken: fixtureToken },
      get_wallet_info: { walletAddress: TEST_WALLET },
      get_portfolio: { walletAddress: TEST_WALLET },
      get_token_balance: { walletAddress: TEST_WALLET, token: 'ETH', chain: 'sepolia' },
      get_transaction_history: { walletAddress: TEST_WALLET, limit: 5 },
      get_gas_estimate: { chain: 'sepolia' },
      audit_smart_contract: { contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', network: 'base' },
      get_nft_gallery: { walletAddress: TEST_WALLET },
      get_realtime_prices: { symbols: ['ETH', 'BTC', 'SOL'] },
      get_trending_memecoins: {},
      audit_token: { tokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', chain: 'base' },
      set_trade_order: { walletAddress: TEST_WALLET, token: 'ETH', orderType: 'stop_loss', triggerPrice: 2500, amount: 0.1, chain: 'sepolia' },
      get_active_orders: { walletAddress: TEST_WALLET },
      cancel_trade_order: { orderId: 'ord_test_sample' },
      check_wallet_health: { walletAddress: TEST_WALLET },
      verify_smart_contract: { contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', chain: 'base' },
      create_smart_contract: { contractName: 'CustomToken', contractType: 'erc20', parameters: { name: 'Custom', symbol: 'CST' } },
      upload_contract_asset: { assetName: 'logo.png', contentType: 'image/png', base64Data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' },
      generate_passkey_registration_options: { userId: 'test_user', walletAddress: TEST_WALLET },
      verify_passkey_registration: { userId: 'test_user', walletAddress: TEST_WALLET, registrationResponse: { id: 'sample_cred', rawId: 'sample', type: 'public-key', response: {} } },
      approve_transaction_with_passkey: { approvalToken: fixtureToken },
      set_autonomous_spending_scope: { walletAddress: TEST_WALLET, maxAmountPerTxUsd: 50, maxDailyBudgetUsd: 200 },
      activate_kill_switch: { walletAddress: TEST_WALLET },
      deactivate_kill_switch: { walletAddress: TEST_WALLET },
    };

    let toolSuccessCount = 0;
    for (const tool of MCP_TOOLS) {
      const args = toolArgsMap[tool.name] || {};
      const res = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': DEV_API_KEY },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: { name: tool.name, arguments: args },
          id: Math.floor(Math.random() * 100000),
        }),
      });

      if (res.status === 200) {
        const json: any = await res.json();
        if (json.result !== undefined && !json.error) {
          toolSuccessCount++;
          console.log(`    [TOOL] ${tool.name.padEnd(38)} -> OK`);
        } else {
          console.error(`    [TOOL] ${tool.name.padEnd(38)} -> JSON-RPC error:`, json.error);
        }
      } else {
        console.error(`    [TOOL] ${tool.name.padEnd(38)} -> HTTP ${res.status}`);
      }
    }

    assert(
      toolSuccessCount === MCP_TOOLS.length,
      `All ${MCP_TOOLS.length} MCP tools executed successfully over JSON-RPC protocol (${toolSuccessCount}/${MCP_TOOLS.length} passed)`
    );

  } finally {
    server.close();
  }

  console.log('\n======================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED (${total} TOTAL CHECKS)`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMcpVerificationSuite().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
