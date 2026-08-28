import React, { useState } from 'react';
import { Cpu, Terminal, Check, Copy, Shield, Layers, Code, Zap, BookOpen, ChevronRight, Lock, Key, Server, RefreshCw, Globe, Sparkles } from 'lucide-react';
import {
  getMcpServerUrl,
  getMcpHttpUrl,
  getMcpSseUrl,
  getOAuthAuthorizeUrl,
  getOAuthTokenUrl,
  getOAuthRegisterUrl,
  getOAuthProtectedResourceUrl,
  getOAuthServerMetadataUrl,
  getOpenApiUrl,
} from '../config/endpointConfig';

export const McpDocs: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<'claudeweb' | 'claude' | 'cursor' | 'chatgpt' | 'claudecode' | 'windsurf' | 'http'>('claudeweb');

  const mcpServerUrl = getMcpServerUrl();
  const mcpHttpUrl = getMcpHttpUrl();
  const mcpSseUrl = getMcpSseUrl();
  const oauthAuthorizeUrl = getOAuthAuthorizeUrl();
  const oauthTokenUrl = getOAuthTokenUrl();
  const oauthRegisterUrl = getOAuthRegisterUrl();
  const oauthProtectedResourceUrl = getOAuthProtectedResourceUrl();
  const oauthServerMetadataUrl = getOAuthServerMetadataUrl();
  const openApiUrl = getOpenApiUrl();

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const canonicalToolsList = [
    {
      name: 'northveil_list_wallets',
      category: 'Read / Identity',
      policy: 'Autonomous (Read-Only)',
      desc: 'Enumerates authenticated, non-custodial public wallet addresses permitted for the session.',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'northveil_get_balances',
      category: 'Read / Balances',
      policy: 'Autonomous (Read-Only)',
      desc: 'Retrieves live multi-chain native and token balances (ETH, BASE, SOL, MATIC, ARB, BSC).',
      inputSchema: {
        type: 'object',
        properties: {
          walletAddress: { type: 'string', description: 'Target wallet address' },
          network: { type: 'string', description: 'Blockchain network (base, ethereum, sepolia, solana, polygon, arbitrum, bsc)' }
        }
      }
    },
    {
      name: 'northveil_get_portfolio',
      category: 'Read / Analytics',
      policy: 'Autonomous (Read-Only)',
      desc: 'Aggregates complete multi-chain token holdings, live USD market valuations, and net worth breakdown.',
      inputSchema: {
        type: 'object',
        properties: {
          walletAddress: { type: 'string', description: 'Target wallet address' },
          hideZeroBalances: { type: 'boolean', description: 'Omit tokens with 0 balance' }
        }
      }
    },
    {
      name: 'northveil_simulate_tx',
      category: 'Simulate / Diagnostics',
      policy: 'Autonomous (Read-Only)',
      desc: 'Simulates transaction execution on an on-chain fork to compute accurate gas consumption, balance deltas, and detect reverts.',
      inputSchema: {
        type: 'object',
        properties: {
          from: { type: 'string', description: 'Sender address' },
          to: { type: 'string', description: 'Recipient or contract address' },
          value: { type: 'string', description: 'Value in ETH / native units' },
          data: { type: 'string', description: 'Call data hex (0x...)' },
          network: { type: 'string', description: 'Target network' }
        },
        required: ['from', 'to']
      }
    },
    {
      name: 'northveil_estimate_gas',
      category: 'Simulate / Fees',
      policy: 'Autonomous (Read-Only)',
      desc: 'Fetches live EIP-1559 gas fees (Base Fee, Priority Fee) and computes USD cost estimates.',
      inputSchema: {
        type: 'object',
        properties: {
          network: { type: 'string', description: 'Target network' },
          to: { type: 'string', description: 'Target address' },
          value: { type: 'string', description: 'Value amount' }
        }
      }
    },
    {
      name: 'northveil_audit_contract',
      category: 'Security / Audit',
      policy: 'Autonomous (Read-Only)',
      desc: 'Performs AST vulnerability analysis, honeypot detection, fee analysis, and owner control verification.',
      inputSchema: {
        type: 'object',
        properties: {
          contractAddress: { type: 'string', description: 'Contract address' },
          network: { type: 'string', description: 'Target network' }
        },
        required: ['contractAddress']
      }
    },
    {
      name: 'northveil_prepare_transfer',
      category: 'Action / Stage',
      policy: 'Policy-Gated (Client Signing Required)',
      desc: 'Non-custodially stages a native or token transfer. Returns an unsigned signable payload, unique requestId, and approvalToken.',
      inputSchema: {
        type: 'object',
        properties: {
          walletAddress: { type: 'string', description: 'Sender vault address' },
          recipient: { type: 'string', description: 'Recipient public address' },
          amount: { type: 'number', description: 'Amount to transfer' },
          asset: { type: 'string', description: 'Token symbol (ETH, USDC, SOL)' },
          network: { type: 'string', description: 'Target network' }
        },
        required: ['recipient', 'amount']
      }
    },
    {
      name: 'northveil_prepare_swap',
      category: 'Action / DEX',
      policy: 'Policy-Gated (Client Signing Required)',
      desc: 'Stages an optimal DEX swap via 1inch v6 (EVM) or Jupiter v6 (Solana) with slippage protection.',
      inputSchema: {
        type: 'object',
        properties: {
          fromToken: { type: 'string', description: 'Source token symbol' },
          toToken: { type: 'string', description: 'Destination token symbol' },
          amount: { type: 'number', description: 'Amount to swap' },
          slippage: { type: 'number', description: 'Slippage percentage' },
          network: { type: 'string', description: 'Network' }
        },
        required: ['fromToken', 'toToken', 'amount']
      }
    },
    {
      name: 'northveil_request_signature',
      category: 'Signing / Passkey',
      policy: 'WebAuthn / Passkey Prompt',
      desc: 'Prompts the user for biometric WebAuthn assertion or local cryptographic signature for a staged transaction.',
      inputSchema: {
        type: 'object',
        properties: {
          approvalToken: { type: 'string', description: 'Staged transaction approval token' },
          userId: { type: 'string', description: 'User identifier' }
        },
        required: ['approvalToken']
      }
    },
    {
      name: 'northveil_request_broadcast',
      category: 'Broadcast / Relayer',
      policy: 'Signature Verified & Relayed',
      desc: 'Cryptographically verifies the recovered signature against the authorized vault and broadcasts the raw transaction on-chain.',
      inputSchema: {
        type: 'object',
        properties: {
          approvalToken: { type: 'string', description: 'Staged approval token' },
          signedTransaction: { type: 'string', description: 'Raw signed transaction hex (0x...)' }
        },
        required: ['signedTransaction']
      }
    },
    {
      name: 'deploy_smart_contract',
      category: 'Smart Contracts',
      policy: 'Hard-Gated (Approval Required)',
      desc: 'Deploys a verified Solidity contract (ERC20, ERC721, Staking, Vault) to EVM testnets or mainnets.',
      inputSchema: {
        type: 'object',
        properties: {
          contractName: { type: 'string', description: 'Name of the contract' },
          contractType: { type: 'string', description: 'Type (erc20, erc721, staking, vault)' },
          symbol: { type: 'string', description: 'Token symbol' },
          totalSupply: { type: 'number', description: 'Initial token supply' },
          network: { type: 'string', description: 'Target network' }
        },
        required: ['contractName']
      }
    },
    {
      name: 'check_wallet_health',
      category: 'Security / Diagnostics',
      policy: 'Autonomous (Read-Only)',
      desc: 'Analyzes wallet health score, gas sufficiency, asset diversification, and dust token hazards.',
      inputSchema: {
        type: 'object',
        properties: {
          walletAddress: { type: 'string', description: 'Target wallet address' }
        }
      }
    }
  ];

  const getSnippet = (client: 'claudeweb' | 'claude' | 'cursor' | 'chatgpt' | 'claudecode' | 'windsurf' | 'http') => {
    switch (client) {
      case 'claudeweb':
        return JSON.stringify({
          connector_name: "Northveil",
          transport: "Streamable HTTP (Recommended) or SSE",
          streamable_http_url: mcpHttpUrl,
          sse_url: `${mcpSseUrl}?wallet_address=0xYOUR_WALLET_ADDRESS`,
          logo_url: "https://iili.io/CDS9fvn.png",
          active_tools_count: 60
        }, null, 2);
      case 'claude':
        return JSON.stringify({
          mcpServers: {
            northveil: {
              url: mcpHttpUrl,
              headers: {
                Authorization: "Bearer nv_live_YOUR_API_KEY",
                "x-wallet-address": "0xYOUR_WALLET_ADDRESS"
              }
            }
          }
        }, null, 2);
      case 'cursor':
        return JSON.stringify({
          mcpServers: {
            northveil: {
              url: mcpHttpUrl,
              headers: {
                Authorization: "Bearer nv_live_YOUR_API_KEY",
                "x-wallet-address": "0xYOUR_WALLET_ADDRESS"
              }
            }
          }
        }, null, 2);
      case 'claudecode':
        return `claude mcp add northveil ${mcpHttpUrl} --header "Authorization: Bearer nv_live_YOUR_API_KEY"`;
      case 'chatgpt':
        return JSON.stringify({
          integration: "OpenAI ChatGPT Custom Action",
          openapi_spec_url: openApiUrl,
          mcp_endpoint: mcpHttpUrl,
          oauth_metadata: {
            authorization_server: oauthServerMetadataUrl,
            protected_resource: oauthProtectedResourceUrl,
            authorization_url: oauthAuthorizeUrl,
            token_url: oauthTokenUrl,
            client_registration_url: oauthRegisterUrl,
            scopes_supported: ["tools:read", "tools:execute"]
          }
        }, null, 2);
      case 'windsurf':
        return JSON.stringify({
          mcpServers: {
            northveil: {
              url: mcpHttpUrl,
              headers: {
                Authorization: "Bearer nv_live_YOUR_API_KEY",
                "x-wallet-address": "0xYOUR_WALLET_ADDRESS"
              }
            }
          }
        }, null, 2);
      case 'http':
        return `curl -X POST ${mcpHttpUrl} \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer nv_live_YOUR_API_KEY" \\\n  -H "x-wallet-address: 0xYOUR_WALLET_ADDRESS" \\\n  -d '{\n    "jsonrpc": "2.0",\n    "id": 1,\n    "method": "tools/call",\n    "params": {\n      "name": "northveil_get_balances",\n      "arguments": { "network": "base" }\n    }\n  }'`;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-[96%] mx-auto py-8 px-2 sm:px-4 space-y-10 text-left bg-[#0a0a0c]">
      
      {/* Brutalist Title Banner */}
      <div className="bg-[#ccff00] text-black border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#00f0ff] space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ccff00] font-mono text-xs font-black uppercase">
          <Cpu className="w-4 h-4" /> MCP PROTOCOL SPEC • 100% NON-CUSTODIAL
        </div>
        <h1 className="text-3xl sm:text-6xl font-black text-black uppercase tracking-tighter leading-none">
          MODEL CONTEXT PROTOCOL <br />
          <span className="bg-black text-[#00f0ff] px-2 py-0.5 inline-block my-1">AI SERVER INTEGRATION GUIDE</span>
        </h1>
        <p className="font-mono text-xs sm:text-sm font-bold text-black border-t-3 border-black pt-3">
          COMPLETE SPECIFICATION FOR CLAUDE DESKTOP, CURSOR IDE, CLAUDE CODE, CHATGPT ACTIONS, AND LLM AGENTS VIA STREAMABLE HTTP & SSE.
        </p>
      </div>

      {/* SECTION 1: PROTOCOL ENDPOINTS & DISCOVERY */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 border-b-3 border-white pb-3">
          <Globe className="w-6 h-6 text-[#ccff00]" />
          <span>1. PROTOCOL ENDPOINTS & RFC DISCOVERY</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#141419] border-2 border-[#00f0ff] p-4 shadow-[4px_4px_0px_0px_#00f0ff] space-y-2">
            <span className="text-[#00f0ff] font-mono text-xs font-black block uppercase">STREAMABLE HTTP MCP</span>
            <code className="text-xs text-white bg-black p-2 border border-white/20 block font-mono break-all">
              {mcpHttpUrl}
            </code>
            <p className="text-slate-400 font-mono text-[11px]">
              Standard streamable JSON-RPC 2.0 transport via <code>POST /mcp</code> (rejects GET with 405 per spec).
            </p>
            <button
              onClick={() => copyText(mcpHttpUrl, 'mcpHttp')}
              className="w-full py-1.5 bg-[#00f0ff] text-black font-mono text-xs font-bold hover:bg-white cursor-pointer"
            >
              {copiedId === 'mcpHttp' ? 'COPIED!' : 'COPY URL'}
            </button>
          </div>

          <div className="bg-[#141419] border-2 border-[#ccff00] p-4 shadow-[4px_4px_0px_0px_#ccff00] space-y-2">
            <span className="text-[#ccff00] font-mono text-xs font-black block uppercase">SERVER-SENT EVENTS (SSE)</span>
            <code className="text-xs text-white bg-black p-2 border border-white/20 block font-mono break-all">
              {mcpSseUrl}
            </code>
            <p className="text-slate-400 font-mono text-[11px]">
              Real-time persistent bi-directional streaming via <code>GET /sse</code> for interactive agent sessions.
            </p>
            <button
              onClick={() => copyText(mcpSseUrl, 'mcpSse')}
              className="w-full py-1.5 bg-[#ccff00] text-black font-mono text-xs font-bold hover:bg-white cursor-pointer"
            >
              {copiedId === 'mcpSse' ? 'COPIED!' : 'COPY URL'}
            </button>
          </div>

          <div className="bg-[#141419] border-2 border-[#ff007f] p-4 shadow-[4px_4px_0px_0px_#ff007f] space-y-2">
            <span className="text-[#ff007f] font-mono text-xs font-black block uppercase">RFC 9728 & RFC 8414 OAUTH</span>
            <code className="text-xs text-white bg-black p-2 border border-white/20 block font-mono break-all text-[10px]">
              {oauthProtectedResourceUrl}
            </code>
            <p className="text-slate-400 font-mono text-[11px]">
              Dynamic OAuth 2.0 PKCE discovery metadata and RFC 7591 dynamic client registration.
            </p>
            <button
              onClick={() => copyText(oauthProtectedResourceUrl, 'oauthMeta')}
              className="w-full py-1.5 bg-[#ff007f] text-white font-mono text-xs font-bold hover:bg-white hover:text-black cursor-pointer"
            >
              {copiedId === 'oauthMeta' ? 'COPIED!' : 'COPY METADATA URL'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: CLIENT CONFIGURATION GENERATOR */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 border-b-3 border-white pb-3">
          <Terminal className="w-6 h-6 text-[#00f0ff]" />
          <span>2. CLIENT CONFIGURATION GENERATOR</span>
        </h2>
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-6 font-mono text-xs">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'claudeweb', label: 'Claude.ai Web' },
              { id: 'claude', label: 'Claude Desktop' },
              { id: 'cursor', label: 'Cursor IDE' },
              { id: 'claudecode', label: 'Claude Code CLI' },
              { id: 'chatgpt', label: 'ChatGPT Custom Action' },
              { id: 'windsurf', label: 'Windsurf' },
              { id: 'http', label: 'cURL / Direct HTTP' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedClient(tab.id as any)}
                className={`px-4 py-2 border-2 uppercase font-bold transition-all cursor-pointer ${
                  selectedClient === tab.id
                    ? 'bg-[#ccff00] text-black border-black shadow-[3px_3px_0px_0px_#00f0ff]'
                    : 'bg-black text-slate-300 border-white/20 hover:border-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <pre className="p-4 bg-black border-2 border-white text-[#ccff00] overflow-x-auto text-xs leading-relaxed max-h-72">
              {getSnippet(selectedClient)}
            </pre>
            <button
              onClick={() => copyText(getSnippet(selectedClient), `snippet-${selectedClient}`)}
              className="absolute top-3 right-3 px-3 py-1.5 bg-[#00f0ff] text-black font-bold border border-black hover:bg-white cursor-pointer"
            >
              {copiedId === `snippet-${selectedClient}` ? 'COPIED!' : 'COPY SNIPPET'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: 2-STEP NON-CUSTODIAL EXECUTION LIFECYCLE */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 border-b-3 border-white pb-3">
          <Shield className="w-6 h-6 text-[#ff007f]" />
          <span>3. TWO-STEP NON-CUSTODIAL EXECUTION LIFECYCLE</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="bg-[#141419] border-3 border-white p-5 shadow-[4px_4px_0px_0px_#ccff00] space-y-3">
            <span className="text-[#ccff00] font-black text-sm block">STEP 1: PREPARATION</span>
            <p className="text-slate-300 leading-relaxed">
              Agent calls <code>prepare_transfer</code> or <code>prepare_swap</code>. Northveil computes exact nonces, gas limits, and returns unsigned serialized transaction hex and a unique <code>approvalToken</code>.
            </p>
          </div>
          <div className="bg-[#141419] border-3 border-white p-5 shadow-[4px_4px_0px_0px_#00f0ff] space-y-3">
            <span className="text-[#00f0ff] font-black text-sm block">STEP 2: LOCAL SIGNING</span>
            <p className="text-slate-300 leading-relaxed">
              The user cryptographically signs the unsigned payload locally via WebAuthn biometric Passkey, Hardware Wallet, or local client SDK. <b>Zero private keys ever touch the server.</b>
            </p>
          </div>
          <div className="bg-[#141419] border-3 border-white p-5 shadow-[4px_4px_0px_0px_#ff007f] space-y-3">
            <span className="text-[#ff007f] font-black text-sm block">STEP 3: BROADCAST</span>
            <p className="text-slate-300 leading-relaxed">
              Agent calls <code>northveil_request_broadcast</code> with <code>signedTransaction</code>. Northveil validates recovered address against authorized vault and broadcasts on-chain.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: CANONICAL MCP TOOLS CATALOG */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-3 border-white pb-3">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Layers className="w-6 h-6 text-[#ccff00]" />
            <span>4. CANONICAL MCP TOOL SPECIFICATION (18 CANONICAL + 39 EXTENSIONS)</span>
          </h2>
          <span className="bg-[#ccff00] text-black font-mono text-xs font-black px-3 py-1 border-2 border-black">
            57 TOTAL TOOLS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          {canonicalToolsList.map((tool, idx) => (
            <div key={idx} className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
                <span className="font-black text-[#00f0ff] text-sm">{tool.name}</span>
                <span className="bg-black text-[#ccff00] px-2 py-0.5 text-[10px] font-bold border border-white/20 uppercase">
                  {tool.category}
                </span>
              </div>
              
              <div className="text-xs text-slate-300 space-y-1">
                <p className="leading-relaxed">{tool.desc}</p>
                <div className="pt-1">
                  <span className="text-slate-500 text-[11px]">Security Gate: </span>
                  <span className="text-[#ff007f] font-bold text-[11px]">{tool.policy}</span>
                </div>
              </div>

              <div className="bg-black border-2 border-white/40 p-3 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Input Schema:</span>
                <pre className="text-[11px] text-[#ccff00] overflow-x-auto whitespace-pre-wrap max-h-36">
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

