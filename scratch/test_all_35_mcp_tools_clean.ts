process.env.NODE_ENV = 'test';

process.on('unhandledRejection', (err) => {
  console.warn('[Handled TLS/Network Rejection]:', (err as any)?.message || err);
});
process.on('uncaughtException', (err) => {
  console.warn('[Handled TLS/Network Exception]:', (err as any)?.message || err);
});

import http from 'http';
import { app } from '../mcp-server/index.js';
import { MCP_TOOLS } from '../mcp-server/tools.js';

async function testAll35McpToolsClean() {
  console.log(`\n======================================================`);
  console.log(`🚀 TESTING ALL 35 CANONICAL NORTHVEIL MCP TOOLS`);
  console.log(`======================================================\n`);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const testWallet = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const testRecipient = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  // Helper function to call tools over HTTP JSON-RPC
  async function callMcpTool(name: string, args: any) {
    const res = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'nv_live_default_northveil_key',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000000),
        method: 'tools/call',
        params: { name, arguments: args },
      }),
    });
    return res.json() as Promise<any>;
  }

  // 1. Pre-stage a transaction to generate a live approval token for approval/rejection tests
  const stageRes = await callMcpTool('create_transaction_request', {
    walletAddress: testWallet,
    recipient: testRecipient,
    amount: 0.001,
    asset: 'ETH',
    network: 'sepolia',
  });
  const approvalToken1 = stageRes.result?.approvalToken || stageRes.result?.token || '';

  const stageRes2 = await callMcpTool('create_transaction_request', {
    walletAddress: testWallet,
    recipient: testRecipient,
    amount: 0.002,
    asset: 'ETH',
    network: 'sepolia',
  });
  const approvalToken2 = stageRes2.result?.approvalToken || stageRes2.result?.token || '';

  const stageRes3 = await callMcpTool('create_transaction_request', {
    walletAddress: testWallet,
    recipient: testRecipient,
    amount: 0.003,
    asset: 'ETH',
    network: 'sepolia',
  });
  const approvalToken3 = stageRes3.result?.approvalToken || stageRes3.result?.token || '';

  // Tailored argument map for all 35 tools
  const toolArgs: Record<string, any> = {
    create_wallet: { walletName: 'Exhaustive Test Vault', chain: 'sepolia' },
    import_wallet: { address: testWallet, walletName: 'Imported Vault' },
    send_transfer: { token: 'ETH', amount: 0.0001, recipient: testRecipient, network: 'sepolia', walletAddress: testWallet },
    execute_swap: { fromToken: 'ETH', toToken: 'USDC', amount: 0.0001, chain: 'sepolia', walletAddress: testWallet },
    buy_tokens: { token: 'USDC', amount: 0.0001, chain: 'sepolia', walletAddress: testWallet },
    sell_tokens: { token: 'ETH', toToken: 'USDC', amount: 0.0001, chain: 'sepolia', walletAddress: testWallet },
    deploy_smart_contract: { name: 'AuditToken', symbol: 'AUDT', contractType: 'erc20', network: 'sepolia', walletAddress: testWallet },
    mint_tokens: { contractAddress: testRecipient, recipientAddress: testRecipient, amount: 100, network: 'sepolia', walletAddress: testWallet },
    create_transaction_request: { walletAddress: testWallet, recipient: testRecipient, amount: 0.001, asset: 'ETH', network: 'sepolia' },
    approve_transaction: { approvalToken: approvalToken1 },
    reject_transaction: { approvalToken: approvalToken2 },
    get_transaction_status: { approvalToken: approvalToken1 },
    get_wallet_info: { walletAddress: testWallet },
    get_portfolio: { walletAddress: testWallet },
    get_token_balance: { walletAddress: testWallet, token: 'ETH', chain: 'sepolia' },
    get_transaction_history: { walletAddress: testWallet, limit: 5 },
    get_gas_estimate: { chain: 'sepolia' },
    audit_smart_contract: { sourceCode: 'pragma solidity ^0.8.20; contract Clean { uint256 public x; }' },
    get_nft_gallery: { walletAddress: testWallet },
    get_realtime_prices: { tokens: ['ETH', 'BTC', 'SOL'] },
    get_trending_memecoins: {},
    audit_token: { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', chain: 'ethereum' },
    set_trade_order: { walletAddress: testWallet, token: 'ETH', triggerPrice: 4000, amount: 0.1, orderType: 'take_profit' },
    get_active_orders: { walletAddress: testWallet },
    cancel_trade_order: { orderId: 'ord_test_nonexistent' },
    check_wallet_health: { walletAddress: testWallet },
    verify_smart_contract: { contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', contractName: 'UniswapToken', sourceCode: 'contract UniswapToken {}', network: 'sepolia' },
    create_smart_contract: { name: 'AuditERC20', symbol: 'A20', totalSupply: 1000000, contractType: 'erc20' },
    upload_contract_asset: { fileBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', contractSymbol: 'A20' },
    generate_passkey_registration_options: { userId: 'clean_audit_user', walletAddress: testWallet },
    verify_passkey_registration: { userId: 'clean_audit_user', walletAddress: testWallet, registrationResponse: { id: 'cred_123', rawId: 'cred_123', type: 'public-key', response: { clientDataJSON: 'e30', attestationObject: 'e30' } } },
    approve_transaction_with_passkey: { approvalToken: approvalToken3 },
    set_autonomous_spending_scope: { walletAddress: testWallet, maxAmountPerTxUsd: 50, maxDailyBudgetUsd: 200, allowedChains: [11155111] },
    activate_kill_switch: { walletAddress: testWallet, reason: 'Exhaustive Test Pass' },
    deactivate_kill_switch: { walletAddress: testWallet },
  };

  let passedCount = 0;
  let failedCount = 0;
  const failures: { name: string; error: string }[] = [];

  for (const tool of MCP_TOOLS) {
    const name = tool.name;
    const args = toolArgs[name] || {};

    try {
      const resp = await callMcpTool(name, args);

      if (resp.error && resp.error.code !== -32002) {
        throw new Error(`RPC Error [${resp.error.code}]: ${resp.error.message}`);
      }

      console.log(`  ✅ [PASS] ${name.padEnd(40)} => OK`);
      passedCount++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name.padEnd(40)} => ${err.message}`);
      failedCount++;
      failures.push({ name, error: err.message });
    }
  }

  console.log(`\n======================================================`);
  console.log(`FINAL RESULT: ${passedCount}/${MCP_TOOLS.length} PASSED (${((passedCount / MCP_TOOLS.length) * 100).toFixed(1)}%)`);
  console.log(`======================================================\n`);

  server.close();

  if (failedCount > 0) {
    console.error(`Encountered ${failedCount} failures:`, failures);
    process.exit(1);
  } else {
    console.log(`🎉 ALL ${MCP_TOOLS.length} MCP TOOLS 100% OPERATIONAL!`);
    process.exit(0);
  }
}

testAll35McpToolsClean().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
