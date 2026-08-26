import fetch from 'node-fetch';

const TARGET_PORT = process.env.TEST_PORT || process.env.PORT || '3001';
const SERVER_URL = `http://localhost:${TARGET_PORT}`;
const TEST_WALLET = '0x59148d6a9dff263a772b5a84280bc88530f38636';

async function rpcCall(method: string, params: any, id: number = 1, headers: Record<string, string> = {}) {
  const res = await fetch(`${SERVER_URL}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params,
    }),
  });
  return await res.json();
}

async function restCall(toolName: string, body: any, headers: Record<string, string> = {}) {
  const res = await fetch(`${SERVER_URL}/api/v1/tools/${toolName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
  return await res.json();
}

const sampleToolPayloads: Record<string, any> = {
  get_wallet_info: { walletAddress: TEST_WALLET },
  get_portfolio: { walletAddress: TEST_WALLET },
  get_token_balance: { walletAddress: TEST_WALLET, symbol: 'ETH' },
  get_transaction_history: { walletAddress: TEST_WALLET, limit: 5 },
  get_gas_estimate: { chain: 'sepolia' },
  get_realtime_prices: { symbols: ['ETH', 'BTC', 'SOL'] },
  get_trending_memecoins: { chain: 'ethereum', limit: 5 },
  check_wallet_health: { walletAddress: TEST_WALLET },
  scan_wallet_security: { walletAddress: TEST_WALLET },
  audit_token: { contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', chain: 'ethereum' },
  audit_smart_contract: { sourceCode: 'contract Simple { uint256 public count; }', contractName: 'Simple' },
  verify_smart_contract: { contractAddress: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E', chain: 'sepolia' },
  get_nft_gallery: { walletAddress: TEST_WALLET },
  get_active_orders: { walletAddress: TEST_WALLET },
  create_smart_contract: { prompt: 'Create an ERC20 token named Alpha with symbol ALP and total supply 1000000', network: 'sepolia' },
  deploy_smart_contract: { contractName: 'AlphaToken', network: 'sepolia' },
  mint_tokens: { contractName: 'AlphaToken', amount: 1000, recipient: TEST_WALLET },
  reserve_tokens: { contractName: 'AlphaToken', amount: 500 },
  send_transfer: { recipient: '0x59148d6a9dff263a772b5a84280bc88530f38636', amount: '0.0005', asset: 'ETH', network: 'sepolia' },
  create_transaction_request: { recipient: '0x59148d6a9dff263a772b5a84280bc88530f38636', amount: 0.0005, asset: 'ETH', network: 'sepolia' },
  execute_swap: { fromToken: 'ETH', toToken: 'USDC', amount: 0.01, network: 'sepolia' },
  buy_tokens: { token: 'PEPE', amountEth: 0.01, network: 'ethereum' },
  sell_tokens: { token: 'PEPE', amountTokens: 1000, network: 'ethereum' },
  trade_tokens: { fromToken: 'ETH', toToken: 'USDC', amount: 0.01, network: 'sepolia' },
  set_trade_order: { token: 'ETH', orderType: 'stop_loss', triggerPrice: 2500, amount: 0.1, chain: 'sepolia' },
  cancel_trade_order: { orderId: 'dummy-order-id' },
  set_autonomous_scope: { monthlyBudgetUsd: 500, maxPerTransactionUsd: 50, allowedTokens: ['ETH', 'USDC'] },
  set_autonomous_spending_scope: { monthlyBudgetUsd: 500, maxPerTransactionUsd: 50, allowedTokens: ['ETH', 'USDC'] },
  activate_kill_switch: { reason: 'Test safety trigger' },
  deactivate_kill_switch: { confirmationToken: 'SAFETY_RESTORE_2026' },
  generate_passkey_registration_options: { userId: 'test_user', userName: 'Test Agent' },
  verify_passkey_registration: { userId: 'test_user', registrationResponse: {} },
  approve_transaction_with_passkey: { requestId: 'dummy-req-id', assertionResponse: {} },
  approve_transaction: { approvalToken: 'dummy-token' },
  reject_transaction: { approvalToken: 'dummy-token' },
  get_transaction_status: { requestId: 'dummy-req-id' },
  upload_contract_asset: { assetName: 'logo.png', contentBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
  create_wallet: { userId: 'test_user', walletName: 'Test Vault' },
  import_wallet: { address: TEST_WALLET, walletName: 'Imported Vault' },
  search_flights: { origin: 'JFK', destination: 'LHR', date: '2026-09-01' },
  search_hotels: { city: 'Tokyo', checkIn: '2026-09-01', checkOut: '2026-09-05' },
  search_events_and_movies: { location: 'New York', category: 'concert' },
  get_booking_status: { bookingId: 'dummy-booking' },
  make_reservation: { bookingType: 'hotel', details: { name: 'Grand Hyatt Tokyo' } },
  list_reservations: { walletAddress: TEST_WALLET },
};

async function main() {
  console.log(`Connecting to Northveil Server on ${SERVER_URL}...`);
  let passed = 0;
  let failed = 0;
  const errors: { tool: string; error: string; response: any }[] = [];

  console.log('\n--- 1. Testing MCP initialize ---');
  const initRes = await rpcCall('initialize', {
    protocolVersion: '2024-11-05',
    clientInfo: { name: 'Northveil Test Suite', version: '1.0.0' },
  });
  console.log('Initialize response:', JSON.stringify(initRes));

  console.log('\n--- 2. Testing MCP tools/list ---');
  const listRes = await rpcCall('tools/list', {});
  const listedTools: string[] = listRes?.result?.tools?.map((t: any) => t.name) || [];
  console.log(`tools/list returned ${listedTools.length} tools`);

  console.log('\n--- 3. Testing Real Tool Invocations via JSON-RPC /mcp ---');
  const allToolsToTest = Object.keys(sampleToolPayloads);

  for (const toolName of allToolsToTest) {
    process.stdout.write(`Testing [${toolName}] ... `);
    const payload = sampleToolPayloads[toolName] || {};
    try {
      const res = await rpcCall('tools/call', {
        name: toolName,
        arguments: payload,
      }, 1, {
        'x-wallet-address': TEST_WALLET,
      });

      if (res.error) {
        console.log(`❌ RPC Error: ${res.error.message || JSON.stringify(res.error)}`);
        failed++;
        errors.push({ tool: toolName, error: res.error.message, response: res });
      } else if (!res.result) {
        console.log(`❌ No result returned:`, res);
        failed++;
        errors.push({ tool: toolName, error: 'No result returned', response: res });
      } else {
        const hasContent = res.result.content && res.result.content.length > 0;
        const textPreview = hasContent ? res.result.content[0].text.slice(0, 60).replace(/\n/g, ' ') : '';
        console.log(`✅ OK (${textPreview}...)`);
        passed++;
      }
    } catch (err: any) {
      console.log(`❌ Exception: ${err.message}`);
      failed++;
      errors.push({ tool: toolName, error: err.message, response: null });
    }
  }

  console.log(`\n========================================`);
  console.log(`TOTAL TOOLS TESTED: ${allToolsToTest.length}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`========================================\n`);

  if (errors.length > 0) {
    console.log('Failed tools summary:');
    errors.forEach(e => console.log(` - ${e.tool}: ${e.error}`));
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
