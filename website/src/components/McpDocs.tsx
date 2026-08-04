import React, { useState } from 'react';
import { Cpu, Terminal, Check, Copy, Shield, Layers, Code, Zap, BookOpen, ChevronRight, Lock, Key, Server, RefreshCw } from 'lucide-react';
import { getMcpSseUrl } from '../config/endpointConfig';

export const McpDocs: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const mcpSseUrl = getMcpSseUrl();

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toolsList = [
    {
      name: 'deploy_smart_contract',
      category: 'Smart Contracts',
      desc: 'Deploys a compiled Solidity smart contract to a real EVM blockchain network (Sepolia, Ethereum Mainnet, Polygon). Returns contract address, deployment transaction hash, and live Etherscan verification link.',
      inputSchema: {
        type: 'object',
        properties: {
          contractName: { type: 'string', description: 'Name of the smart contract (e.g. NorthveilToken)' },
          bytecode: { type: 'string', description: 'Optional compiled EVM bytecode hex string (0x...)' },
          abi: { type: 'string', description: 'Optional contract ABI JSON string' },
          network: { type: 'string', description: 'Target EVM network (sepolia, ethereum, polygon)' }
        },
        required: ['contractName']
      }
    },
    {
      name: 'get_wallet_info',
      category: 'Account & Network',
      desc: 'Retrieves current active wallet address, account label, network chain status, Ethers.js RPC connection, and Supabase DB synchronization state.',
      inputSchema: {
        type: 'object',
        properties: {
          chain: { type: 'string', description: 'Optional chain filter (ethereum, solana, bitcoin, polygon, arbitrum, bsc)' }
        }
      }
    },
    {
      name: 'get_portfolio',
      category: 'Portfolio Analytics',
      desc: 'Fetches complete token asset holdings across multi-chain balances, live USD market valuations via price engines, 24h price changes, and net worth breakdown.',
      inputSchema: {
        type: 'object',
        properties: {
          hideZeroBalances: { type: 'boolean', description: 'Set to true to omit assets with zero balance' }
        }
      }
    },
    {
      name: 'get_token_balance',
      category: 'Asset Queries',
      desc: 'Queries exact balance and fiat USD market valuation for a specific cryptocurrency token symbol (ETH, BTC, SOL, USDT, USDC).',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Cryptocurrency token symbol (e.g. ETH, BTC, SOL)' }
        },
        required: ['symbol']
      }
    },
    {
      name: 'send_transfer',
      category: 'Transactions',
      desc: 'Executes an on-chain cryptocurrency transaction transfer. Generates a signable unsigned intent object or broadcasts signed transaction directly.',
      inputSchema: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'Token symbol (ETH, USDT, SOL)' },
          amount: { type: 'number', description: 'Human readable transfer amount' },
          recipientAddress: { type: 'string', description: 'Recipient wallet address (0x...)' },
          chain: { type: 'string', description: 'Target blockchain network' }
        },
        required: ['token', 'amount', 'recipientAddress']
      }
    },
    {
      name: 'execute_swap',
      category: 'DEX Aggregation',
      desc: 'Performs token swap via 1inch v6 aggregator on EVM or Jupiter v6 aggregator on Solana.',
      inputSchema: {
        type: 'object',
        properties: {
          fromToken: { type: 'string', description: 'Source token symbol' },
          toToken: { type: 'string', description: 'Destination token symbol' },
          amount: { type: 'number', description: 'Amount to swap' },
          slippage: { type: 'number', description: 'Slippage tolerance percentage (e.g. 0.5)' }
        },
        required: ['fromToken', 'toToken', 'amount']
      }
    },
    {
      name: 'get_transaction_history',
      category: 'Audit & Logs',
      desc: 'Queries complete on-chain transaction history timeline and audit log for a wallet from Supabase DB.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum transactions to fetch (default 10)' }
        }
      }
    },
    {
      name: 'create_smart_contract',
      category: 'Smart Contracts',
      desc: 'Generates and audits custom OpenZeppelin Solidity smart contract code based on natural language prompts.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Natural language contract prompt' },
          contractType: { type: 'string', description: 'Contract type (ERC20, ERC721, Vault)' }
        },
        required: ['prompt']
      }
    },
    {
      name: 'get_gas_estimate',
      category: 'Network Feeds',
      desc: 'Queries live EIP-1559 gas fee prices (Base Fee, Priority Fee) via Ethers.js RPC provider.',
      inputSchema: {
        type: 'object',
        properties: {
          chain: { type: 'string', description: 'Target EVM chain (ethereum, polygon, arbitrum)' }
        }
      }
    },
    {
      name: 'audit_smart_contract',
      category: 'Security & Audit',
      desc: 'Performs static security analysis on Solidity code to detect reentrancy bugs, integer overflows, and access control risks.',
      inputSchema: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Solidity contract code string' }
        },
        required: ['code']
      }
    },
    {
      name: 'get_nft_gallery',
      category: 'Asset Queries',
      desc: 'Fetches owned NFT digital assets, collection metadata, and floor prices for a wallet address.',
      inputSchema: {
        type: 'object',
        properties: {
          chain: { type: 'string', description: 'Blockchain network (ethereum, polygon)' }
        }
      }
    }
  ];

  return (
    <div className="max-w-[96%] mx-auto py-8 px-2 sm:px-4 space-y-10 text-left bg-[#0a0a0c]">
      
      {/* Brutalist Title Banner */}
      <div className="bg-[#ccff00] text-black border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#00f0ff] space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ccff00] font-mono text-xs font-black uppercase">
          <Cpu className="w-4 h-4" /> MCP SPEC v2024-11-05
        </div>
        <h1 className="text-3xl sm:text-6xl font-black text-black uppercase tracking-tighter leading-none">
          MODEL CONTEXT PROTOCOL <br />
          <span className="bg-black text-[#00f0ff] px-2 py-0.5 inline-block my-1">AI SERVER MANUAL</span>
        </h1>
        <p className="font-mono text-xs sm:text-sm font-bold text-black border-t-3 border-black pt-3">
          EXHAUSTIVE TECHNICAL SPECIFICATION FOR ANTHROPIC CLAUDE WEB, CHATGPT ACTIONS, AND CURSOR IDE INTEGRATION VIA SERVER-SENT EVENTS (SSE) & JSON-RPC 2.0.
        </p>
      </div>

      {/* SECTION 1: ARCHITECTURE OVERVIEW */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 border-b-3 border-white pb-3">
          <Server className="w-6 h-6 text-[#ccff00]" />
          <span>1. ARCHITECTURE OVERVIEW & PROTOCOL FLOW</span>
        </h2>
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-4 font-mono text-xs text-slate-200">
          <p className="leading-relaxed">
            The Northveil Model Context Protocol (MCP) server operates as a non-custodial gateway enabling LLMs to query blockchain nodes and propose smart contract transactions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-black border-2 border-[#00f0ff] p-4 shadow-[4px_4px_0px_0px_#00f0ff] space-y-2">
              <span className="text-[#00f0ff] font-black block uppercase">SSE EVENT STREAM</span>
              <p className="text-slate-300">
                Establishes long-lived HTTP Server-Sent Events stream on <code>/sse</code> for bi-directional message dispatching.
              </p>
            </div>
            <div className="bg-black border-2 border-[#ccff00] p-4 shadow-[4px_4px_0px_0px_#ccff00] space-y-2">
              <span className="text-[#ccff00] font-black block uppercase">JSON-RPC 2.0 PROTOCOL</span>
              <p className="text-slate-300">
                Handles tool execution requests via standardized <code>POST /messages</code> or <code>POST /mcp</code> calls.
              </p>
            </div>
            <div className="bg-black border-2 border-[#ff007f] p-4 shadow-[4px_4px_0px_0px_#ff007f] space-y-2">
              <span className="text-[#ff007f] font-black block uppercase">PERMISSION GUARD</span>
              <p className="text-slate-300">
                Enforces API key permissions (<code>read_only</code>, <code>transfer_enabled</code>, <code>contract_deploy_enabled</code>).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CLAUDE WEB CONNECTOR */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 border-b-3 border-white pb-3">
          <Key className="w-6 h-6 text-[#00f0ff]" />
          <span>2. CLAUDE WEB CUSTOM CONNECTOR SETUP</span>
        </h2>
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-6 font-mono text-xs">
          <p className="text-slate-200">
            In Claude Web (<b>Claude.ai</b>), navigate to <b>Profile $\rightarrow$ Settings $\rightarrow$ Connectors $\rightarrow$ Add Custom Connector</b> and enter the values below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black border-3 border-[#ccff00] p-5 shadow-[4px_4px_0px_0px_#ccff00] space-y-4">
              <div className="text-[#ccff00] font-black border-b-2 border-white/20 pb-2 flex items-center justify-between">
                <span>1. CONNECTOR SETTINGS</span>
                <span className="bg-[#ccff00] text-black px-2 py-0.5 text-[10px]">REQUIRED</span>
              </div>
              <div>
                <span className="text-slate-400 block">Name:</span>
                <code className="text-white bg-[#141419] p-2 border border-white block mt-1">Northveil AI Assistant</code>
              </div>
              <div>
                <span className="text-slate-400 block">Remote SSE Endpoint URL:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-[#00f0ff] bg-[#141419] p-2 border border-white flex-1 break-all text-[11px]">
                    {mcpSseUrl}?wallet_address=0xYOUR_WALLET
                  </code>
                  <button
                    onClick={() => copyText(mcpSseUrl, 'sse')}
                    className="px-3 py-2 bg-[#ccff00] text-black border border-black font-black hover:bg-[#00f0ff]"
                  >
                    {copiedId === 'sse' ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-black border-3 border-[#ff007f] p-5 shadow-[4px_4px_0px_0px_#ff007f] space-y-4">
              <div className="text-[#ff007f] font-black border-b-2 border-white/20 pb-2 flex items-center justify-between">
                <span>2. OAUTH 2.0 PKCE CREDENTIALS</span>
                <span className="bg-[#ff007f] text-white px-2 py-0.5 text-[10px]">PRE-CONFIGURED</span>
              </div>
              <div>
                <span className="text-slate-400 block">OAuth Client ID:</span>
                <code className="text-white bg-[#141419] p-2 border border-white block mt-1">northveil_ai_client</code>
              </div>
              <div>
                <span className="text-slate-400 block">OAuth Client Secret:</span>
                <code className="text-white bg-[#141419] p-2 border border-white block mt-1">northveil_ai_secret</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: COMPLETE 11 MCP TOOLS SPECIFICATION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-3 border-white pb-3">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Layers className="w-6 h-6 text-[#ff007f]" />
            <span>3. COMPLETE MCP TOOLS SPECIFICATION (11 TOOLS)</span>
          </h2>
          <span className="bg-[#ccff00] text-black font-mono text-xs font-black px-3 py-1 border-2 border-black">
            JSON-RPC 2.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {toolsList.map((tool, idx) => (
            <div key={idx} className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-white/20 pb-3 font-mono">
                <span className="font-black text-[#00f0ff] text-sm">
                  {tool.name}
                </span>
                <span className="bg-[#0a0a0c] text-[#ccff00] px-2.5 py-1 text-[10px] font-bold border border-white/20 uppercase">
                  {tool.category}
                </span>
              </div>
              
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {tool.desc}
              </p>

              <div className="bg-black border-2 border-white p-3 space-y-1.5 font-mono">
                <span className="text-[10px] text-slate-400 block uppercase">Input Schema (JSON):</span>
                <pre className="text-[11px] text-[#ccff00] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(tool.inputSchema, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
