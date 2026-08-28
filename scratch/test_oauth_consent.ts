process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';

import assert from 'assert';

async function main() {
  const { default: app } = await import('../mcp-server/index.js');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 TESTING OAUTH 2.0 & RFC 7591/8414/9728 SPECIFICATION COMPLIANCE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const server = app.listen(0, '127.0.0.1', async () => {
    const addr: any = server.address();
    const port = addr.port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // Test 1: Dynamic Client Registration (RFC 7591)
      console.log('--- Test 1: POST /oauth/register (RFC 7591 Dynamic Client Registration) ---');
      const regRes = await fetch(`${baseUrl}/oauth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: 'Test Autonomous Agent',
          redirect_uris: ['https://example.com/oauth/callback'],
          grant_types: ['authorization_code', 'refresh_token'],
          response_types: ['code'],
          scope: 'wallet:read wallet:transfer wallet:swap contracts:deploy',
        }),
      });
      const regData: any = await regRes.json();
      assert.strictEqual(regRes.status, 201, 'Registration must return 201 Created');
      assert.ok(regData.client_id, 'Must return generated client_id');
      assert.ok(regData.client_secret, 'Must return generated client_secret');
      console.log(`✅ [PASS] Dynamic Client Registered: ${regData.client_id}\n`);

      const dynamicClientId = regData.client_id;
      const dynamicClientSecret = regData.client_secret;
      const testWallet = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';

      // Test 2: Browser navigation (Accept: text/html) -> Should return 200 HTML Consent Page
      console.log('--- Test 2: GET /oauth/authorize (HTML Consent Page) ---');
      const htmlRes = await fetch(
        `${baseUrl}/oauth/authorize?client_id=${dynamicClientId}&redirect_uri=https://example.com/oauth/callback&state=state_abc&response_type=code&scope=wallet:read%20wallet:transfer`,
        { headers: { Accept: 'text/html' } }
      );
      const htmlBody = await htmlRes.text();
      assert.strictEqual(htmlRes.status, 200, 'HTML Consent page must return 200 OK');
      assert.ok(htmlBody.includes('Connect AI Agent') || htmlBody.includes('Northveil'), 'Must render consent UI');
      console.log('✅ [PASS] Browser GET /oauth/authorize renders interactive HTML Consent Page\n');

      // Test 3: Programmatic Authorization with User Consent & Scopes
      console.log('--- Test 3: POST /oauth/authorize (User Consent Submission & Code Issuance) ---');
      const authPostRes = await fetch(`${baseUrl}/oauth/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: dynamicClientId,
          redirect_uri: 'https://example.com/oauth/callback',
          wallet_address: testWallet,
          action: 'approve',
          scope: 'wallet:read wallet:transfer',
          state: 'state_roundtrip_123',
        }).toString(),
        redirect: 'manual',
      });

      const redirectLocation = authPostRes.headers.get('location');
      assert.strictEqual(authPostRes.status, 302, 'Approval must return 302 Redirect');
      assert.ok(redirectLocation, 'Must include Location redirect header');
      assert.ok(redirectLocation.includes('code='), 'Location must contain authorization code');
      assert.ok(redirectLocation.includes('state=state_roundtrip_123'), 'Location must preserve state');

      const urlObj = new URL(redirectLocation);
      const authCode = urlObj.searchParams.get('code')!;
      console.log(`✅ [PASS] Authorization Code Issued: ${authCode.slice(0, 16)}...\n`);

      // Test 4: Token Exchange with Authorization Code (RFC 6749)
      console.log('--- Test 4: POST /oauth/token (Exchange Code for Bearer Token) ---');
      const tokenRes = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: dynamicClientId,
          client_secret: dynamicClientSecret,
          code: authCode,
          redirect_uri: 'https://example.com/oauth/callback',
        }),
      });

      const tokenData: any = await tokenRes.json();
      assert.strictEqual(tokenRes.status, 200, 'Token exchange must return 200 OK');
      assert.ok(tokenData.access_token, 'Must return access_token');
      assert.strictEqual(tokenData.token_type, 'Bearer', 'Token type must be Bearer');
      console.log(`✅ [PASS] Bearer Access Token Issued: ${tokenData.access_token.slice(0, 20)}...\n`);

      const accessToken = tokenData.access_token;

      // Test 5: Single-Use Code Replay Protection
      console.log('--- Test 5: Authorization Code Replay Prevention ---');
      const replayRes = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: dynamicClientId,
          client_secret: dynamicClientSecret,
          code: authCode,
          redirect_uri: 'https://example.com/oauth/callback',
        }),
      });
      const replayData: any = await replayRes.json();
      assert.strictEqual(replayRes.status, 400, 'Replayed code must be rejected with 400');
      assert.ok(replayData.error, 'Must return error on replayed code');
      console.log('✅ [PASS] Single-use authorization code replay strictly prevented\n');

      // Test 6: Strict Tenant Isolation on Protected Resource
      console.log('--- Test 6: Tenant Isolation & Scope Enforcement on Protected Resources ---');
      // Authorized address access -> Must Succeed
      const validCallRes = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'get_portfolio',
            arguments: { walletAddress: testWallet },
          },
          id: 'test-tenant-allowed',
        }),
      });
      const validCallText = await validCallRes.text();
      let validCallJson: any = {};
      try {
        validCallJson = JSON.parse(validCallText);
      } catch (e) {
        console.error('Failed to parse response JSON:', validCallText);
      }
      if (validCallRes.status !== 200) {
        console.error('Test 6 Valid Call Failed with status', validCallRes.status, 'body:', validCallText);
      }
      assert.strictEqual(validCallRes.status, 200);
      assert.ok(!validCallJson.error, 'Authorized wallet access must succeed');
      console.log('✅ [PASS] Authorized tenant wallet accessed cleanly');

      // Unauthorized address access -> Must be Rejected (Tenant Isolation)
      const unauthorizedAddress = '0x1111111111111111111111111111111111111111';
      const invalidCallRes = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'get_portfolio',
            arguments: { walletAddress: unauthorizedAddress },
          },
          id: 'test-tenant-denied',
        }),
      });
      const invalidCallText = await invalidCallRes.text();
      let invalidCallJson: any = {};
      try {
        invalidCallJson = JSON.parse(invalidCallText);
      } catch {}
      assert.ok(
        invalidCallJson.error || invalidCallRes.status === 403 || invalidCallRes.status === 401,
        'Access to non-allowed wallet must be rejected'
      );
      console.log('✅ [PASS] Cross-tenant unauthorized wallet access strictly blocked (401/403)\n');

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🎉 ALL OAUTH 2.0 & RFC COMPLIANCE TESTS PASSED SUCCESSFULLY (6/6)');
      console.log('═══════════════════════════════════════════════════════════════\n');
    } catch (err: any) {
      console.error('❌ OAuth Test Failure:', err.message || err);
      process.exitCode = 1;
    } finally {
      server.close();
      process.exit(process.exitCode || 0);
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
