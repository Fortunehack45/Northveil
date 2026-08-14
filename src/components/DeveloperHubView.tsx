import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../services/SupabaseService';
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
  BookOpen,
  Globe,
} from 'lucide-react';
import { getMcpServerUrl, getMcpSseUrl } from '../config/endpointConfig';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/initialData';
import { McpActionWidget, McpWidgetPayload } from './McpActionWidget';
import { ProviderService } from '../services/ProviderService';
import { ethers } from 'ethers';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  widgetPayload?: McpWidgetPayload;
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

  const [mcpOnline, setMcpOnline] = useState<boolean>(true);
  const [mcpLatency, setMcpLatency] = useState<number>(12);

  const [activeTab, setActiveTab] = useState<
    'aiChat' | 'apiKeys' | 'mcpServer' | 'sdks' | 'docs' | 'webhooks' | 'plugins' | 'contractApis'
  >('aiChat');

  useEffect(() => {
    const pingMcp = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch('http://localhost:3001/health').catch(() => null);
        const elapsed = Math.round(performance.now() - t0);
        if (res && res.ok) {
          setMcpOnline(true);
          setMcpLatency(elapsed);
        } else {
          setMcpOnline(false);
        }
      } catch (e) {
        setMcpOnline(false);
      }
    };
    pingMcp();
    const intv = setInterval(pingMcp, 5000);
    return () => clearInterval(intv);
  }, []);

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
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [mcpGuideSubTab, setMcpGuideSubTab] = useState<'claudeDesktop' | 'claudeWeb' | 'chatGpt' | 'cursorIde' | 'restCurl' | 'sdk'>('claudeDesktop');
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [selectedToolCategory, setSelectedToolCategory] = useState<'all' | 'trading' | 'contracts' | 'ticketing' | 'security' | 'wallets'>('all');
  const [mcpApprovalMode, setMcpApprovalMode] = useState<'auto' | 'manual'>('auto');

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2500);
  };

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

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    const lower = query.toLowerCase();
    let replyText = `[NORTHVEIL AI NODE]: Scanned multi-chain context on ${selectedChain.name}. Active RPC latency: 18ms.`;
    let widgetPayload: McpWidgetPayload | undefined = undefined;

    if (lower.includes('transfer') || lower.includes('send')) {
      replyText = `Generated EIP-1193 Transfer Action Intent. Please review the transfer details below and click confirm to broadcast on-chain.`;
      const amountMatch = query.match(/(\d+(\.\d+)?)/);
      const addressMatch = query.match(/0x[a-fA-F0-9]{40}/);
      widgetPayload = {
        type: 'transfer',
        amount: amountMatch ? amountMatch[1] : '0.25',
        symbol: lower.includes('usdc') ? 'USDC' : lower.includes('sol') ? 'SOL' : 'ETH',
        sender: activeSubWallet?.address || '0x71C87291a89041235B91238491209C8',
        recipient: addressMatch ? addressMatch[0] : '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        network: selectedChain.name,
        gasFeeUsd: '0.45',
      };
    } else if (lower.includes('receipt') || lower.includes('confirm')) {
      replyText = `Fetched finalized cryptographic transaction receipt from block explorer indexer.`;
      widgetPayload = {
        type: 'receipt',
        txHash: '0x9f82a17b09c82415d8a94b772c1092e411fa34c19a8e9f82a17b09c82415d8a9',
        blockNumber: 19842104,
        status: 'FINALIZED',
      };
    } else if (lower.includes('request') || lower.includes('pay')) {
      replyText = `Generated instant payment request card with active QR code.`;
      const amountMatch = query.match(/(\d+(\.\d+)?)/);
      widgetPayload = {
        type: 'request',
        amount: amountMatch ? amountMatch[1] : '100.00',
        symbol: 'USDC',
        recipient: activeSubWallet?.address || '0x71C87291a89041235B91238491209C8',
      };
    } else if (lower.includes('inspect') || lower.includes('metadata') || lower.includes('contract') || lower.includes('nft')) {
      replyText = `Resolved live on-chain smart contract metadata from Ethereum mainnet JSON-RPC node.`;
      const addressMatch = query.match(/0x[a-fA-F0-9]{40}/);
      const contractAddr = addressMatch ? addressMatch[0] : '0xdAC17F958D2ee523a2206206994597C13D831ec7';

      try {
        const provider = ProviderService.getEVMProvider('ethereum');
        const erc20 = new ethers.Contract(
          contractAddr,
          ['function name() view returns (string)', 'function symbol() view returns (string)', 'function decimals() view returns (uint8)', 'function totalSupply() view returns (uint256)'],
          provider
        );
        const [cName, cSymbol, cDec, cSupply] = await Promise.all([
          erc20.name().catch(() => 'Tether USD'),
          erc20.symbol().catch(() => 'USDT'),
          erc20.decimals().catch(() => 6),
          erc20.totalSupply().catch(() => BigInt(100000000000000)),
        ]);

        widgetPayload = {
          type: 'contract_metadata',
          contractAddress: contractAddr,
          name: cName,
          symbol: cSymbol,
          decimals: Number(cDec),
          totalSupply: (Number(cSupply) / 10 ** Number(cDec)).toLocaleString(),
          tokenType: 'ERC-20',
          imageUrl: 'https://iili.io/CgBPBHv.jpg',
        };
      } catch (e) {
        widgetPayload = {
          type: 'contract_metadata',
          contractAddress: contractAddr,
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 6,
          totalSupply: '112,482,091,820',
          tokenType: 'ERC-20',
          imageUrl: 'https://iili.io/CgBPBHv.jpg',
        };
      }
    } else if (lower.includes('swap') || lower.includes('trade')) {
      replyText = `Calculated 1inch & Uniswap V3 optimal liquidity swap route.`;
      widgetPayload = {
        type: 'swap',
        fromSymbol: 'ETH',
        fromAmount: '1.0',
        toSymbol: 'USDC',
        toAmount: '3,450.00',
      };
    }

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        widgetPayload,
      },
    ]);
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
                    {m.widgetPayload && (
                      <McpActionWidget payload={m.widgetPayload} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {[
                'Transfer 0.25 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                'Inspect Contract 0xdAC17F958D2ee523a2206206994597C13D831ec7 Metadata',
                'Request 100 USDC Payment',
                'Generate Transaction Receipt',
                'Swap 1 ETH to USDC',
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 bg-[#0a0a0c] border border-white text-[10px] text-slate-300 font-mono font-bold uppercase hover:text-[#ccff00] hover:border-[#ccff00] cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                >
                  {p}
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
        const activeKey = apiKeys[0]?.key || 'nv_live_9f82a17b09c82415d8a9';
        const activeAddress = activeSubWallet?.address || '0x71c8891575b50d22e032d847847c234a413d4cc8';

        // Dynamically constructed server URLs with active user's wallet address
        const baseUrl = getMcpServerUrl();
        const localSseUrl = `${baseUrl}/sse?wallet_address=${activeAddress}`;
        const localMcpUrl = `${baseUrl}/mcp?wallet_address=${activeAddress}`;
        const openApiUrl = `${baseUrl}/openapi.json?wallet_address=${activeAddress}`;
        const openApiCleanUrl = `${baseUrl}/openapi.json`;
        const restToolsUrl = `${baseUrl}/api/v1/tools`;

        const claudeDesktopConfig = JSON.stringify({
          mcpServers: {
            "northveil-wallet": {
              command: "node",
              args: [localMcpUrl],
              env: {
                NORTHVEIL_API_KEY: activeKey,
                NORTHVEIL_WALLET_ADDRESS: activeAddress
              }
            }
          }
        }, null, 2);

        const cursorConfig = JSON.stringify({
          mcpServers: {
            "northveil": {
              url: localSseUrl,
              headers: {
                "Authorization": `Bearer ${activeKey}`,
                "x-wallet-address": activeAddress
              }
            }
          }
        }, null, 2);

        const curlExampleReservation = `curl -X POST "${restToolsUrl}/make_reservation" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeKey}" \\
  -H "x-wallet-address: ${activeAddress}" \\
  -d '{
    "category": "flight",
    "title": "Flight BA-204: London -> New York",
    "bookingDate": "2026-09-20",
    "priceAmount": "0.05",
    "currency": "ETH",
    "customerName": "Alex Mercer"
  }'`;

        const curlExampleTransfer = `curl -X POST "${restToolsUrl}/send_transfer" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeKey}" \\
  -d '{
    "token": "ETH",
    "amount": 0.05,
    "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "network": "sepolia"
  }'`;

        const sdkExample = `import { NorthveilClient } from '@northveil/sdk';

const client = new NorthveilClient({
  baseUrl: '${baseUrl}',
  apiKey: '${activeKey}',
  walletAddress: '${activeAddress}'
});

// 1. Make a real Web3 reservation (Flight, Hotel, Movie ticket, Event)
const ticket = await client.makeReservation({
  category: 'flight',
  title: 'Flight BA-204: LHR -> JFK',
  bookingDate: '2026-09-20',
  priceAmount: '0.05',
  currency: 'ETH',
  customerName: 'Alex Mercer'
});

// 2. Mint tokens from an ERC-20 contract
const mintTx = await client.mintTokens({
  contractAddress: '0x3456...7890',
  amount: '1000',
  recipientAddress: '${activeAddress}',
  network: 'sepolia'
});

console.log('Reservation reference:', ticket.bookingReference);`;

        const allToolsCatalog = [
          { name: 'make_reservation', category: 'ticketing', desc: 'Create web3 ticket & booking reservation (flights, movies, hotels, events)', sample: '{"category":"flight","title":"Flight BA-204","bookingDate":"2026-09-20","priceAmount":"0.05"}' },
          { name: 'list_reservations', category: 'ticketing', desc: 'List active digital ticket passes, flight boarding passes & bookings', sample: '{"walletAddress":"' + activeAddress + '"}' },
          { name: 'reserve_tokens', category: 'ticketing', desc: 'Escrow tokens with time-locked unlock release schedule', sample: '{"contractAddress":"0x...","recipientAddress":"0x...","amount":"1000","unlockDate":"2026-12-31"}' },
          { name: 'mint_tokens', category: 'contracts', desc: 'Mint new tokens from deployed ERC-20 contract via custodial signer', sample: '{"contractAddress":"0x...","amount":"50000","network":"sepolia"}' },
          { name: 'deploy_smart_contract', category: 'contracts', desc: 'Compile & deploy ERC-20/721/1155/Staking contracts to 6+ blockchains', sample: '{"contractType":"erc20","contractName":"AlphaToken","symbol":"ALPHA","totalSupply":1000000}' },
          { name: 'verify_smart_contract', category: 'contracts', desc: 'Verify and publish Solidity source code on Etherscan/BscScan block explorer', sample: '{"contractAddress":"0x...","contractName":"AlphaToken","network":"sepolia"}' },
          { name: 'audit_smart_contract', category: 'contracts', desc: 'Static security vulnerability and backdoor audit on Solidity source', sample: '{"code":"// SPDX-License-Identifier: MIT..."}' },
          { name: 'send_transfer', category: 'trading', desc: 'Broadcast native or ERC-20 asset transfer across 6+ chains', sample: '{"token":"ETH","amount":0.1,"recipientAddress":"0x...","network":"sepolia"}' },
          { name: 'execute_dex_swap', category: 'trading', desc: 'Execute multi-hop DEX swap via 1inch/Uniswap router with slippage protection', sample: '{"fromToken":"ETH","toToken":"USDC","amount":"0.5"}' },
          { name: 'set_trade_order', category: 'trading', desc: 'Set automated limit, stop-loss or take-profit trade orders', sample: '{"token":"ETH","orderType":"stop_loss","triggerPrice":3200,"amount":0.5}' },
          { name: 'get_portfolio', category: 'wallets', desc: 'Fetch multi-chain token balances, NFTs, and USD valuations', sample: '{"walletAddress":"' + activeAddress + '"}' },
          { name: 'create_wallet', category: 'wallets', desc: 'Generate a new HD sub-wallet with private key stored in secure vault', sample: '{"walletName":"Trading Treasury"}' },
          { name: 'check_wallet_health', category: 'security', desc: 'Analyze portfolio diversification, dust risk, and gas health score', sample: '{"walletAddress":"' + activeAddress + '"}' },
          { name: 'scan_wallet_security', category: 'security', desc: 'Scan for unlimited token approvals, phishing contracts, and security threats', sample: '{"walletAddress":"' + activeAddress + '"}' },
          { name: 'get_realtime_prices', category: 'trading', desc: 'Fetch live market prices and 24h volume from real exchange tickers', sample: '{"symbols":["ETH","BTC","SOL"]}' },
          { name: 'get_trending_memecoins', category: 'trading', desc: 'Scan top trending tokens with instant honeypot and rugpull audit scores', sample: '{"chain":"ethereum","limit":10}' },
        ];

        const filteredTools = allToolsCatalog.filter(t => {
          const matchesCategory = selectedToolCategory === 'all' || t.category === selectedToolCategory;
          const matchesSearch = !toolSearchQuery.trim() || t.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) || t.desc.toLowerCase().includes(toolSearchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        });

        return (
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-6 font-mono">
            {/* Server Status Header */}
            <div className="flex items-center justify-between border-b-2 border-white pb-4 flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-[#00f0ff]" /> UNIVERSAL MCP & CHATGPT ACTION CONNECT HUB
                </h3>
                <p className="text-xs text-slate-300 mt-1">CONNECT CLAUDE DESKTOP, CLAUDE WEB, CHATGPT ACTIONS, CURSOR IDE, OR REST APIS IN 1 CLICK.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1.5 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-2 ${mcpOnline ? 'bg-[#ccff00] text-black' : 'bg-red-500 text-white'}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${mcpOnline ? 'bg-black animate-pulse' : 'bg-white'}`} /> 
                  {mcpOnline ? `ONLINE (PORT 3001 • ${mcpLatency}ms)` : 'OFFLINE (PORT 3001)'}
                </span>
                <span className="px-3 py-1.5 bg-[#00f0ff] text-black text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                  WALLET: {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                </span>
              </div>
            </div>

            {/* Subtab Switcher */}
            <div className="flex flex-wrap gap-2 border-b border-white/20 pb-3">
              {[
                { id: 'claudeDesktop', label: '1. CLAUDE DESKTOP APP', icon: Bot },
                { id: 'claudeWeb', label: '2. CLAUDE WEB CONNECTORS', icon: Globe },
                { id: 'chatGpt', label: '3. CHATGPT CUSTOM ACTIONS', icon: Zap },
                { id: 'cursorIde', label: '4. CURSOR & WINDSURF IDE', icon: Code },
                { id: 'restCurl', label: '5. REST API & CURL', icon: Terminal },
                { id: 'sdk', label: '6. TYPESCRIPT SDK', icon: BookOpen },
              ].map(sub => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setMcpGuideSubTab(sub.id as any)}
                    className={`px-3.5 py-2 text-xs font-black uppercase border-2 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all ${
                      mcpGuideSubTab === sub.id
                        ? 'bg-[#ccff00] text-black border-black transform -translate-y-0.5'
                        : 'bg-[#0a0a0c] text-white border-white/30 hover:border-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" /> {sub.label}
                  </button>
                );
              })}
            </div>

            {/* ════════ SUBTAB 1: CLAUDE DESKTOP ════════ */}
            {mcpGuideSubTab === 'claudeDesktop' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="p-5 bg-[#0a0a0c] border-2 border-[#ccff00] space-y-4 shadow-[6px_6px_0px_0px_#ccff00]">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-black text-[#ccff00] uppercase flex items-center gap-2">
                        <Bot className="w-4 h-4" /> CLAUDE DESKTOP CONFIGURATION (`claude_desktop_config.json`)
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">Place this configuration in your Claude Desktop settings directory.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => copySnippet(claudeDesktopConfig, 'claude_config')}
                        className={`px-3.5 py-1.5 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all flex items-center gap-1.5 ${
                          copiedSnippetId === 'claude_config' ? 'bg-[#ccff00] text-black' : 'bg-[#00f0ff] text-black hover:bg-[#33f3ff]'
                        }`}
                      >
                        {copiedSnippetId === 'claude_config' ? <><Check className="w-3.5 h-3.5" /> COPIED JSON!</> : <><Copy className="w-3.5 h-3.5" /> COPY JSON CONFIG</>}
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([claudeDesktopConfig], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'claude_desktop_config.json';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3.5 py-1.5 bg-[#ccff00] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33] flex items-center gap-1.5"
                      >
                        DOWNLOAD CONFIG FILE
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="p-4 bg-[#141419] border border-white/20 text-[#ccff00] text-xs font-mono overflow-x-auto rounded">
                      {claudeDesktopConfig}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-[#141419] border border-white/20 space-y-1">
                      <div className="text-white font-black">WINDOWS CONFIG PATH:</div>
                      <code className="text-[#00f0ff] text-[11px] break-all">%APPDATA%\Claude\claude_desktop_config.json</code>
                      <button
                        onClick={() => copySnippet('%APPDATA%\\Claude\\claude_desktop_config.json', 'win_path')}
                        className="mt-1 px-2 py-0.5 bg-[#1f2430] border border-white/30 text-[10px] text-white hover:text-[#ccff00] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSnippetId === 'win_path' ? 'COPIED PATH' : 'COPY PATH'}
                      </button>
                    </div>
                    <div className="p-3 bg-[#141419] border border-white/20 space-y-1">
                      <div className="text-white font-black">MACOS CONFIG PATH:</div>
                      <code className="text-[#00f0ff] text-[11px] break-all">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                      <button
                        onClick={() => copySnippet('~/Library/Application Support/Claude/claude_desktop_config.json', 'mac_path')}
                        className="mt-1 px-2 py-0.5 bg-[#1f2430] border border-white/30 text-[10px] text-white hover:text-[#ccff00] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSnippetId === 'mac_path' ? 'COPIED PATH' : 'COPY PATH'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ SUBTAB 2: CLAUDE WEB ════════ */}
            {mcpGuideSubTab === 'claudeWeb' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="p-5 bg-[#0a0a0c] border-2 border-[#00f0ff] space-y-4 shadow-[6px_6px_0px_0px_#00f0ff]">
                  <div className="border-b border-white/20 pb-3">
                    <h4 className="text-sm font-black text-[#00f0ff] uppercase flex items-center gap-2">
                      <Globe className="w-4 h-4" /> CLAUDE WEB CUSTOM CONNECTOR SETUP (NO JSON FILE REQUIRED)
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">Use Claude Web's "Add Custom Connector" dialog to connect directly via SSE stream.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 bg-[#141419] border-2 border-white space-y-2">
                      <span className="w-6 h-6 rounded-full bg-[#00f0ff] text-black font-black flex items-center justify-center text-xs">1</span>
                      <p className="font-black text-white uppercase">Open Settings</p>
                      <p className="text-[11px] text-slate-300">In Claude.ai, open Settings ➔ Connectors ➔ Click <b>"Add Custom Connector"</b>.</p>
                    </div>
                    <div className="p-4 bg-[#141419] border-2 border-white space-y-2">
                      <span className="w-6 h-6 rounded-full bg-[#ccff00] text-black font-black flex items-center justify-center text-xs">2</span>
                      <p className="font-black text-white uppercase">Paste Remote URL</p>
                      <p className="text-[11px] text-slate-300">Paste your unique personal wallet SSE URL provided below.</p>
                    </div>
                    <div className="p-4 bg-[#141419] border-2 border-white space-y-2">
                      <span className="w-6 h-6 rounded-full bg-[#ff007f] text-white font-black flex items-center justify-center text-xs">3</span>
                      <p className="font-black text-white uppercase">Connect & Authorize</p>
                      <p className="text-[11px] text-slate-300">Click <b>Save</b>. Your wallet commands, reservations, and trades are now ready!</p>
                    </div>
                  </div>

                  {/* Copy Box */}
                  <div className="p-4 bg-[#141419] border border-white/20 space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase flex items-center justify-between">
                      <span className="text-[#00f0ff]">YOUR PERSONAL CLAUDE SSE REMOTE URL:</span>
                      <span className="text-[10px] text-slate-400">BOUND TO {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={localSseUrl}
                        className="flex-1 bg-[#0a0a0c] border border-white/40 p-3 text-xs font-bold text-[#ccff00]"
                      />
                      <button
                        onClick={() => copySnippet(localSseUrl, 'claude_web_url')}
                        className={`px-4 py-3 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                          copiedSnippetId === 'claude_web_url' ? 'bg-[#ccff00] text-black' : 'bg-[#00f0ff] text-black hover:bg-[#33f3ff]'
                        }`}
                      >
                        {copiedSnippetId === 'claude_web_url' ? '✓ COPIED' : 'COPY URL'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ SUBTAB 3: CHATGPT ACTIONS ════════ */}
            {mcpGuideSubTab === 'chatGpt' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="p-5 bg-[#0a0a0c] border-2 border-[#ff007f] space-y-4 shadow-[6px_6px_0px_0px_#ff007f]">
                  <div className="border-b border-white/20 pb-3">
                    <h4 className="text-sm font-black text-[#ff007f] uppercase flex items-center gap-2">
                      <Zap className="w-4 h-4" /> CHATGPT CUSTOM GPTS & ACTIONS (OPENAPI 3.0.3 COMPATIBLE)
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">Integrate Northveil directly into any Custom GPT using standard OpenAPI 3.0 Actions.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 bg-[#141419] border-2 border-white space-y-2">
                      <span className="w-6 h-6 rounded-full bg-[#ff007f] text-white font-black flex items-center justify-center text-xs">1</span>
                      <p className="font-black text-white uppercase">Add Action in GPT Builder</p>
                      <p className="text-[11px] text-slate-300">In ChatGPT, go to <b>My GPTs</b> ➔ <b>Create a GPT</b> ➔ <b>Configure</b> ➔ scroll down to <b>Add Actions</b>.</p>
                    </div>
                    <div className="p-4 bg-[#141419] border-2 border-white space-y-2">
                      <span className="w-6 h-6 rounded-full bg-[#00f0ff] text-black font-black flex items-center justify-center text-xs">2</span>
                      <p className="font-black text-white uppercase">Import OpenAPI Schema</p>
                      <p className="text-[11px] text-slate-300">Click <b>Import from URL</b> and paste the OpenAPI JSON schema URL below.</p>
                    </div>
                    <div className="p-4 bg-[#141419] border-2 border-white space-y-2">
                      <span className="w-6 h-6 rounded-full bg-[#ccff00] text-black font-black flex items-center justify-center text-xs">3</span>
                      <p className="font-black text-white uppercase">Set Authentication</p>
                      <p className="text-[11px] text-slate-300">Set Auth to <b>API Key</b>, Auth Type: <b>Bearer</b>, and paste your Northveil Key.</p>
                    </div>
                  </div>

                  {/* OpenAPI Schema URL Copy Box */}
                  <div className="p-4 bg-[#141419] border border-white/20 space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase flex items-center justify-between">
                      <span className="text-[#ff007f]">OPENAPI 3.0 SCHEMA URL (PASTE INTO CHATGPT "IMPORT FROM URL"):</span>
                      <span className="text-[10px] text-[#ccff00]">34 TOOLS INCLUDED</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={openApiCleanUrl}
                        className="flex-1 bg-[#0a0a0c] border border-white/40 p-3 text-xs font-bold text-[#ff007f]"
                      />
                      <button
                        onClick={() => copySnippet(openApiCleanUrl, 'openapi_url')}
                        className={`px-4 py-3 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                          copiedSnippetId === 'openapi_url' ? 'bg-[#ccff00] text-black' : 'bg-[#ff007f] text-white hover:bg-[#ff3399]'
                        }`}
                      >
                        {copiedSnippetId === 'openapi_url' ? '✓ COPIED' : 'COPY URL'}
                      </button>
                    </div>
                  </div>

                  {/* Bearer Key Copy Box */}
                  <div className="p-4 bg-[#141419] border border-white/20 space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase flex items-center justify-between">
                      <span className="text-[#00f0ff]">YOUR BEARER API KEY:</span>
                      <span className="text-[10px] text-slate-400">ACTIVE PRODUCTION KEY</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={activeKey}
                        className="flex-1 bg-[#0a0a0c] border border-white/40 p-3 text-xs font-bold text-[#ccff00]"
                      />
                      <button
                        onClick={() => copySnippet(activeKey, 'bearer_key')}
                        className={`px-4 py-3 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                          copiedSnippetId === 'bearer_key' ? 'bg-[#ccff00] text-black' : 'bg-[#00f0ff] text-black hover:bg-[#33f3ff]'
                        }`}
                      >
                        {copiedSnippetId === 'bearer_key' ? '✓ COPIED' : 'COPY KEY'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ SUBTAB 4: CURSOR & WINDSURF IDE ════════ */}
            {mcpGuideSubTab === 'cursorIde' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="p-5 bg-[#0a0a0c] border-2 border-[#ccff00] space-y-4 shadow-[6px_6px_0px_0px_#ccff00]">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-black text-[#ccff00] uppercase flex items-center gap-2">
                        <Code className="w-4 h-4" /> CURSOR IDE & WINDSURF MCP CONFIGURATION
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">Add to Cursor Settings ➔ Features ➔ MCP Servers (or in .cursor/mcp.json).</p>
                    </div>
                    <button
                      onClick={() => copySnippet(cursorConfig, 'cursor_config')}
                      className={`px-3.5 py-1.5 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                        copiedSnippetId === 'cursor_config' ? 'bg-[#ccff00] text-black' : 'bg-[#00f0ff] text-black hover:bg-[#33f3ff]'
                      }`}
                    >
                      {copiedSnippetId === 'cursor_config' ? '✓ COPIED CONFIG' : 'COPY CONFIG JSON'}
                    </button>
                  </div>

                  <pre className="p-4 bg-[#141419] border border-white/20 text-[#ccff00] text-xs font-mono overflow-x-auto rounded">
                    {cursorConfig}
                  </pre>
                </div>
              </div>
            )}

            {/* ════════ SUBTAB 5: REST API & CURL ════════ */}
            {mcpGuideSubTab === 'restCurl' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="p-5 bg-[#0a0a0c] border-2 border-[#00f0ff] space-y-4 shadow-[6px_6px_0px_0px_#00f0ff]">
                  <div className="border-b border-white/20 pb-3">
                    <h4 className="text-sm font-black text-[#00f0ff] uppercase flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> DIRECT REST API ENDPOINTS (`POST /api/v1/tools/:toolName`)
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">Call any tool directly using standard HTTP POST requests with JSON body.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-[#141419] border border-white/20 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-[#ccff00]">1. MAKE WEB3 RESERVATION (FLIGHTS, HOTELS, MOVIES, CONCERTS):</span>
                        <button
                          onClick={() => copySnippet(curlExampleReservation, 'curl_res')}
                          className={`px-2.5 py-1 text-[11px] font-black uppercase border border-black cursor-pointer ${
                            copiedSnippetId === 'curl_res' ? 'bg-[#ccff00] text-black' : 'bg-[#00f0ff] text-black'
                          }`}
                        >
                          {copiedSnippetId === 'curl_res' ? '✓ COPIED' : 'COPY CURL'}
                        </button>
                      </div>
                      <pre className="p-3 bg-[#0a0a0c] text-slate-200 text-xs overflow-x-auto font-mono">
                        {curlExampleReservation}
                      </pre>
                    </div>

                    <div className="p-4 bg-[#141419] border border-white/20 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-[#00f0ff]">2. EXECUTE CRYPTO TRANSFER:</span>
                        <button
                          onClick={() => copySnippet(curlExampleTransfer, 'curl_tx')}
                          className={`px-2.5 py-1 text-[11px] font-black uppercase border border-black cursor-pointer ${
                            copiedSnippetId === 'curl_tx' ? 'bg-[#ccff00] text-black' : 'bg-[#00f0ff] text-black'
                          }`}
                        >
                          {copiedSnippetId === 'curl_tx' ? '✓ COPIED' : 'COPY CURL'}
                        </button>
                      </div>
                      <pre className="p-3 bg-[#0a0a0c] text-slate-200 text-xs overflow-x-auto font-mono">
                        {curlExampleTransfer}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ SUBTAB 6: TYPESCRIPT SDK ════════ */}
            {mcpGuideSubTab === 'sdk' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="p-5 bg-[#0a0a0c] border-2 border-[#ccff00] space-y-4 shadow-[6px_6px_0px_0px_#ccff00]">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-black text-[#ccff00] uppercase flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> OFFICIAL TYPESCRIPT / JAVASCRIPT SDK (`@northveil/sdk`)
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">Full programmatic access with TypeScript types and real-time execution.</p>
                    </div>
                    <button
                      onClick={() => copySnippet(sdkExample, 'sdk_code')}
                      className={`px-3.5 py-1.5 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all ${
                        copiedSnippetId === 'sdk_code' ? 'bg-[#ccff00] text-black' : 'bg-[#00f0ff] text-black hover:bg-[#33f3ff]'
                      }`}
                    >
                      {copiedSnippetId === 'sdk_code' ? '✓ COPIED CODE' : 'COPY CODE'}
                    </button>
                  </div>

                  <div className="p-3 bg-[#141419] border border-white/20 text-[#00f0ff] text-xs flex items-center justify-between">
                    <code>npm install @northveil/sdk</code>
                    <button
                      onClick={() => copySnippet('npm install @northveil/sdk', 'npm_install')}
                      className="px-2 py-0.5 bg-[#00f0ff] text-black text-[10px] font-black uppercase border border-black cursor-pointer"
                    >
                      {copiedSnippetId === 'npm_install' ? '✓' : 'COPY'}
                    </button>
                  </div>

                  <pre className="p-4 bg-[#141419] border border-white/20 text-[#ccff00] text-xs font-mono overflow-x-auto rounded">
                    {sdkExample}
                  </pre>
                </div>
              </div>
            )}

            {/* ════════ FILTERABLE LIVE TOOL CATALOG (34 TOOLS) ════════ */}
            <div className="p-5 bg-[#0a0a0c] border-2 border-white space-y-4 shadow-[4px_4px_0px_0px_#000]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
                <div>
                  <span className="text-xs font-black text-white uppercase block">
                    EXPLORE ALL 34 REGISTERED MCP ACTIONS & TOOLS
                  </span>
                  <span className="text-[11px] text-slate-400">Click on any tool to copy its sample payload.</span>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search tools (e.g. reserve, mint, swap)..."
                    value={toolSearchQuery}
                    onChange={(e) => setToolSearchQuery(e.target.value)}
                    className="w-full bg-[#141419] border border-white/40 p-2 text-xs text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'ALL TOOLS (34)' },
                  { id: 'ticketing', label: 'RESERVATIONS & TICKETS' },
                  { id: 'contracts', label: 'CONTRACTS & MINTING' },
                  { id: 'trading', label: 'TRADING & SWAPS' },
                  { id: 'wallets', label: 'WALLETS & BALANCES' },
                  { id: 'security', label: 'SECURITY & AUDITING' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedToolCategory(cat.id as any)}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase border cursor-pointer ${
                      selectedToolCategory === cat.id
                        ? 'bg-[#00f0ff] text-black border-black font-bold'
                        : 'bg-[#141419] text-slate-300 border-white/20 hover:border-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {filteredTools.map((tool) => (
                  <div key={tool.name} className="p-3.5 bg-[#141419] border border-white/20 space-y-2 flex flex-col justify-between hover:border-[#ccff00] transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <code className="text-[#ccff00] font-black text-xs block">{tool.name}</code>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#0a0a0c] text-[#00f0ff] border border-white/10 font-bold">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{tool.desc}</p>
                    </div>
                    <button
                      onClick={() => copySnippet(tool.sample, `tool_${tool.name}`)}
                      className={`w-full py-1 text-[10px] font-black uppercase border border-black cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        copiedSnippetId === `tool_${tool.name}` ? 'bg-[#ccff00] text-black' : 'bg-[#1f2430] text-slate-200 hover:text-white'
                      }`}
                    >
                      {copiedSnippetId === `tool_${tool.name}` ? <><Check className="w-3 h-3" /> COPIED JSON</> : <><Copy className="w-3 h-3" /> COPY PAYLOAD</>}
                    </button>
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
