import fetch from 'node-fetch';

(async () => {
  console.log("⚡ TESTING DEPLOY_SMART_CONTRACT TOOL VIA MCP...\n");

  const res = await fetch('http://localhost:3001/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'nv_live_9f82a17b09c82415d8a9' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { 
        name: "deploy_smart_contract", 
        arguments: { contractName: "NorthveilAlphaToken", network: "sepolia" } 
      },
      id: 1
    })
  });

  const data = await res.json();
  console.log("1. Status:", res.status);
  console.log("2. Deployed Contract Output:\n");
  console.log(data.result?.content?.[0]?.text);
})();
