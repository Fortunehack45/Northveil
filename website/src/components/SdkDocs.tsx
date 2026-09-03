import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, Code, Layers, ShieldCheck, Zap } from 'lucide-react';

export const SdkDocs: React.FC = () => {
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  const tsCode = `import { NorthveilSDK } from '@northveil/sdk';

// 1. Initialize Northveil SDK Instance
const sdk = new NorthveilSDK({
  apiKey: "YOUR_NORTHVEIL_CLIENT_KEY",
  walletAddress: "0xYOUR_WALLET_ADDRESS",
  baseUrl: "https://mcp.northveil.xyz"
});

// 2. Check System Health & RPC Connection
const health = await sdk.getHealth();
console.log("Status:", health.status);

// 3. Fetch Live Multi-Chain Portfolio Holdings
const portfolio = await sdk.getPortfolio();
console.log("Total Net Worth ($):", portfolio.netWorthUsd);
console.log("Assets Holdings:", portfolio.assets);

// 4. Deploy Solidity Smart Contract to Sepolia
const deployment = await sdk.deploySmartContract("NorthveilToken", "sepolia");
console.log("Deployed Address:", deployment.deployedAddress);
console.log("Transaction Hash:", deployment.txHash);
console.log("Etherscan Link:", deployment.explorerUrl);

// 5. Execute On-Chain Cryptocurrency Transfer
const transfer = await sdk.sendTransfer("ETH", 0.05, "0xRecipientAddress...");
console.log("Transfer Intent Status:", transfer.status);`;

  const pyCode = `import requests

class NorthveilSDK:
    """Official Northveil Web3 Wallet & AI MCP Server Python SDK"""
    def __init__(self, api_key: str, wallet_address: str = None, base_url: str = "https://northveil.vercel.app"):
        self.api_key = api_key
        self.wallet_address = wallet_address
        self.base_url = base_url.rstrip("/")

    def call_tool(self, tool_name: str, arguments: dict = None):
        url = f"{self.base_url}/mcp"
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
        if self.wallet_address:
            headers["X-Wallet-Address"] = self.wallet_address

        payload = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": arguments or {}},
            "id": 1
        }
        res = requests.post(url, json=payload, headers=headers)
        res.raise_for_status()
        return res.json()["result"]

# Initialize SDK
sdk = NorthveilSDK(
    api_key="YOUR_NORTHVEIL_CLIENT_KEY",
    wallet_address="0xYOUR_WALLET_ADDRESS"
)

# Fetch Portfolio
portfolio = sdk.call_tool("get_portfolio")
print("Net Worth USD:", portfolio.get("netWorthUsd"))

# Deploy Smart Contract
deployment = sdk.call_tool("deploy_smart_contract", {"contractName": "MyToken", "network": "sepolia"})
print("Deployed Contract Address:", deployment.get("deployedAddress"))`;

  const copyCode = (text: string, lang: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  return (
    <div className="max-w-[96%] mx-auto py-8 px-2 sm:px-4 space-y-10 text-left bg-[#0a0a0c]">
      
      {/* Title Banner */}
      <div className="bg-[#ff007f] text-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00] space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ff007f] font-mono text-xs font-black uppercase">
          <BookOpen className="w-4 h-4" /> OFFICIAL DEVELOPER SDK LIBRARIES
        </div>
        <h1 className="text-3xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">
          NORTHVEIL SDK <br />
          <span className="bg-black text-[#ccff00] px-2 py-0.5 inline-block my-1">MANUAL & REFERENCE</span>
        </h1>
        <p className="font-mono text-xs sm:text-sm font-bold text-white border-t-3 border-black pt-3">
          COMPLETE CLASS DEFINITIONS, METHOD SIGNATURES, AND CODE EXAMPLES FOR TYPESCRIPT / NODE.JS AND PYTHON.
        </p>
      </div>

      {/* Code Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-mono">
        
        {/* TypeScript / JavaScript */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
            <span className="font-black text-[#ccff00] text-sm uppercase flex items-center gap-2">
              <Code className="w-4 h-4 stroke-[3]" /> TYPESCRIPT / JAVASCRIPT
            </span>
            <button
              onClick={() => copyCode(tsCode, 'ts')}
              className="px-3 py-1.5 bg-[#ccff00] text-black font-black text-xs border border-black hover:bg-[#00f0ff]"
            >
              {copiedLang === 'ts' ? 'COPIED' : 'COPY CODE'}
            </button>
          </div>
          <pre className="bg-black border-2 border-white p-4 text-xs text-[#ccff00] overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {tsCode}
          </pre>
        </div>

        {/* Python */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
            <span className="font-black text-[#00f0ff] text-sm uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 stroke-[3]" /> PYTHON SDK
            </span>
            <button
              onClick={() => copyCode(pyCode, 'py')}
              className="px-3 py-1.5 bg-[#00f0ff] text-black font-black text-xs border border-black hover:bg-[#ccff00]"
            >
              {copiedLang === 'py' ? 'COPIED' : 'COPY CODE'}
            </button>
          </div>
          <pre className="bg-black border-2 border-white p-4 text-xs text-[#00f0ff] overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {pyCode}
          </pre>
        </div>

      </div>
    </div>
  );
};
