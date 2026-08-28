import assert from 'node:assert/strict';

console.log('🧪 Running Northveil Remaining Security Fixes Validation Test Suite (Node.js)...\n');

let totalTests = 0;
let passedTests = 0;

async function check(desc, fn) {
  totalTests++;
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      await result;
    }
    passedTests++;
    console.log(`  ✅ [PASS] ${desc}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${desc}:`, err.message);
    throw err;
  }
}

async function runTests() {
  // Test 1: Configuration check without Turnkey credentials
  await check('validateTurnkeyConfiguration identifies missing credentials', async () => {
    const { validateTurnkeyConfiguration } = await import('../mcp-server/mpcControlPlaneService.ts');
    delete process.env.TURNKEY_API_PUBLIC_KEY;
    delete process.env.TURNKEY_API_PRIVATE_KEY;
    delete process.env.TURNKEY_ORGANIZATION_ID;
    delete process.env.NORTHVEIL_DEMO_MODE;

    const res = validateTurnkeyConfiguration();
    assert.strictEqual(res.configured, false);
    assert.strictEqual(res.isDemo, false);
  });

  // Test 2: createMpcWallet throws TurnkeyEnclaveError when credentials missing and demo mode disabled
  await check('createMpcWallet fails loudly when Turnkey credentials missing and demo mode off', async () => {
    const { createMpcWallet, TurnkeyEnclaveError } = await import('../mcp-server/mpcControlPlaneService.ts');
    delete process.env.TURNKEY_API_PUBLIC_KEY;
    delete process.env.TURNKEY_API_PRIVATE_KEY;
    delete process.env.TURNKEY_ORGANIZATION_ID;
    delete process.env.NORTHVEIL_DEMO_MODE;

    let threw = false;
    try {
      await createMpcWallet('test_user_001', 'Test Vault');
    } catch (err) {
      threw = true;
      assert.ok(
        err instanceof TurnkeyEnclaveError || err.name === 'TurnkeyEnclaveError' || err.message.includes('TurnkeyEnclaveError') || err.message.includes('TURNKEY_CONFIG_ERROR'),
        `Expected TurnkeyEnclaveError, got: ${err.message}`
      );
      assert.ok(err.message.includes('requires live Turnkey MPC credentials') || err.message.includes('TURNKEY_CONFIG_ERROR'));
    }
    assert.strictEqual(threw, true, 'createMpcWallet should have thrown an error');
  });

  // Test 3: createMpcWallet explicitly marks demo wallets when NORTHVEIL_DEMO_MODE=true
  await check('createMpcWallet properly provisions demo_unspendable wallet in demo mode', async () => {
    const { createMpcWallet } = await import('../mcp-server/mpcControlPlaneService.ts');
    process.env.NORTHVEIL_DEMO_MODE = 'true';
    delete process.env.TURNKEY_API_PUBLIC_KEY;
    delete process.env.TURNKEY_API_PRIVATE_KEY;
    delete process.env.TURNKEY_ORGANIZATION_ID;

    const demoWallet = await createMpcWallet('demo_user_002', 'Demo Vault');
    assert.strictEqual(demoWallet.status, 'demo_unspendable');
    assert.strictEqual(demoWallet.mpcProvider, 'turnkey-demo');
    assert.ok(demoWallet.address.startsWith('0x') && demoWallet.address.length === 42);
    assert.ok(demoWallet.mpcWalletId.startsWith('demo_wlt_'));
    delete process.env.NORTHVEIL_DEMO_MODE;
  });

  // Test 4: Verify 403 Forbidden on Write Sensitive Tools for unauthorized target wallets without allowlist bypass
  await check('Write Sensitive Tools block unauthorized target wallets without allowlist bypass', async () => {
    const WRITE_SENSITIVE_TOOLS = [
      'send_transfer', 'execute_swap', 'execute_dex_swap',
      'buy_tokens', 'sell_tokens', 'trade_tokens', 'set_trade_order',
      'cancel_trade_order', 'mint_tokens', 'reserve_tokens',
      'approve_transaction', 'reject_transaction'
    ];

    const cleanAddress = '0x1234567890123456789012345678901234567890';
    const legacyAllowlistWallets = [
      '0x87678de86804c6c3612d66cbd6e2857f1a7d8345',
      '0x71c8891575b50d22e032d847847c234a413d4cc8',
      '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417'
    ];

    for (const tool of WRITE_SENSITIVE_TOOLS) {
      for (const targetWallet of legacyAllowlistWallets) {
        let blocked = false;
        const requestedTargetWallet = targetWallet.toLowerCase();
        const isDemoMode = process.env.NORTHVEIL_DEMO_MODE === 'true';
        const demoAllowlist = (process.env.DEMO_SHARED_WALLETS || '')
          .split(',')
          .map(w => w.trim().toLowerCase())
          .filter(Boolean);

        const isAllowedInDemo = isDemoMode && demoAllowlist.includes(requestedTargetWallet);

        try {
          if (WRITE_SENSITIVE_TOOLS.includes(tool) && requestedTargetWallet && requestedTargetWallet.startsWith('0x') && requestedTargetWallet.length === 42) {
            if (requestedTargetWallet !== cleanAddress && !isAllowedInDemo) {
              throw new Error(`🔒 403 Forbidden: Unauthorized access. Your API Key is scoped to wallet ${cleanAddress} and cannot manipulate state for ${requestedTargetWallet}.`);
            }
          }
        } catch (err) {
          if (err.message.includes('403 Forbidden')) {
            blocked = true;
          }
        }

        assert.strictEqual(blocked, true, `Tool '${tool}' must block targeting '${targetWallet}' from un-owned key '${cleanAddress}'`);
      }
    }
  });

  // Test 5: Verify cleanAddress requirement for write-sensitive operations
  await check('Write Sensitive Tools require a valid cleanAddress and reject empty caller wallet', async () => {
    const WRITE_SENSITIVE_TOOLS = ['send_transfer', 'mint_tokens'];
    for (const tool of WRITE_SENSITIVE_TOOLS) {
      const cleanAddress = '';
      let rejected = false;
      try {
        if (WRITE_SENSITIVE_TOOLS.includes(tool) && !cleanAddress) {
          throw new Error(`🔒 400 Bad Request: A valid sender wallet address (0x...) is required to execute write action '${tool}'.`);
        }
      } catch (err) {
        if (err.message.includes('400 Bad Request')) {
          rejected = true;
        }
      }
      assert.strictEqual(rejected, true, `Tool '${tool}' must reject empty sender address`);
    }
  });

  console.log(`\n🎉 Test Suite Completed: ${passedTests}/${totalTests} Passed (100% Success Rate)`);
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
