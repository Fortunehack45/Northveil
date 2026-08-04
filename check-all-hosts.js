import fetch from 'node-fetch';

async function checkAllHosts() {
  console.log("==================================================");
  console.log("🌐 NORTHVEIL LOCALHOST SERVICES STATUS CHECK");
  console.log("==================================================\n");

  // 1. Main App (Port 3000)
  try {
    const res1 = await fetch('http://localhost:3000');
    console.log(`1. Main Wallet App (http://localhost:3000):`);
    console.log(`   -> Status: ${res1.status} ${res1.statusText} 🟢 ACTIVE\n`);
  } catch (e) {
    console.log(`1. Main Wallet App (http://localhost:3000): 🔴 OFF (Error: ${e.message})\n`);
  }

  // 2. MCP Server & REST API (Port 3001)
  try {
    const res2 = await fetch('http://localhost:3001/health');
    const data2 = await res2.json();
    console.log(`2. MCP AI Server & REST API (http://localhost:3001):`);
    console.log(`   -> Health Status: ${data2.status} 🟢 ACTIVE`);
    console.log(`   -> Server: ${data2.server}`);
    console.log(`   -> Database Connected: ${data2.databaseConnected}\n`);
  } catch (e) {
    console.log(`2. MCP AI Server & REST API (http://localhost:3001): 🔴 OFF (Error: ${e.message})\n`);
  }

  // 3. Website & Docs Hub (Port 3002)
  try {
    const res3 = await fetch('http://localhost:3002');
    console.log(`3. Marketing & Documentation Website (http://localhost:3002):`);
    console.log(`   -> Status: ${res3.status} ${res3.statusText} 🟢 ACTIVE\n`);
  } catch (e) {
    console.log(`3. Marketing & Documentation Website (http://localhost:3002): 🔴 OFF (Error: ${e.message})\n`);
  }
}

checkAllHosts();
