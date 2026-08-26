process.env.NODE_ENV = 'test';

async function main() {
  const { default: app } = await import('../mcp-server/index.js');
  console.log('🧪 Testing OAuth Authorization endpoint scenarios...');

  const server = app.listen(0, async () => {
    const addr: any = server.address();
    const port = addr.port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // Test 1: Browser navigation (Accept: text/html) -> Should return 200 HTML Consent Page
      const htmlRes = await fetch(`${baseUrl}/oauth/authorize?client_id=claude_desktop&redirect_uri=https://example.com/cb&state=s1`, {
        headers: { 'Accept': 'text/html' }
      });
      const htmlBody = await htmlRes.text();
      if (htmlRes.status === 200 && htmlBody.includes('Connect AI Agent') && htmlBody.includes('Vault Wallet Address')) {
        console.log('  ✅ [PASS] Browser GET /oauth/authorize renders interactive HTML Consent Page (200 OK)');
      } else {
        throw new Error(`Test 1 Failed: Status ${htmlRes.status}, Body: ${htmlBody.slice(0, 100)}`);
      }

      // Test 2: Passing wallet_address parameter directly with redirect_uri -> Should redirect with authorization code
      const redirectRes = await fetch(`${baseUrl}/oauth/authorize?client_id=claude&wallet_address=0x71C56830EC737A4Cacf8F485458Cc2040f394073&redirect_uri=https://example.com/cb&state=state123`, {
        redirect: 'manual'
      });
      const location = redirectRes.headers.get('location');
      if (redirectRes.status === 302 && location && location.includes('code=nv_code_') && location.includes('state=state123')) {
        console.log('  ✅ [PASS] Direct authorize with wallet_address returns 302 redirect with valid authorization code');
      } else {
        throw new Error(`Test 2 Failed: Status ${redirectRes.status}, Location: ${location}`);
      }

      // Test 3: Programmatic JSON authorize with wallet_address
      const jsonRes = await fetch(`${baseUrl}/oauth/authorize?client_id=cursor&wallet_address=0x71C56830EC737A4Cacf8F485458Cc2040f394073&state=state456`);
      const jsonData: any = await jsonRes.json();
      if (jsonRes.status === 200 && jsonData.status === 'AUTHORIZED' && jsonData.code && jsonData.code.startsWith('nv_code_')) {
        console.log('  ✅ [PASS] Programmatic JSON authorize returns code and state');
      } else {
        throw new Error(`Test 3 Failed: ${JSON.stringify(jsonData)}`);
      }

      // Test 4: Token exchange with authorization code
      const tokenRes = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: 'cursor',
          code: jsonData.code
        })
      });
      const tokenData: any = await tokenRes.json();
      if (tokenRes.status === 200 && tokenData.access_token && tokenData.access_token.startsWith('nv_oauth_')) {
        console.log('  ✅ [PASS] POST /oauth/token exchanges authorization code for bearer token');
      } else {
        throw new Error(`Test 4 Failed: ${JSON.stringify(tokenData)}`);
      }

      console.log('\n🎉 All OAuth Authorization Scenarios Passed Successfully (4/4)!');
    } catch (err) {
      console.error('❌ Test error:', err);
      process.exitCode = 1;
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

main();
