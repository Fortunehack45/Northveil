import http from 'http';
import { app } from '../mcp-server/index.js';
import { MCP_TOOLS } from '../mcp-server/tools.js';

async function runExhaustiveToolAudit() {
  console.log(`\n======================================================`);
  console.log(`🛡️ NORTHVEIL MCP EXHAUSTIVE TOOL EXECUTION AUDIT`);
  console.log(`Total Tools in Registry: ${MCP_TOOLS.length}`);
  console.log(`======================================================\n`);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const testWallet = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const testRecipient = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  let passed = 0;
  let failed = 0;
  const errors: { name: string; error: string }[] = [];

  // Define tailored test arguments for every tool
  const toolArgs: Record<string, any> = {
    // Vault / Wallet Management
    create_wallet: { walletName: 'Audit Test Vault', chain: 'sepolia' },
    import_wallet: { address: testWallet, walletName: 'Imported Audit Vault' },
    list_wallets: {},
    get_wallets: {},
    get_balances: { walletAddress: testWallet, chain: 'sepolia' },
    get_portfolio: { walletAddress: testWallet },
    get_wallet_info: { walletAddress: testWallet },
    get_wallet_balance: { walletAddress: testWallet, chain: 'sepolia' },
    get_token_balance: { walletAddress: testWallet, token: 'ETH', chain: 'sepolia' },
    get_transaction_history: { walletAddress: testWallet, limit: 5 },
    check_wallet_health: { walletAddress: testWallet },
    scan_wallet_security: { walletAddress: testWallet },
    get_nft_gallery: { walletAddress: testWallet },
    list_nfts: { walletAddress: testWallet },

    // Market & Intelligence
    get_realtime_prices: { tokens: ['ETH', 'BTC', 'SOL'] },
    get_trending_memecoins: {},
    get_gas_estimate: { chain: 'sepolia' },
    estimate_swap_output: { fromToken: 'ETH', toToken: 'USDC', amount: 0.1, chain: 'sepolia' },
    search_uniswap_pools: { tokenA: 'ETH', tokenB: 'USDC', chain: 'sepolia' },

    // Security & Simulation
    audit_smart_contract: { sourceCode: 'pragma solidity ^0.8.20; contract Test { uint public x; }' },
    audit_token: { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', chain: 'ethereum' },
    inspect_contract: { contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
    audit_contract_source: { sourceCode: 'pragma solidity ^0.8.20; contract Safe { address owner; }' },
    simulate_transaction: { from: testWallet, to: testRecipient, value: '0.001', network: 'sepolia' },

    // Smart Contracts
    create_smart_contract: { name: 'AuditToken', symbol: 'AUDT', totalSupply: 1000000, contractType: 'erc20' },
    deploy_smart_contract: { name: 'AuditNFT', symbol: 'ANFT', contractType: 'erc721', network: 'sepolia' },
    prepare_deploy: { name: 'AuditDrop', symbol: 'DROP', contractType: 'erc20', network: 'sepolia' },
    mint_tokens: { contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', recipientAddress: testRecipient, amount: 100, network: 'sepolia' },
    reserve_tokens: { contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', recipientAddress: testRecipient, amount: 50, unlockDate: '2026-12-31T00:00:00Z', network: 'sepolia' },
    upload_contract_asset: { fileBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', contractSymbol: 'AUDT' },
    verify_smart_contract: { contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', contractName: 'UniswapToken', sourceCode: 'contract UniswapToken {}', network: 'sepolia' },

    // Operations / Trades
    set_trade_order: { walletAddress: testWallet, token: 'ETH', targetPriceUsd: 4000, amount: 0.1, orderType: 'LIMIT_BUY', currentPriceUsd: 3450 },
    get_active_orders: { walletAddress: testWallet },
    cancel_trade_order: { orderId: 'test_order_id' },

    // Transfers & Swaps
    prepare_transfer: { token: 'ETH', amount: 0.001, recipient: testRecipient, network: 'sepolia', walletAddress: testWallet },
    prepare_swap: { fromToken: 'ETH', toToken: 'USDC', amount: 0.01, chain: 'sepolia', walletAddress: testWallet },
    prepare_contract_call: { contractAddress: testRecipient, method: 'transfer(address,uint256)', network: 'sepolia', walletAddress: testWallet },
    request_payment_capability: { walletAddress: testWallet, maxAmountUsd: 50, merchant: 'AIRLINE' },
    create_transaction_request: { walletAddress: testWallet, recipient: testRecipient, amount: 0.001, asset: 'ETH', network: 'sepolia' },
    get_transaction_status: { requestId: 'req_test_status_query' },
    get_tx_status: { requestId: 'req_test_status_query' },

    // Policy & Controls
    set_autonomous_spending_scope: { walletAddress: testWallet, maxAmountPerTxUsd: 50, maxDailyBudgetUsd: 200, allowedChains: [11155111] },
    set_autonomous_scope: { walletAddress: testWallet, maxAmountPerTxUsd: 25, maxDailyBudgetUsd: 100 },
    activate_kill_switch: { walletAddress: testWallet, reason: 'Security Audit Trigger' },
    deactivate_kill_switch: { walletAddress: testWallet },

    // Passkeys & Auth
    generate_passkey_registration_options: { userId: 'audit_user', walletAddress: testWallet },

    // Cross-Chain Intention
    stage_cross_chain_intent: { fromChain: 'ethereum', toChain: 'base', asset: 'ETH', amount: 0.05, recipient: testRecipient, walletAddress: testWallet },
    execute_cross_chain_intent: { intentId: 'intent_test_123', walletAddress: testWallet },

    // Commerce & Real-World Utility
    search_flights: { origin: 'LHR', destination: 'JFK', departureDate: '2026-09-15' },
    book_flight: { flightNumber: 'BA178', origin: 'LHR', destination: 'JFK', departureDate: '2026-09-15', passengerName: 'Alex Thorne', priceAmount: 0.15, walletAddress: testWallet },
    search_hotels: { city: 'Tokyo', checkInDate: '2026-10-01', nights: 3 },
    book_hotel: { hotelName: 'Park Hyatt Tokyo', city: 'Tokyo', checkInDate: '2026-10-01', nights: 3, guestName: 'Alex Thorne', priceAmount: 0.25, walletAddress: testWallet },
    search_events_and_movies: { query: 'Inception' },
    book_entertainment_ticket: { eventTitle: 'Devcon 8', eventDate: '2026-11-12', seatDetails: 'VIP Pass', priceAmount: 0.2, attendeeName: 'Alex Thorne', walletAddress: testWallet },
    make_reservation: { category: 'flight', title: 'Flight to JFK', bookingDate: '2026-09-15', priceAmount: 0.15, currency: 'ETH', walletAddress: testWallet },
    list_reservations: { walletAddress: testWallet },
    verify_ticket_confirmation: { ticketId: 'res_audit_ticket_123' },
  };

  try {
    for (const tool of MCP_TOOLS) {
      const name = tool.name;
      const args = toolArgs[name] || {};

      try {
        const res = await fetch(`${baseUrl}/mcp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'nv_live_default_northveil_key',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Math.floor(Math.random() * 100000),
            method: 'tools/call',
            params: { name, arguments: args },
          }),
        });

        const data: any = await res.json();

        if (data.error && data.error.code !== -32002) {
          throw new Error(`RPC Error [${data.error.code}]: ${data.error.message}`);
        }

        console.log(`  ✅ [PASS] ${name.padEnd(38)} => OK`);
        passed++;
      } catch (err: any) {
        console.error(`  ❌ [FAIL] ${name.padEnd(38)} => ${err.message}`);
        failed++;
        errors.push({ name, error: err.message });
      }
    }

    console.log(`\n======================================================`);
    console.log(`AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED (${((passed / MCP_TOOLS.length) * 100).toFixed(1)}% Success)`);
    console.log(`======================================================\n`);

    if (errors.length > 0) {
      console.log('Errors encountered:');
      for (const e of errors) {
        console.log(`- ${e.name}: ${e.error}`);
      }
    }
  } finally {
    server.close();
  }
}

runExhaustiveToolAudit().catch((err) => {
  console.error('Fatal error during tool audit:', err);
  process.exit(1);
});
