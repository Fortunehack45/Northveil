import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, Code } from 'lucide-react';

export const SdkDocs: React.FC = () => {
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  const tsCode = `import { NorthveilSDK } from '@northveil/sdk';

// Initialize Northveil SDK instance
const sdk = new NorthveilSDK({
  apiKey: "nv_live_9f82a17b09c82415d8a9",
  walletAddress: "0x71C8891575b50d22e032d847847c234a413d4cc8",
  baseUrl: "https://northveil.vercel.app"
});

// 1. Fetch live portfolio & holdings
const portfolio = await sdk.getPortfolio();
console.log("Total Net Worth ($):", portfolio.netWorthUsd);

// 2. Deploy smart contract on Sepolia EVM network
const deployRes = await sdk.deploySmartContract("NorthveilToken", "sepolia");
console.log("Deployed Contract Address:", deployRes.deployedAddress);
console.log("Etherscan Explorer:", deployRes.explorerUrl);`;

  const pyCode = `import requests

class NorthveilSDK:
    def __init__(self, api_key: str, base_url: str = "https://northveil.vercel.app"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    def call_tool(self, tool_name: str, arguments: dict):
        url = f"{self.base_url}/mcp"
        headers = {"X-API-Key": self.api_key, "Content-Type": "application/json"}
        payload = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": arguments},
            "id": 1
        }
        res = requests.post(url, json=payload, headers=headers)
        return res.json()["result"]

# Initialize SDK
sdk = NorthveilSDK("nv_live_9f82a17b09c82415d8a9")

# Fetch Portfolio
portfolio = sdk.call_tool("get_portfolio", {})
print("Portfolio:", portfolio)

# Deploy Smart Contract
deployment = sdk.call_tool("deploy_smart_contract", {"contractName": "MyToken", "network": "sepolia"})
print("Deployed Address:", deployment.get("deployedAddress"))`;

  const copyCode = (text: string, lang: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8 space-y-12 font-mono">
      <div className="border-b-4 border-white pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff007f] text-white text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <BookOpen className="w-4 h-4" /> OFFICIAL DEVELOPER SDKs
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          NORTHVEIL <span className="text-[#00f0ff]">TYPESCRIPT & PYTHON SDKs</span>
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Integrate Northveil wallet controls, live RPC balances, smart contract deployment engines, and MCP tools directly into your Node.js, Next.js, or Python applications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TypeScript / JavaScript SDK */}
        <div className="bg-[#141419] border-4 border-white p-6 shadow-[8px_8px_0px_0px_#ccff00] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-white pb-3">
            <span className="font-black text-[#ccff00] uppercase text-sm flex items-center gap-2">
              <Code className="w-4 h-4" /> TYPESCRIPT / JAVASCRIPT SDK
            </span>
            <button
              onClick={() => copyCode(tsCode, 'ts')}
              className="px-3 py-1 bg-[#ccff00] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000]"
            >
              {copiedLang === 'ts' ? 'COPIED!' : 'COPY CODE'}
            </button>
          </div>
          <pre className="bg-[#0a0a0c] border-2 border-white/20 p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
            {tsCode}
          </pre>
        </div>

        {/* Python SDK */}
        <div className="bg-[#141419] border-4 border-white p-6 shadow-[8px_8px_0px_0px_#00f0ff] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-white pb-3">
            <span className="font-black text-[#00f0ff] uppercase text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4" /> PYTHON SDK
            </span>
            <button
              onClick={() => copyCode(pyCode, 'py')}
              className="px-3 py-1 bg-[#00f0ff] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000]"
            >
              {copiedLang === 'py' ? 'COPIED!' : 'COPY CODE'}
            </button>
          </div>
          <pre className="bg-[#0a0a0c] border-2 border-white/20 p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
            {pyCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
