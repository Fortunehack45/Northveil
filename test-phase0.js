import fetch from 'node-fetch';

async function runPhase0Tests() {
  console.log("==================================================");
  console.log("🔒 PHASE 0 SECURITY HARDENING VERIFICATION REPORT");
  console.log("==================================================\n");

  // Test 1: Unauthenticated request (no X-API-Key)
  try {
    const res1 = await fetch('http://localhost:3001/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 })
    });
    const data1 = await res1.json();
    console.log(`Test 1: Unauthenticated Request (No Key)`);
    console.log(`  -> HTTP Status Code: ${res1.status} (Expected: 401)`);
    console.log(`  -> Error Payload:`, JSON.stringify(data1.error || data1));
    console.log(`  -> Status: ${res1.status === 401 ? 'PASSED 🟢' : 'FAILED 🔴'}\n`);
  } catch (e) {
    console.error("Test 1 error:", e.message);
  }

  // Test 2: Invalid API Key
  try {
    const res2 = await fetch('http://localhost:3001/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'nv_invalid_hacker_key_999' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 2 })
    });
    const data2 = await res2.json();
    console.log(`Test 2: Invalid API Key Request`);
    console.log(`  -> HTTP Status Code: ${res2.status} (Expected: 401)`);
    console.log(`  -> Error Payload:`, JSON.stringify(data2.error || data2));
    console.log(`  -> Status: ${res2.status === 401 ? 'PASSED 🟢' : 'FAILED 🔴'}\n`);
  } catch (e) {
    console.error("Test 2 error:", e.message);
  }

  // Test 3: Authenticated Request with Valid Key
  try {
    const res3 = await fetch('http://localhost:3001/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'nv_live_9f82a17b09c82415d8a9' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 3 })
    });
    const data3 = await res3.json();
    console.log(`Test 3: Authenticated Request (Valid Key)`);
    console.log(`  -> HTTP Status Code: ${res3.status} (Expected: 200)`);
    console.log(`  -> Authenticated Wallet: ${data3.result?.authenticatedWallet}`);
    console.log(`  -> Permissions:`, data3.result?.permissions);
    console.log(`  -> Status: ${res3.status === 200 ? 'PASSED 🟢' : 'FAILED 🔴'}\n`);
  } catch (e) {
    console.error("Test 3 error:", e.message);
  }

  // Test 4: Health & Supabase Keep-Alive Endpoint
  try {
    const res4 = await fetch('http://localhost:3001/health');
    const data4 = await res4.json();
    console.log(`Test 4: System Health & Supabase Keep-Alive`);
    console.log(`  -> HTTP Status Code: ${res4.status} (Expected: 200)`);
    console.log(`  -> Database Connected: ${data4.databaseConnected}`);
    console.log(`  -> Status: ${res4.status === 200 && data4.databaseConnected ? 'PASSED 🟢' : 'FAILED 🔴'}\n`);
  } catch (e) {
    console.error("Test 4 error:", e.message);
  }
}

runPhase0Tests();
