import React, { useState } from 'react';
import { Cpu, Terminal, Check, Copy, Shield, Layers, Code, Zap } from 'lucide-react';

export const McpDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const tools = [
    {
      name: 'deploy_smart_contract',
      desc: 'Deploys a compiled Solidity smart contract to a real EVM blockchain (Sepolia, Ethereum, Polygon). Returns contract address & Etherscan link.',
      args: 'contractName (string), bytecode (string), abi (string), network (sepolia/ethereum/polygon)'
    },
    {
      name: 'get_wallet_info',
      desc: 'Retrieves current active wallet address, account metadata, chain network status, and Supabase DB sync state.',
      args: 'chain (ethereum/solana/polygon/arbitrum/bsc)'
    },
    {
      name: 'get_portfolio',
      desc: 'Fetches complete token asset holdings, live USD fiat valuation, 24h market price changes, and total net worth.',
      args: 'hideZeroBalances (boolean)'
    },
    {
      name: 'get_token_balance',
      desc: 'Queries exact balance and fiat valuation for a specific cryptocurrency token symbol.',
      args: 'symbol (ETH, BTC, SOL, USDT, USDC)'
    },
    {
      name: 'send_transfer',
      desc: 'Executes a cryptographically signed on-chain cryptocurrency transfer to a recipient wallet address.',
      args: 'token (string), amount (number), recipientAddress (0x...), chain (string)'
    },
    {
      name: 'execute_swap',
      desc: 'Performs an EVM DEX token swap via 1inch v6 or Solana swap via Jupiter aggregator.',
      args: 'fromToken (string), toToken (string), amount (number)'
    },
    {
      name: 'get_transaction_history',
      desc: 'Queries the complete transaction audit log timeline for a wallet from Supabase DB.',
      args: 'limit (number, default 10)'
    },
    {
      name: 'create_smart_contract',
      desc: 'Generates and audits custom OpenZeppelin Solidity smart contract code based on natural language prompts.',
      args: 'prompt (string), contractType (ERC20/ERC721/Vault)'
    },
    {
      name: 'get_gas_estimate',
      desc: 'Queries live EIP-1559 gas prices (Base Fee, Priority Fee) via Ethers.js RPC provider.',
      args: 'chain (ethereum/polygon/arbitrum)'
    },
    {
      name: 'audit_smart_contract',
      desc: 'Performs static security analysis on Solidity code to detect vulnerabilities and reentrancy bugs.',
      args: 'code (solidity string)'
    },
    {
      name: 'get_nft_gallery',
      desc: 'Fetches owned NFT digital assets, floor prices, and token metadata for a wallet address.',
      args: 'chain (ethereum/polygon)'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8 space-y-12 font-mono">
      {/* Title Header */}
      <div className="border-b-4 border-white pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ccff00] text-black text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <Cpu className="w-4 h-4" /> MCP SPECIFICATION v2024-11-05
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          NORTHVEIL UNIVERSAL <span className="text-[#00f0ff]">MCP AI SERVER</span>
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          The Northveil Model Context Protocol (MCP) server allows AI assistants (Anthropic Claude Web, Claude Desktop, ChatGPT, Cursor) to interact directly with your Web3 wallet, execute real-time blockchain operations, and deploy smart contracts.
        </p>
      </div>

      {/* Claude Web Connector Modal Guide */}
      <div className="bg-[#141419] border-4 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00] space-y-6">
        <h3 className="text-xl font-black text-[#ccff00] uppercase flex items-center gap-2">
          <span>⚡ CONNECTING TO CLAUDE WEB (CUSTOM CONNECTOR SETUP)</span>
        </h3>
        <p className="text-xs text-slate-300">
          In Claude Web (<a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-[#00f0ff] underline">Claude.ai</a>), go to <b>Profile</b> $\rightarrow$ <b>Settings</b> $\rightarrow$ <b>Connectors</b> $\rightarrow$ <b>Add Custom Connector</b> and enter these values:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#0a0a0c] border-2 border-[#00f0ff] space-y-3">
            <div className="font-black text-[#00f0ff] uppercase border-b border-white/20 pb-2">
              1. CONNECTOR NAME & URL
            </div>
            <div>
              <div className="text-slate-400">Name:</div>
              <code className="text-white bg-[#141419] px-2 py-1 border border-white/20 block mt-1">Northveil AI Assistant</code>
            </div>
            <div>
              <div className="text-slate-400">Remote MCP Server URL (SSE):</div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-[#ccff00] bg-[#141419] p-2 border border-white/20 flex-1 break-all text-[11px]">
                  https://northveil.vercel.app/sse?wallet_address=0xYOUR_WALLET
                </code>
                <button
                  onClick={() => copyToClipboard('https://northveil.vercel.app/sse', 'sse')}
                  className="px-3 py-2 bg-[#ccff00] text-black font-black uppercase text-[10px] border border-black shadow-[2px_2px_0px_0px_#000]"
                >
                  {copiedKey === 'sse' ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0c] border-2 border-[#ff007f] space-y-3">
            <div className="font-black text-[#ff007f] uppercase border-b border-white/20 pb-2">
              2. OAUTH 2.0 CREDENTIALS
            </div>
            <div>
              <div className="text-slate-400">OAuth Client ID:</div>
              <code className="text-white bg-[#141419] px-2 py-1 border border-white/20 block mt-1">northveil_ai_client</code>
            </div>
            <div>
              <div className="text-slate-400">OAuth Client Secret:</div>
              <code className="text-white bg-[#141419] px-2 py-1 border border-white/20 block mt-1">northveil_ai_secret</code>
            </div>
          </div>
        </div>
      </div>

      {/* 11 Available MCP Tools Directory */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-white uppercase flex items-center justify-between">
          <span>🛠️ AVAILABLE MCP TOOLS DIRECTORY (11 TOOLS)</span>
          <span className="text-xs text-[#00f0ff]">inputSchema COMPLIANT</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((t, idx) => (
            <div key={idx} className="bg-[#141419] border-2 border-white p-5 space-y-3 hover:border-[#ccff00] transition-colors shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="font-black text-[#ccff00] text-sm font-mono">
                  {t.name}
                </span>
                <span className="text-[10px] bg-[#000] text-[#00f0ff] px-2 py-0.5 border border-white/20">
                  TOOL #{idx + 1}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.desc}
              </p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] text-slate-500 block uppercase">Arguments:</span>
                <code className="text-[11px] text-[#ff007f] break-all block mt-0.5">
                  {t.args}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
