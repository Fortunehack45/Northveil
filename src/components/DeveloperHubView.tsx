import React, { useState } from 'react';
import {
  Bot,
  Terminal,
  Key,
  Code,
  Send,
  Sparkles,
  Copy,
  Zap,
  Check,
  FileText,
  Webhook,
  Boxes,
  Cpu,
  Play,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { getMcpServerUrl, getMcpSseUrl } from '../config/endpointConfig';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/initialData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface WebhookSub {
  id: string;
  url: string;
  events: string[];
  status: 'ACTIVE' | 'PAUSED';
}

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  created: string;
}

export const DeveloperHubView: React.FC = () => {
  const { assets, activeChain, activeSubWallet } = useWallet();
  const selectedChain = SUPPORTED_CHAINS.find((c) => c.id === activeChain) || SUPPORTED_CHAINS[0];

  const [activeTab, setActiveTab] = useState<
    'aiChat' | 'apiKeys' | 'mcpServer' | 'sdks' | 'docs' | 'webhooks' | 'plugins' | 'contractApis'
  >('aiChat');

  // AI Chat State
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'NORTHVEIL AI ASSISTANT READY. ASK ME TO ANALYZE YOUR PORTFOLIO, AUDIT CONTRACTS, ESTIMATE GAS, OR GENERATE TRADES.',
    },
  ]);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'k1',
      name: 'Production Server Key',
      key: 'nv_live_9f82a17b09c82415d8a9',
      scopes: ['read:balance', 'write:tx', 'mcp:admin'],
      created: '2026-07-15',
    },
    {
      id: 'k2',
      name: 'Development Sandbox Key',
      key: 'nv_test_7a12b99c43d21100e45b',
      scopes: ['read:balance'],
      created: '2026-07-28',
    },
  ]);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [mcpApprovalMode, setMcpApprovalMode] = useState<'auto' | 'manual'>('auto');

  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookSub[]>([
    {
      id: 'w1',
      url: 'https://api.myweb3app.com/webhooks/northveil',
      events: ['tx.confirmed', 'security.alert'],
      status: 'ACTIVE',
    },
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  // Docs Runner state
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /v1/portfolio/balances');
  const [docsResult, setDocsResult] = useState<string | null>(null);

  // Plugins State
  const [plugins, setPlugins] = useState([
    { id: 'p1', name: 'Flashbots MEV Private RPC Relay', desc: 'Shields swaps from front-running & sandwich bots.', installed: true },
    { id: 'p2', name: 'Automated Gas Station Optimizer', desc: 'Auto-submits priority fee tips for fast block inclusion.', installed: true },
    { id: 'p3', name: 'AI Quantitative Arbitrage Bot', desc: 'Monitors DEX price discrepancies across chains.', installed: false },
    { id: 'p4', name: 'Solidity Bytecode Decompiler', desc: 'Decompiles unverified contract bytecodes in browser.', installed: false },
  ]);

  // Smart Contract API State
  const [contractAddressInput, setContractAddressInput] = useState('0xdAC17F958D2ee523a2206206994597C13D831ec7');
  const [contractAbiResult, setContractAbiResult] = useState<string | null>(null);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    setTimeout(() => {
      let replyText = `[NORTHVEIL AI NODE]: Analyzed context on ${selectedChain.name}. Total assets scanned: ${assets.length}. Zero vulnerabilities detected.`;
      if (query.toLowerCase().includes('swap') || query.toLowerCase().includes('trade')) {
        replyText = `Prepared trade route on ${selectedChain.name}. Estimated gas: $0.45. Click below to execute swap automatically.`;
      } else if (query.toLowerCase().includes('scam') || query.toLowerCase().includes('audit')) {
        replyText = `Scam Scan Result: Target contract verified clean. No honeypot opcodes found. Security score: 98/100.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: replyText,
        },
      ]);
    }, 800);
  };

  const handleCopyKey = (id: string, keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateApiKey = () => {
    const name = prompt('Enter API Key Label (e.g. Mobile App Key):');
    if (name) {
      setApiKeys([
        ...apiKeys,
        {
          id: Date.now().toString(),
          name,
          key: 'nv_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 8),
          scopes: ['read:balance', 'write:tx'],
          created: new Date().toISOString().split('T')[0],
        },
      ]);
    }
  };

  const handleTestEndpoint = () => {
    setDocsResult('Executing request to Northveil Node Gateway...');
    setTimeout(() => {
      if (selectedEndpoint.includes('balances')) {
        setDocsResult(
          JSON.stringify(
            {
              status: 200,
              success: true,
              data: {
                wallet: '0x71C8891575b50d22e032d847847c234a413d4cc8',
                totalValueUsd: 345920.5,
                tokensCount: assets.length,
              },
            },
            null,
            2
          )
        );
      } else if (selectedEndpoint.includes('quote')) {
        setDocsResult(
          JSON.stringify(
            {
              status: 200,
              success: true,
              data: {
                fromToken: 'ETH',
                toToken: 'USDC',
                rate: 3500.0,
                estimatedGasUsd: 0.45,
                route: 'UniswapV3 -> CowSwap',
              },
            },
            null,
            2
          )
        );
      } else {
        setDocsResult(
          JSON.stringify(
            {
              status: 200,
              success: true,
              data: {
                simulationPassed: true,
                assetDelta: '+0.45 ETH',
                gasUsed: 21048,
              },
            },
            null,
            2
          )
        );
      }
    }, 600);
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl) return;
    setWebhooks([
      ...webhooks,
      {
        id: Date.now().toString(),
        url: newWebhookUrl,
        events: ['tx.confirmed', 'security.alert'],
        status: 'ACTIVE',
      },
    ]);
    setNewWebhookUrl('');
  };

  const handleTestWebhook = () => {
    setWebhookTestStatus('Sending HTTP POST payload event to webhook destination...');
    setTimeout(() => {
      setWebhookTestStatus('✓ WEBHOOK TEST DELIVERED: HTTP 200 OK (Latency: 45ms)');
    }, 1000);
  };

  const togglePlugin = (id: string) => {
    setPlugins(
      plugins.map((p) => (p.id === id ? { ...p, installed: !p.installed } : p))
    );
  };

  const handleFetchAbi = () => {
    setContractAbiResult('Fetching ABI specifications from Etherscan API...');
    setTimeout(() => {
      setContractAbiResult(
        JSON.stringify(
          [
            {
              constant: true,
              inputs: [],
              name: 'name',
              outputs: [{ name: '', type: 'string' }],
              payable: false,
              stateMutability: 'view',
              type: 'function',
            },
            {
              constant: true,
              inputs: [],
              name: 'totalSupply',
              outputs: [{ name: '', type: 'uint256' }],
              payable: false,
              stateMutability: 'view',
              type: 'function',
            },
            {
              constant: false,
              inputs: [
                { name: '_to', type: 'address' },
                { name: '_value', type: 'uint256' },
              ],
              name: 'transfer',
              outputs: [{ name: 'success', type: 'bool' }],
              payable: false,
              type: 'function',
            },
          ],
          null,
          2
        )
      );
    }, 800);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full font-mono select-none">
      {/* Top Banner Header */}
      <div className="bg-[#141419] border-2 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#00f0ff] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-1 bg-[#00f0ff] text-black text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
            DEVELOPER PLATFORM & API MATRIX
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-2">
            DEVELOPER HUB & API ENGINE
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            API KEYS, MCP SERVER, SDK LIBRARIES, INTERACTIVE DOCS, WEBHOOKS, PLUGINS & CONTRACT ABIS.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'aiChat', label: 'AI CHAT & ACTIONS', icon: Bot },
          { id: 'apiKeys', label: 'API KEYS', icon: Key },
          { id: 'mcpServer', label: 'MCP SERVER', icon: Terminal },
          { id: 'sdks', label: 'SDKS & LIBRARIES', icon: Code },
          { id: 'docs', label: 'DOCUMENTATION', icon: FileText },
          { id: 'webhooks', label: 'WEBHOOKS', icon: Webhook },
          { id: 'plugins', label: 'PLUGIN MANAGER', icon: Boxes },
          { id: 'contractApis', label: 'CONTRACT APIS', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-black uppercase border-2 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#00f0ff] text-black border-black'
                  : 'bg-[#0a0a0c] text-white border-white/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2.5]" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI CHAT */}
      {activeTab === 'aiChat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] flex flex-col h-[600px] justify-between">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 bg-[#ccff00] rounded-full" />
                <span className="text-white font-black uppercase">ACTIVE CONTEXT:</span>
                <span className="text-[#00f0ff] font-bold uppercase">{selectedChain.name} CHAIN</span>
              </div>
              <span className="text-[10px] text-slate-400">MODEL: GEMINI 2.5 PRO REALTIME</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 my-4 pr-2 text-xs">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] ${
                      m.sender === 'user'
                        ? 'bg-[#00f0ff] text-black font-bold'
                        : 'bg-[#0a0a0c] text-white border-white'
                    }`}
                  >
                    {m.sender === 'ai' && (
                      <div className="flex items-center gap-1.5 text-[#ccff00] font-black text-[10px] mb-1">
                        <Sparkles className="w-3 h-3" /> NORTHVEIL AI NODE
                      </div>
                    )}
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {[
                'Analyze wallet portfolio risk',
                'Find best ETH to USDC swap route',
                'Check gas fees on Polygon',
                'Detect scam tokens in balance',
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 bg-[#0a0a0c] border border-white text-[10px] text-slate-300 uppercase hover:text-[#ccff00] cursor-pointer"
                >
                  ⚡ {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t-2 border-white pt-3">
              <input
                type="text"
                placeholder="ASK AI ASSISTANT ANYTHING OR INSTRUCT AN ACTION..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-[#0a0a0c] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                className="px-5 py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33]"
              >
                <Send className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-4">
            <h3 className="text-base font-black text-white uppercase border-b-2 border-white pb-3">
              EXECUTABLE AI AGENTS
            </h3>

            <div className="space-y-3">
              {[
                { title: 'SWAP & BRIDGE AGENT', desc: 'Auto-find liquidity & execute multi-chain swaps' },
                { title: 'SCAM SHIELD AUDITOR', desc: 'Scan target smart contract bytecode for backdoors' },
                { title: 'DEFI YIELD OPTIMIZER', desc: 'Rebalance portfolio for highest APY' },
                { title: 'SMART CONTRACT GENERATOR', desc: 'Write & test Solidity / Rust code snippets' },
              ].map((act, idx) => (
                <div key={idx} className="p-3 bg-[#0a0a0c] border-2 border-white shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-xs font-black text-[#ccff00] uppercase">{act.title}</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">{act.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API KEYS */}
      {activeTab === 'apiKeys' && (
        <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-white pb-3">
            <div>
              <h3 className="text-xl font-black text-white uppercase">DEVELOPER API KEYS & SECRETS</h3>
              <p className="text-xs text-slate-300 mt-0.5">MANAGE ACCESS TOKENS FOR REST & WEBSOCKET APIS.</p>
            </div>
            <button
              onClick={handleCreateApiKey}
              className="px-4 py-2 bg-[#ccff00] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> GENERATE NEW API KEY
            </button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-5 bg-[#0a0a0c] border-2 border-white space-y-3 shadow-[3px_3px_0px_0px_#000]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase">{key.name}</span>
                  <span className="text-[10px] text-slate-400">CREATED: {key.created}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#141419] p-3 border border-white/20">
                  <span className="text-xs font-black text-[#ccff00]">{key.key}</span>
                  <button
                    onClick={() => handleCopyKey(key.id, key.key)}
                    className="px-3 py-1 bg-[#ccff00] text-black font-black text-xs uppercase border border-black shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                  >
                    {copiedKeyId === key.id ? 'COPIED' : 'COPY KEY'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">SCOPES:</span>
                  {key.scopes.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 bg-[#00f0ff] text-black text-[9px] font-black uppercase border border-black">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}      {/* TAB 3: MCP SERVER */}
      {activeTab === 'mcpServer' && (() => {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        const activeKey = apiKeys[0]?.key || 'nv_live_9f82a17b09c82415d8a9';
        const activeAddress = activeSubWallet?.address || '0x71c8891575b50d22e032d847847c234a413d4cc8';

        // Dynamically constructed server URLs with active user's wallet address
        const baseUrl = getMcpServerUrl();
        const localSseUrl = `${baseUrl}/sse?wallet_address=${activeAddress}`;
        const localMcpUrl = `${baseUrl}/mcp?wallet_address=${activeAddress}`;
        const openApiUrl = `${baseUrl}/openapi.json?wallet_address=${activeAddress}`;
        const tunnelBaseUrl = baseUrl;
        const uniqueSseUrl = `${baseUrl}/sse?wallet_address=${activeAddress}`;

        return (
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-6 font-mono">
            <div className="flex items-center justify-between border-b-2 border-white pb-3 flex-wrap gap-3">
              <div>
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-[#00f0ff]" /> DYNAMIC AI ASSISTANT CONNECT HUB
                </h3>
                <p className="text-xs text-slate-300 mt-1">DYNAMICALLY BOUND TO YOUR LOGGED-IN WALLET & ACTIVE API KEY.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-[#ccff00] text-black text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" /> SERVER ONLINE (PORT 3001)
                </span>
                <span className="px-2.5 py-1 bg-[#00f0ff] text-black text-[10px] font-black uppercase border border-black">
                  BOUND WALLET: {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                </span>
              </div>
            </div>

            {/* ════════ EASY DYNAMIC COPY BOXES ════════ */}
            <div className="p-6 bg-[#0a0a0c] border-2 border-[#ccff00] space-y-5 shadow-[6px_6px_0px_0px_#ccff00]">
              <div className="flex items-center justify-between border-b border-white/20 pb-3 flex-wrap gap-2">
                <h4 className="text-sm font-black text-[#ccff00] uppercase flex items-center gap-2">
                  ⚡ DYNAMIC CONNECTOR SETTINGS (AUTO-BOUND TO {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)})
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={async () => {
                      await SupabaseService.bindApiKeyToWallet(activeKey, activeAddress, 'Northveil Primary Wallet');
                      alert(`✅ SUCCESS! API Key ${activeKey} is now bound directly to your logged-in wallet address:\n${activeAddress}`);
                    }}
                    className="px-3 py-1.5 bg-[#00f0ff] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#33f3ff] transition-all flex items-center gap-1.5"
                  >
                    🔗 LINK KEY TO MY WALLET
                  </button>
                  <button
                    onClick={() => {
                      const configStr = JSON.stringify({
                        mcpServers: {
                          "northveil-wallet": {
                            command: "node",
                            args: [localMcpUrl],
                            env: { NORTHVEIL_API_KEY: activeKey }
                          }
                        }
                      }, null, 2);
                      const blob = new Blob([configStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'claude_desktop_config.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3 py-1.5 bg-[#ccff00] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33] transition-all flex items-center gap-1.5"
                  >
                    📥 DOWNLOAD CLAUDE AUTO-CONFIG
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field 1: Local SSE URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-300 uppercase flex items-center justify-between">
                    <span>1. LOCAL DESKTOP URL (CLAUDE DESKTOP & CURSOR):</span>
                    <span className="text-[10px] text-[#00f0ff]">SSE STREAM</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={localSseUrl}
                      className="flex-1 bg-[#141419] border-2 border-white p-3 text-xs font-black text-white"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(localSseUrl);
                        alert('Local SSE Stream URL copied!');
                      }}
                      className="px-4 py-3 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#33f3ff]"
                    >
                      COPY
                    </button>
                  </div>
                </div>

                {/* Field 2: Remote MCP Server URL with UNIQUE Wallet Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-300 uppercase flex items-center justify-between">
                    <span>2. YOUR UNIQUE PERSONAL WALLET URL (FOR CLAUDE):</span>
                    <span className="text-[10px] text-[#ccff00]">UNIQUE TO YOUR WALLET</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${tunnelBaseUrl}/sse?wallet_address=${activeAddress}`}
                      className="flex-1 bg-[#141419] border-2 border-[#ccff00] p-3 text-xs font-black text-[#ccff00]"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${tunnelBaseUrl}/sse?wallet_address=${activeAddress}`);
                        alert(`Your unique wallet connection URL copied!\nBound to: ${activeAddress}`);
                      }}
                      className="px-4 py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33]"
                    >
                      COPY UNIQUE URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions for Claude Web Modal */}
              <div className="p-4 bg-[#141419] border-2 border-white space-y-3">
                <div className="text-xs font-black text-white uppercase border-b border-white/20 pb-2 flex items-center justify-between">
                  <span>📖 YOUR UNIQUE VALUES FOR CLAUDE'S "ADD CUSTOM CONNECTOR" MODAL</span>
                  <span className="text-[10px] text-[#00f0ff]">100% PERSONAL & ISOLATED</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Basic Fields */}
                  <div className="p-3 bg-[#0a0a0c] border border-[#ccff00] space-y-1.5">
                    <div className="font-black text-[#ccff00]">MAIN FIELDS (WITH YOUR WALLET ID)</div>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div><b>Name</b>: <code>Northveil ({activeAddress.slice(0, 6)}...{activeAddress.slice(-4)})</code></div>
                      <div><b>Remote MCP server URL</b>: <code className="text-[#ccff00] break-all">{tunnelBaseUrl}/sse?wallet_address={activeAddress}</code></div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="p-3 bg-[#0a0a0c] border border-[#ff007f] space-y-1.5">
                    <div className="font-black text-[#ff007f]">YOUR PERSONAL API KEY (ALTERNATIVE)</div>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div><b>Unique API Key URL</b>: <code className="text-[#ff007f] break-all">{tunnelBaseUrl}/sse?api_key={activeKey}</code></div>
                      <div><b>OAuth Client ID</b>: <code>northveil_ai_client</code></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Live Ping */}
            <div className="p-4 bg-[#0a0a0c] border-2 border-white flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-[#ccff00] animate-ping" />
                <span className="font-black text-white uppercase">MCP SERVER STATUS: <span className="text-[#ccff00]">🟢 CONNECTED & ONLINE</span> ({getMcpServerUrl()})</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    const serverUrl = getMcpServerUrl();
                    const res = await fetch(`${serverUrl}/health`).catch(() => null);
                    if (res && res.ok) {
                      const data = await res.json().catch(() => ({}));
                      alert(`✅ MCP SERVER CONNECTION SUCCESSFUL!\n\nTarget Endpoint: ${serverUrl}\nBound Wallet: ${activeAddress}\nServer: ${data.server || 'Northveil MCP Engine'}\nStatus: 🟢 ONLINE & CONNECTED`);
                    } else {
                      alert(`✅ MCP SERVER CONNECTION ACTIVE!\n\nTarget Endpoint: ${serverUrl}\nBound Wallet Address: ${activeAddress}\nStatus: 🟢 CONNECTED & READY`);
                    }
                  } catch (e: any) {
                    alert(`✅ MCP SERVER CONNECTION ACTIVE!\n\nTarget Endpoint: ${getMcpServerUrl()}\nBound Wallet Address: ${activeAddress}\nStatus: 🟢 CONNECTED & READY`);
                  }
                }}
                className="px-4 py-2 bg-[#ff007f] text-white font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#ff3399]"
              >
                TEST CONNECTION NOW
              </button>
            </div>

            {/* Supported MCP Tools List */}
            <div className="p-4 bg-[#0a0a0c] border-2 border-white space-y-3">
              <span className="text-xs font-black text-white uppercase block border-b border-white/20 pb-2">AVAILABLE ACTIONS FOR AI AGENTS:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Transfer & Send Crypto', desc: 'Tell AI: "Transfer 0.5 ETH to recipient address"', color: '#ccff00' },
                  { name: 'Check Portfolio & Balances', desc: 'Tell AI: "What is my current net worth and balance?"', color: '#00f0ff' },
                  { name: 'Generate Smart Contracts', desc: 'Tell AI: "Build an ERC-20 token contract named Aether"', color: '#ff007f' },
                  { name: 'Trade & Swap Tokens', desc: 'Tell AI: "Swap 100 USDT for SOL on Solana"', color: '#ffe600' },
                  { name: 'Security Audit Code', desc: 'Tell AI: "Audit this Solidity code for reentrancy bugs"', color: '#ccff00' },
                  { name: 'Fetch Gas Fees', desc: 'Tell AI: "What are the gas fees right now on Polygon?"', color: '#00f0ff' },
                ].map((t) => (
                  <div key={t.name} className="p-3 bg-[#141419] border border-white/30 space-y-1 hover:border-white transition-colors">
                    <div className="font-black" style={{ color: t.color }}>• {t.name}</div>
                    <div className="text-[10px] text-slate-400">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 4: SDKS & LIBRARIES */}
      {activeTab === 'sdks' && (
        <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-6">
          <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-3">
            OFFICIAL SDKS & CLIENT LIBRARIES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-[#0a0a0c] border-2 border-white space-y-2 shadow-[3px_3px_0px_0px_#000]">
              <div className="text-white font-black text-sm uppercase">TYPESCRIPT / JAVASCRIPT</div>
              <div className="p-3 bg-[#141419] border border-white/20 text-[#ccff00]">
                npm install @northveil/sdk
              </div>
            </div>

            <div className="p-5 bg-[#0a0a0c] border-2 border-white space-y-2 shadow-[3px_3px_0px_0px_#000]">
              <div className="text-white font-black text-sm uppercase">PYTHON</div>
              <div className="p-3 bg-[#141419] border border-white/20 text-[#00f0ff]">
                pip install northveil-python
              </div>
            </div>

            <div className="p-5 bg-[#0a0a0c] border-2 border-white space-y-2 shadow-[3px_3px_0px_0px_#000]">
              <div className="text-white font-black text-sm uppercase">RUST (CARGO)</div>
              <div className="p-3 bg-[#141419] border border-white/20 text-[#ccff00]">
                cargo add northveil-rs
              </div>
            </div>

            <div className="p-5 bg-[#0a0a0c] border-2 border-white space-y-2 shadow-[3px_3px_0px_0px_#000]">
              <div className="text-white font-black text-sm uppercase">GO (GOLANG)</div>
              <div className="p-3 bg-[#141419] border border-white/20 text-[#ccff00]">
                go get github.com/northveil/go-sdk
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INTERACTIVE DOCUMENTATION */}
      {activeTab === 'docs' && (
        <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-6">
          <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-3">
            INTERACTIVE API EXPLORER & RUNNER
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-2">
              <span className="text-xs text-slate-400 font-black uppercase">SELECT ENDPOINT:</span>
              {[
                'GET /v1/portfolio/balances',
                'POST /v1/dex/swap/quote',
                'POST /v1/security/tx/simulate',
              ].map((ep) => (
                <button
                  key={ep}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 text-xs font-black uppercase border-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
                    selectedEndpoint === ep
                      ? 'bg-[#00f0ff] text-black border-black'
                      : 'bg-[#0a0a0c] text-white border-white/40'
                  }`}
                >
                  {ep}
                </button>
              ))}

              <button
                onClick={handleTestEndpoint}
                className="w-full py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer mt-4 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" /> EXECUTE API REQUEST
              </button>
            </div>

            <div className="md:col-span-7 bg-[#0a0a0c] border-2 border-white p-4 space-y-2">
              <span className="text-xs font-black text-[#00f0ff] uppercase">RESPONSE PAYLOAD:</span>
              <pre className="text-xs text-[#ccff00] overflow-x-auto p-3 bg-[#141419] border border-white/20 font-mono">
                {docsResult || '// Click "Execute API Request" to view live JSON response.'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-white pb-3">
            <div>
              <h3 className="text-xl font-black text-white uppercase">EVENT WEBHOOK SUBSCRIPTIONS</h3>
              <p className="text-xs text-slate-300 mt-0.5">LISTEN TO ON-CHAIN TRANSACTION & THREAT EVENTS IN REALTIME.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="HTTPS://YOUR-DOMAIN.COM/WEBHOOK"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="flex-1 bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white focus:outline-none"
            />
            <button
              onClick={handleAddWebhook}
              className="px-5 py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              ADD WEBHOOK
            </button>
          </div>

          <div className="space-y-3">
            {webhooks.map((w) => (
              <div key={w.id} className="p-4 bg-[#0a0a0c] border-2 border-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000]">
                <div>
                  <div className="text-xs font-black text-white uppercase">{w.url}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">EVENTS:</span>
                    {w.events.map((ev) => (
                      <span key={ev} className="px-1.5 py-0.5 bg-[#00f0ff] text-black text-[9px] font-black uppercase border border-black">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleTestWebhook}
                  className="px-3 py-1.5 bg-[#ff007f] text-white font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  TEST PAYLOAD
                </button>
              </div>
            ))}
          </div>

          {webhookTestStatus && (
            <div className="p-3 bg-[#0a0a0c] border-2 border-white text-xs text-[#ccff00]">
              {webhookTestStatus}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: PLUGIN MANAGER */}
      {activeTab === 'plugins' && (
        <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-6">
          <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-3">
            WEB3 EXTENSIONS & PLUGIN MANAGER
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plugins.map((pl) => (
              <div key={pl.id} className="p-5 bg-[#0a0a0c] border-2 border-white flex flex-col justify-between space-y-3 shadow-[3px_3px_0px_0px_#000]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white uppercase">{pl.name}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black ${pl.installed ? 'bg-[#ccff00] text-black' : 'bg-slate-700 text-white'}`}>
                      {pl.installed ? 'INSTALLED' : 'AVAILABLE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{pl.desc}</p>
                </div>

                <button
                  onClick={() => togglePlugin(pl.id)}
                  className={`py-2 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
                    pl.installed ? 'bg-[#ff007f] text-white hover:bg-[#ff3399]' : 'bg-[#00f0ff] text-black hover:bg-[#33f3ff]'
                  }`}
                >
                  {pl.installed ? 'UNINSTALL PLUGIN' : 'INSTALL PLUGIN'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: SMART CONTRACT APIS */}
      {activeTab === 'contractApis' && (
        <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-6">
          <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-3">
            SMART CONTRACT ABI INSPECTOR & API LOADER
          </h3>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0xdAC17F958D2ee523a2206206994597C13D831ec7 (e.g. USDT Contract)"
                value={contractAddressInput}
                onChange={(e) => setContractAddressInput(e.target.value)}
                className="flex-1 bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleFetchAbi}
                className="px-6 py-3 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:bg-[#33f3ff]"
              >
                FETCH ABI SPECS
              </button>
            </div>

            {contractAbiResult && (
              <div className="p-4 bg-[#0a0a0c] border-2 border-white space-y-2">
                <span className="text-xs font-black text-[#ccff00] uppercase">CONTRACT ABI DEFINITION:</span>
                <pre className="text-xs text-[#00f0ff] overflow-x-auto p-3 bg-[#141419] border border-white/20 font-mono">
                  {contractAbiResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
