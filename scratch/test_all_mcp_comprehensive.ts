process.env.NODE_ENV = 'test';
process.env.NORTHVEIL_WALLET_ADDRESS = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';

import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { ethers } from 'ethers';
import { app } from '../mcp-server/index.js';
import { MCP_TOOLS } from '../mcp-server/tools.js';
import {
  stageTransactionRequest,
  prepareTransactionRequest,
  approveAndExecuteWithPasskey,
  rejectTransactionRequest,
  activateKillSwitch,
  deactivateKillSwitch,
  isKillSwitchActive,
} from '../mcp-server/mpcControlPlaneService.js';

async function runComprehensiveMcpTestSuite() {
  console.log('======================================================================');
  console.log('🧪 NORTHVEIL MCP COMPREHENSIVE VERIFICATION & TEST SUITE');
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

  // Start HTTP Server on an ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`📡 Local Test Server running at ${baseUrl}\n`);

  try {
    // =========================================================================
    // SECTION 1: MCP CONNECTION FLOW (HTTP JSON-RPC, SSE, Auth Gating, Stdio)
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
    assert(initData.result?.protocolVersion === '2024-11-05', 'HTTP initialize protocolVersion matches 2024-11-05');
    assert(initData.result?.serverInfo?.name?.includes('Northveil') || false, `HTTP initialize returns valid serverInfo (${initData.result?.serverInfo?.name})`);

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
    assert(Array.isArray(toolsListData.result?.tools), 'HTTP tools/list returns tools array');
    assert(toolsListData.result?.tools?.length === 59, `HTTP tools/list returned all ${toolsListData.result?.tools?.length}/59 tools`);

    // 1.3 SSE Transport Handshake
    const sseRes = await fetch(`${baseUrl}/sse`, {
      headers: { Accept: 'text/event-stream' },
    });
    assert(sseRes.status === 200, 'GET /sse returns 200 for SSE transport');
    assert(sseRes.headers.get('content-type')?.includes('text/event-stream') || false, 'GET /sse returns text/event-stream header');

    // 1.4 Auth Gating & Security Isolation (Unauthenticated rejection)
    console.log('\n🔒 Testing Security & Auth Isolation...');
    const unauthRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'northveil_get_balances', arguments: {} },
        id: 10,
      }),
    });
    const unauthData: any = await unauthRes.json();
    const isErrorOrMissingWallet = unauthData.error || (unauthData.result && (unauthData.result.ok === false || unauthData.result.error === 'MISSING_WALLET_ADDRESS'));
    assert(!!isErrorOrMissingWallet, 'Unauthenticated call without wallet address is rejected with security error');

    // 1.5 Stdio Transport JSON-RPC Test
    console.log('\n💻 Testing Stdio Transport Spawn...');
    const stdioSuccess = await new Promise<boolean>((resolve) => {
      const serverProcess = spawn('npx', ['tsx', 'mcp-server/index.ts', '--stdio'], {
        cwd: path.resolve('.'),
        env: { ...process.env, NODE_ENV: 'test', MCP_TRANSPORT: 'stdio', NO_SERVER_LISTEN: 'true' },
        shell: true,
      });

      let buffer = '';
      const timer = setTimeout(() => {
        try { serverProcess.kill(); } catch {}
        resolve(false);
      }, 15000);

      const onData = (data: Buffer) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.id === 501 && parsed.result?.serverInfo) {
                clearTimeout(timer);
                serverProcess.stdout.off('data', onData);
                try { serverProcess.kill(); } catch {}
                return resolve(true);
              }
            } catch (e) {}
          }
        }
        buffer = lines[lines.length - 1];
      };

      serverProcess.stdout.on('data', onData);
      setTimeout(() => {
        serverProcess.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'TestRunner', version: '1.0' } },
          id: 501,
        }) + '\n');
      }, 500);
    });
    assert(stdioSuccess, 'Stdio transport successfully initialized via JSON-RPC protocol over stdin/stdout');

    // =========================================================================
    // SECTION 2: APPROVAL FLOW, PASSKEY, REJECTION & AUTONOMOUS SCOPE
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛡️ [SECTION 2] Testing Approval Flow, Staging, Passkeys & Safety Gates');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 2.1 Stage a transfer transaction
    const staged = await stageTransactionRequest(
      TEST_WALLET,
      RECIPIENT,
      0.005,
      'ETH',
      'sepolia',
      { to: RECIPIENT, value: ethers.parseEther('0.005').toString() },
      'tester',
      'Test Sepolia Transfer Staging'
    );
    assert(!!staged.approvalToken, 'stageTransactionRequest generated single-use approvalToken', staged);
    assert(staged.status === 'pending', 'staged transaction status is pending');
    const apprToken = staged.approvalToken;

    // 2.2 Check approval status via MCP tool (northveil_get_approval_status)
    const checkApprRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': DEV_API_KEY },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'northveil_get_approval_status',
          arguments: { approval_id: apprToken },
        },
        id: 20,
      }),
    });
    const checkApprData: any = await checkApprRes.json();
    assert(checkApprData.result?.status === 'pending' || checkApprData.result?.ok === true, 'northveil_get_approval_status confirmed pending status');

    // 2.3 Passkey / Enclave Approval Flow (approveAndExecuteWithPasskey)
    const signablePayload = await approveAndExecuteWithPasskey(apprToken);
    assert(signablePayload.status === 'SIGNATURE_REQUIRED', 'Passkey approval returned SIGNATURE_REQUIRED with signable transaction payload');
    assert(typeof signablePayload.nonce === 'number' || typeof signablePayload.nonce === 'bigint' || signablePayload.nonce !== undefined, 'Signable payload includes exact chain nonce');

    // 2.4 Test Staged Lookup Verification
    let stagedLookupWorks = false;
    const inspectStaged = await approveAndExecuteWithPasskey(apprToken);
    if (inspectStaged.status === 'SIGNATURE_REQUIRED' && inspectStaged.walletAddress?.toLowerCase() === TEST_WALLET.toLowerCase()) {
      stagedLookupWorks = true;
    }
    assert(stagedLookupWorks, 'Approval token validation correctly matched authorized vault address');

    // 2.5 Stage another transaction and test Rejection Flow
    const stagedForReject = await stageTransactionRequest(
      TEST_WALLET,
      RECIPIENT,
      0.01,
      'ETH',
      'sepolia',
      { to: RECIPIENT, value: ethers.parseEther('0.01').toString() },
      'tester',
      'Test Staging for Rejection'
    );
    const rejectToken = stagedForReject.approvalToken;
    const rejectRes = await rejectTransactionRequest(rejectToken, 'tester');
    assert(rejectRes.status?.toLowerCase() === 'rejected', 'rejectTransactionRequest successfully marked transaction as rejected');

    // 2.6 Autonomous Spending Policy & Limits via MCP tool
    console.log('\n🤖 Testing Autonomous Agent Spending Policy & Safety Gates...');
    const setScopeRes = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': DEV_API_KEY },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'set_autonomous_spending_scope',
          arguments: { walletAddress: TEST_WALLET, maxAmountPerTxUsd: 50, maxDailyBudgetUsd: 200 },
        },
        id: 25,
      }),
    });
    const setScopeData: any = await setScopeRes.json();
    assert(setScopeData.result?.success === true || setScopeData.result?.ok === true || setScopeData.result?.status === 'active', 'set_autonomous_spending_scope configured daily budget ($200) and max amount per tx ($50)');

    // 2.7 Emergency Kill Switch (Activate -> Verify Block -> Deactivate)
    console.log('\n🚨 Testing Emergency Lockout / Kill Switch...');
    await activateKillSwitch(TEST_WALLET, 'Emergency security lockdown', 'tester');
    const isKillActive = await isKillSwitchActive(TEST_WALLET);
    assert(isKillActive === true, 'activate_kill_switch successfully placed vault into frozen lockdown');

    // Attempting to prepare a transaction while kill switch is active must be blocked
    let blockedByKillSwitch = false;
    try {
      await prepareTransactionRequest({
        walletAddress: TEST_WALLET,
        recipient: RECIPIENT,
        amount: 0.0001,
        asset: 'ETH',
        network: 'sepolia',
      });
    } catch (err: any) {
      if (err.message?.includes('SECURITY_LOCK') || err.message?.includes('kill switch') || err.message?.includes('locked')) {
        blockedByKillSwitch = true;
      }
    }
    assert(blockedByKillSwitch, 'Emergency kill switch blocked transaction preparation attempt');

    // Deactivate kill switch
    await deactivateKillSwitch(TEST_WALLET, 'tester');
    const isKillActiveAfter = await isKillSwitchActive(TEST_WALLET);
    assert(isKillActiveAfter === false, 'deactivate_kill_switch successfully restored normal operational state');

    // =========================================================================
    // SECTION 3: TESTING ALL 59 REGISTERED MCP TOOLS
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🧰 [SECTION 3] Testing All ${MCP_TOOLS.length} MCP Tools Over Protocol`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Pre-create an approval token for tools requiring approval_id / approvalToken
    const toolTestStaged = await stageTransactionRequest(
      TEST_WALLET,
      RECIPIENT,
      0.001,
      'ETH',
      'sepolia',
      { to: RECIPIENT, value: ethers.parseEther('0.001').toString() },
      'tester',
      'Fixture for general tool execution'
    );
    const fixtureApprToken = toolTestStaged.approvalToken;

    // Map of realistic inputs for every single tool
    const sampleToolArgs: Record<string, any> = {
      northveil_health: {},
      northveil_list_wallets: { walletAddress: TEST_WALLET },
      northveil_create_wallet: { walletName: 'Automated Test Vault', network: 'base' },
      northveil_export_seed_phrase: { walletAddress: TEST_WALLET },
      northveil_get_balances: { walletAddress: TEST_WALLET, network: 'sepolia' },
      northveil_get_portfolio: { walletAddress: TEST_WALLET, network: 'base' },
      northveil_get_token_price: { token: 'ETH' },
      northveil_list_networks: {},
      northveil_list_nfts: { walletAddress: TEST_WALLET, network: 'ethereum' },
      northveil_get_tx: { requestId: fixtureApprToken, network: 'sepolia' },
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
      northveil_request_broadcast: { approval_id: fixtureApprToken },
      northveil_list_pending_approvals: {},
      northveil_get_approval_status: { approval_id: fixtureApprToken },
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
      approve_transaction: { approvalToken: fixtureApprToken },
      reject_transaction: { approvalToken: fixtureApprToken },
      get_transaction_status: { approvalToken: fixtureApprToken },
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
      approve_transaction_with_passkey: { approvalToken: fixtureApprToken },
      set_autonomous_spending_scope: { walletAddress: TEST_WALLET, maxAmountPerTxUsd: 50, maxDailyBudgetUsd: 200 },
      activate_kill_switch: { walletAddress: TEST_WALLET },
      deactivate_kill_switch: { walletAddress: TEST_WALLET },
    };

    let toolSuccessCount = 0;
    for (const tool of MCP_TOOLS) {
      const args = sampleToolArgs[tool.name] || {};
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
        // A valid tool call response has a result property with content or ok
        if (json.result !== undefined && !json.error) {
          toolSuccessCount++;
          console.log(`    [TOOL] ${tool.name.padEnd(38)} -> OK`);
        } else {
          console.warn(`    [TOOL] ${tool.name.padEnd(38)} -> Responded with JSON-RPC error:`, json.error);
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

runComprehensiveMcpTestSuite().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
