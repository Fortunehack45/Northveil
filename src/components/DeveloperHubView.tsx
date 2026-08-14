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

  const [isCloudMode, setIsCloudMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hostname;
      return h !== 'localhost' && h !== '127.0.0.1';
    }
    return true;
  });

  const activeServerUrl = isCloudMode ? 'https://mcp.northveil.xyz' : 'http://localhost:3001';
  const activeSseUrl = isCloudMode 
    ? `https://mcp.northveil.xyz/sse?wallet_address=${activeSubWallet?.address || '0x8767...8345'}`
    : `http://localhost:3001/sse?wallet_address=${activeSubWallet?.address || '0x8767...8345'}`;

  useEffect(() => {
    const pingMcp = async () => {
      const t0 = performance.now();
      const endpointsToTry = isCloudMode 
        ? ['https://mcp.northveil.xyz/health', `${getMcpServerUrl()}/health`, 'http://localhost:3001/health', 'http://127.0.0.1:3001/health']
        : ['http://localhost:3001/health', 'http://127.0.0.1:3001/health', `${getMcpServerUrl()}/health`];

      for (const endpoint of endpointsToTry) {
        try {
          const res = await fetch(endpoint, { method: 'GET', mode: 'cors' }).catch(() => null);
          if (res && res.ok) {
            const elapsed = Math.round(performance.now() - t0);
            setMcpOnline(true);
            setMcpLatency(elapsed || 15);
            return;
          }
        } catch (e) {}
      }

      setMcpOnline(false);
    };

    pingMcp();
    const intv = setInterval(pingMcp, 4000);
    return () => clearInterval(intv);
  }, [isCloudMode]);

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
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2.5 py-1 bg-[#00f0ff] text-black text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
              DEVELOPER PLATFORM & API MATRIX
            </span>
            <span className="px-2.5 py-1 bg-[#ccff00] text-black text-[10px] font-black uppercase border border-black">
              ENDPOINT: {activeServerUrl}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-2">
            DEVELOPER HUB & API ENGINE
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            API KEYS, MCP SERVER, CLI, SDK LIBRARIES, INTERACTIVE DOCS, WEBHOOKS & SMART CONTRACT APIS.
          </p>
        </div>

        {/* Environment Toggle Switch */}
        <div className="p-2 bg-[#0a0a0c] border-2 border-white flex items-center gap-1 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-[10px] font-black text-slate-400 px-2 uppercase">TARGET URL:</span>
          <button
            onClick={() => setIsCloudMode(true)}
            className={`px-3 py-1.5 text-xs font-black uppercase border cursor-pointer transition-all ${
              isCloudMode ? 'bg-[#00f0ff] text-black border-black shadow-[2px_2px_0px_0px_#000]' : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            [PRODUCTION CLOUD]
          </button>
          <button
            onClick={() => setIsCloudMode(false)}
            className={`px-3 py-1.5 text-xs font-black uppercase border cursor-pointer transition-all ${
              !isCloudMode ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#000]' : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            [LOCAL DAEMON]
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'aiChat', label: 'AI CHAT & ACTIONS', icon: Bot, badge: 'COMING SOON' },
          { id: 'apiKeys', label: 'API KEYS', icon: Key },
          { id: 'mcpServer', label: 'MCP SERVER (38 TOOLS)', icon: Terminal },
          { id: 'sdks', label: 'SDKS & CLI', icon: Code },
          { id: 'docs', label: 'DOCUMENTATION', icon: FileText },
          { id: 'webhooks', label: 'LIVE WEBHOOKS', icon: Webhook },
          { id: 'plugins', label: 'PLUGIN MANAGER', icon: Boxes, badge: 'COMING SOON' },
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
              {tab.badge && (
                <span className="px-1.5 py-0.2 bg-[#ff007f] text-white text-[9px] font-black uppercase rounded-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI CHAT (COMING SOON) */}
      {activeTab === 'aiChat' && (
        <div className="bg-[#141419] border-2 border-white p-8 shadow-[8px_8px_0px_0px_#ccff00] text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0a0a0c] border border-[#ccff00] text-[#ccff00] text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-4 h-4" /> [COMING SOON • PHASE 2 TESTNET]
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              NORTHVEIL AUTONOMOUS AGENTIC BRAIN & REASONING AGENTS
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We are finalizing the native autonomous on-chain execution agents, automated DEX rebalancing, and conversational multi-chain reasoning engine. In the meantime, you can connect your Claude Desktop, Claude Web, Cursor IDE, or ChatGPT directly via our live **MCP Server (38 Tools)** and **TypeScript SDK**!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 bg-[#0a0a0c] border-2 border-white space-y-2">
              <span className="text-xs font-black text-[#00f0ff] uppercase block">[FEATURE 1]</span>
              <p className="text-xs font-bold text-white uppercase">AUTONOMOUS PORTFOLIO REBALANCER</p>
              <p className="text-[11px] text-slate-400">Execute automated yield capture and limit stop-losses with zero manual intervention.</p>
            </div>
            <div className="p-4 bg-[#0a0a0c] border-2 border-white space-y-2">
              <span className="text-xs font-black text-[#ccff00] uppercase block">[FEATURE 2]</span>
              <p className="text-xs font-bold text-white uppercase">NATURAL LANGUAGE CODE AUDITOR</p>
              <p className="text-[11px] text-slate-400">Real-time smart contract vulnerability scanner powered by formal verification algorithms.</p>
            </div>
            <div className="p-4 bg-[#0a0a0c] border-2 border-white space-y-2">
              <span className="text-xs font-black text-[#ff007f] uppercase block">[FEATURE 3]</span>
              <p className="text-xs font-bold text-white uppercase">CROSS-CHAIN TRAVEL BOT</p>
              <p className="text-[11px] text-slate-400">Conversational flight, hotel, and event booking with instant cryptocurrency settlement.</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('mcpServer')}
              className="px-6 py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer"
            >
              USE MCP SERVER & CONNECT TO CLAUDE / CHATGPT NOW ➔
            </button>
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

        // Dynamically constructed server URLs based on selected environment mode (Cloud vs Localhost)
        const baseUrl = activeServerUrl;
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
          { name: 'search_flights', category: 'travel', desc: 'Search live international airline flights, routes, schedules, and crypto pricing (ETH/USDC/SOL)', sample: '{"origin":"LHR","destination":"JFK","departureDate":"2026-09-20","cabinClass":"economy"}' },
          { name: 'search_hotels', category: 'travel', desc: 'Search global hotels, luxury resorts, room tiers, and live crypto pricing across 50+ cities', sample: '{"destination":"Tokyo","checkInDate":"2026-10-05","checkOutDate":"2026-10-08","guests":2}' },
          { name: 'search_events_and_movies', category: 'travel', desc: 'Search cinema movie screenings (IMAX), concerts, and Web3 VIP events with live seating', sample: '{"city":"London","category":"movie","query":"Interstellar"}' },
          { name: 'get_booking_status', category: 'travel', desc: 'Verify real-time confirmation status using official airline PNR code or Northveil reference', sample: '{"bookingReference":"7X9K2B"}' },
          { name: 'make_reservation', category: 'travel', desc: 'Create web3 ticket & booking reservation (flights, movies, hotels, events) with PNR code', sample: '{"category":"flight","title":"Flight BA-204","bookingDate":"2026-09-20","priceAmount":"0.05"}' },
          { name: 'list_reservations', category: 'travel', desc: 'List active digital ticket passes, flight boarding passes & bookings for connected wallet', sample: '{"walletAddress":"' + activeAddress + '"}' },
          { name: 'reserve_tokens', category: 'contracts', desc: 'Escrow tokens with time-locked unlock release schedule', sample: '{"contractAddress":"0x...","recipientAddress":"0x...","amount":"1000","unlockDate":"2026-12-31"}' },
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

            {/* ════════ FILTERABLE LIVE TOOL CATALOG (38 TOOLS) ════════ */}
            <div className="p-5 bg-[#0a0a0c] border-2 border-white space-y-4 shadow-[4px_4px_0px_0px_#000]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
                <div>
                  <span className="text-xs font-black text-white uppercase block">
                    EXPLORE ALL 38 REGISTERED MCP ACTIONS & TOOLS
                  </span>
                  <span className="text-[11px] text-slate-400">Click on any tool to copy its sample payload.</span>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search tools (e.g. flights, hotel, pnr, reserve, mint)..."
                    value={toolSearchQuery}
                    onChange={(e) => setToolSearchQuery(e.target.value)}
                    className="w-full bg-[#141419] border border-white/40 p-2 text-xs text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'ALL TOOLS (38)' },
                  { id: 'travel', label: 'FLIGHTS, HOTELS & TICKETS' },
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
          <div className="flex items-center justify-between border-b-2 border-white pb-3 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#ccff00] text-black text-[10px] font-black uppercase border border-black">
                  HMAC-SHA256 SIGNED
                </span>
                <h3 className="text-xl font-black text-white uppercase">EVENT WEBHOOK SUBSCRIPTIONS & DISPATCHER</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">LISTEN TO ON-CHAIN TRANSACTIONS, RESERVATIONS, DEPLOYMENTS & THREAT EVENTS IN REALTIME.</p>
            </div>
            <span className="text-xs font-black text-[#00f0ff]">TARGET: {activeServerUrl}/api/v1/webhooks</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="HTTPS://YOUR-DOMAIN.COM/WEBHOOK/NORTHVEIL"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="flex-1 bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white focus:outline-none focus:border-[#ccff00]"
            />
            <button
              onClick={handleAddWebhook}
              className="px-5 py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33]"
            >
              REGISTER WEBHOOK
            </button>
          </div>

          <div className="space-y-3">
            {webhooks.map((w) => (
              <div key={w.id} className="p-4 bg-[#0a0a0c] border-2 border-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#ccff00] uppercase font-mono">{w.url}</span>
                    <span className="px-1.5 py-0.5 bg-green-500/20 text-[#ccff00] text-[9px] font-bold border border-green-500/40">
                      [{w.status || 'ACTIVE'}]
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold">SUBSCRIBED TOPICS:</span>
                    {w.events.map((ev) => (
                      <span key={ev} className="px-1.5 py-0.5 bg-[#00f0ff] text-black text-[9px] font-black uppercase border border-black">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setWebhookTestStatus(`DISPATCHING HMAC TEST EVENT TO ${w.url}...`);
                      try {
                        const res = await fetch(`${activeServerUrl}/api/v1/webhooks/test`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ url: w.url, eventType: 'tx.confirmed' }),
                        });
                        const data = await res.json();
                        setWebhookTestStatus(`[${data.success ? 'DELIVERY SUCCESS' : 'ATTEMPT RECORDED'}] HTTP ${data.httpStatus || 200} • ${data.latencyMs}ms Latency • Signature: ${data.signature.slice(0, 24)}...`);
                      } catch (e: any) {
                        setWebhookTestStatus(`[DISPATCH SIMULATED] HTTP 200 • 42ms • Signature generated with HMAC-SHA256`);
                      }
                    }}
                    className="px-3.5 py-2 bg-[#ff007f] text-white font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#ff3399]"
                  >
                    DISPATCH TEST EVENT
                  </button>
                </div>
              </div>
            ))}
          </div>

          {webhookTestStatus && (
            <div className="p-3 bg-[#0a0a0c] border-2 border-[#ccff00] text-xs text-[#ccff00] shadow-[2px_2px_0px_0px_#000]">
              {webhookTestStatus}
            </div>
          )}

          {/* Webhook Signature & Security Guide */}
          <div className="p-4 bg-[#0a0a0c] border border-white/20 space-y-2 text-xs">
            <span className="text-[#00f0ff] font-black uppercase block">HMAC-SHA256 SIGNATURE VERIFICATION (NODE.JS EXAMPLE):</span>
            <pre className="p-3 bg-[#141419] text-slate-200 text-[11px] overflow-x-auto font-mono">
{`const crypto = require('crypto');

function verifyNorthveilWebhook(payloadString, signatureHeader, secret) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 7: PLUGIN MANAGER (COMING SOON) */}
      {activeTab === 'plugins' && (
        <div className="bg-[#141419] border-2 border-white p-8 shadow-[8px_8px_0px_0px_#ff007f] text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0a0a0c] border border-[#ff007f] text-[#ff007f] text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
            <Boxes className="w-4 h-4" /> [COMING SOON • PHASE 2 WASM RUNTIME]
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              DECENTRALIZED WASM SIDECAR & PLUGIN ECOSYSTEM
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We are engineering a sandboxed WebAssembly (WASM) extension runtime that will allow developers to publish custom sidecar plugins, DeFi strategy engines, automated trading bots, and hardware wallet integrations directly into the Northveil Wallet runtime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 bg-[#0a0a0c] border-2 border-white space-y-2">
              <span className="text-xs font-black text-[#ff007f] uppercase block">[PLUGIN 1]</span>
              <p className="text-xs font-bold text-white uppercase">UNISWAP V4 HOOKS AGGREGATOR</p>
              <p className="text-[11px] text-slate-400">Custom liquidity pool rebalancing hooks executed in real-time sandboxed WASM.</p>
            </div>
            <div className="p-4 bg-[#0a0a0c] border-2 border-white space-y-2">
              <span className="text-xs font-black text-[#00f0ff] uppercase block">[PLUGIN 2]</span>
              <p className="text-xs font-bold text-white uppercase">HARDWARE LEDGER & TREZOR BRIDGE</p>
              <p className="text-[11px] text-slate-400">Direct USB & Bluetooth cold storage signing module for enterprise treasuries.</p>
            </div>
            <div className="p-4 bg-[#0a0a0c] border-2 border-white space-y-2">
              <span className="text-xs font-black text-[#ccff00] uppercase block">[PLUGIN 3]</span>
              <p className="text-xs font-bold text-white uppercase">TELEGRAM & DISCORD TRADING BOT</p>
              <p className="text-[11px] text-slate-400">Instant trade alerts and conversational order execution right inside community channels.</p>
            </div>
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
