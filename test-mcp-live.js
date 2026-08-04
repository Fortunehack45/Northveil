import fetch from 'node-fetch';

(async () => {
  console.log("⚡ TESTING ETHERS REAL RPC BROADCAST & INTERACTIVE WALLET UI WIDGET...\n");

  // 1. Fetch HTML UI Widget
  const widgetRes = await fetch('http://localhost:3001/ui/widget?type=portfolio&wallet=0x71c8891575b50d22e032d847847c234a413d4cc8');
  console.log("1. GET /ui/widget Status:", widgetRes.status);
  console.log("   Content-Type:", widgetRes.headers.get('content-type'));

  // 2. Test send_transfer on real RPC with Ethers.js
  const txRes = await fetch('http://localhost:3001/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'nv_live_9f82a17b09c82415d8a9' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: "send_transfer", arguments: { token: "ETH", amount: 0.05, recipientAddress: "0x71c8891575b50d22e032d847847c234a413d4cc8" } },
      id: 1
    })
  });

  const data = await resText(txRes);
  console.log("\n2. Real Blockchain Transfer Execution Status:", txRes.status);
  console.log("   Execution Output:\n", data);
})();

async function resText(res) {
  const json = await res.json();
  return json.result?.content?.[0]?.text;
}
