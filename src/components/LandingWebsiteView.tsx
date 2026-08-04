import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Bot,
  Terminal,
  Code2,
  Lock,
  Globe,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  HelpCircle,
  Key,
  Layers,
  ArrowLeftRight,
  Boxes,
  Activity,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { MCP_TOOLS } from '../../mcp-server/tools';

interface LandingWebsiteViewProps {
  onLaunchApp: () => void;
  onOpenDevHub: () => void;
}

export const LandingWebsiteView: React.FC<LandingWebsiteViewProps> = ({ onLaunchApp, onOpenDevHub }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'docs' | 'terms' | 'privacy'>('home');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('deploy_smart_contract');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeToolObj = MCP_TOOLS.find((t) => t.name === selectedTool) || MCP_TOOLS[0];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-mono brutal-grid-bg relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black">
      {/* ═════════════════════════════════════════════════════════════
          TOP NEO-BRUTALIST NAVIGATION HEADER
          ═════════════════════════════════════════════════════════════ */}
      <header className="w-full bg-[#141419] border-b-4 border-white px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_0_0_#00f0ff]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <img src="https://iili.io/CgBPBHv.jpg" alt="Northveil Logo" className="w-10 h-10 object-contain rounded-md border-2 border-black bg-black shadow-[3px_3px_0px_0px_#ccff00]" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
              NORTH<span className="text-[#ccff00]">VEIL</span>
            </h1>
            <span className="text-[9px] text-[#00f0ff] font-bold uppercase tracking-widest block -mt-1">
              AI-NATIVE WEB3 WALLET & MCP PROTOCOL
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          {[
            { id: 'home', label: 'OVERVIEW', icon: <Boxes className="w-3.5 h-3.5" /> },
            { id: 'docs', label: 'MCP & API DOCS', icon: <Bot className="w-3.5 h-3.5 text-[#00f0ff]" /> },
            { id: 'terms', label: 'TERMS OF SERVICE', icon: <FileText className="w-3.5 h-3.5 text-[#ccff00]" /> },
            { id: 'privacy', label: 'PRIVACY POLICY', icon: <Shield className="w-3.5 h-3.5 text-[#ff007f]" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#ccff00] text-black border-black shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-[#1a1a22] text-slate-300 border-white/20 hover:border-white hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* CTA Launch Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchApp}
            className="px-4 py-2 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>LAUNCH APP</span>
          </button>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════
          TAB 1: HOME MARKETING OVERVIEW
          ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'home' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-16">
          {/* HERO SECTION */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141419] border-2 border-[#ccff00] shadow-[3px_3px_0px_0px_#ccff00]">
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                <span className="text-xs font-black text-[#ccff00] uppercase tracking-wider">
                  V3.0 LIVE — ETHERS REAL RPC BROADCAST & MCP SSE PROTOCOL
                </span>
              </div>

              <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-none">
                THE MILITARY-GRADE <span className="bg-[#ccff00] text-black px-2 py-0.5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">MULTICHAIN</span> WALLET & AI AGENT PROTOCOL
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-mono">
                Northveil is an autonomous, self-custodial Web3 wallet infrastructure integrated natively with Model Context Protocol (MCP). Execute on-chain swaps, deploy smart contracts, and empower AI agents (Claude, ChatGPT, Cursor) with real blockchain control.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={onLaunchApp}
                  className="px-6 py-3.5 bg-[#00f0ff] text-black font-black text-sm uppercase border-2 border-black shadow-[5px_5px_0px_0px_#000] cursor-pointer hover:bg-[#33f3ff] transition-all flex items-center gap-2"
                >
                  <Zap className="w-5 h-5 fill-black" />
                  <span>OPEN WEB3 VAULT</span>
                </button>
                <button
                  onClick={() => setActiveTab('docs')}
                  className="px-6 py-3.5 bg-[#141419] text-white font-black text-sm uppercase border-2 border-white shadow-[5px_5px_0px_0px_#ccff00] cursor-pointer hover:bg-[#20202a] transition-all flex items-center gap-2"
                >
                  <Bot className="w-5 h-5 text-[#ccff00]" />
                  <span>READ MCP API DOCS</span>
                </button>
              </div>

              {/* Stats Ticker */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t-2 border-white/20">
                <div className="p-3 bg-[#141419] border border-white/20">
                  <div className="text-[10px] text-slate-400 uppercase font-black">NETWORKS</div>
                  <div className="text-lg font-black text-[#00f0ff]">8 CHAINS</div>
                </div>
                <div className="p-3 bg-[#141419] border border-white/20">
                  <div className="text-[10px] text-slate-400 uppercase font-black">SECURITY</div>
                  <div className="text-lg font-black text-[#ccff00]">AES-256</div>
                </div>
                <div className="p-3 bg-[#141419] border border-white/20">
                  <div className="text-[10px] text-slate-400 uppercase font-black">AI AGENTS</div>
                  <div className="text-lg font-black text-[#ff007f]">MCP SSE</div>
                </div>
                <div className="p-3 bg-[#141419] border border-white/20">
                  <div className="text-[10px] text-slate-400 uppercase font-black">BLOCK TIME</div>
                  <div className="text-lg font-black text-white">REAL RPC</div>
                </div>
              </div>
            </div>

            {/* HERO VISUAL MOCKUP CARD */}
            <div className="lg:col-span-5">
              <div className="bg-[#141419] border-4 border-white p-6 shadow-[10px_10px_0px_0px_#00f0ff] space-y-4 relative">
                <div className="flex items-center justify-between border-b-2 border-white pb-3">
                  <div className="flex items-center gap-2">
                    <img src="https://iili.io/CgBPBHv.jpg" alt="Logo" className="w-7 h-7 rounded border border-white" />
                    <span className="text-xs font-black text-white uppercase">NORTHVEIL CONTROL CENTER</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#ccff00] text-black text-[10px] font-black uppercase border border-black">ONLINE</span>
                </div>

                <div className="p-4 bg-[#0a0a0c] border-2 border-[#ccff00] space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-black">PRIMARY BOUND VAULT</div>
                  <div className="text-xs text-white font-bold word-break-all font-mono">0x71C8891575b50d22e032d847847c234a413d4cc8</div>
                  <div className="text-2xl font-black text-[#ccff00]">$345,920.50 USD <span className="text-xs text-[#00f0ff]">🟢 +4.2%</span></div>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 bg-[#16161f] border border-white/20 flex justify-between items-center">
                    <span className="font-bold text-white">💎 Ethereum (ETH)</span>
                    <span className="text-[#00f0ff] font-black">45.20 ETH</span>
                  </div>
                  <div className="p-3 bg-[#16161f] border border-white/20 flex justify-between items-center">
                    <span className="font-bold text-white">🟠 Bitcoin (BTC)</span>
                    <span className="text-[#ccff00] font-black">0.25 BTC</span>
                  </div>
                  <div className="p-3 bg-[#16161f] border border-white/20 flex justify-between items-center">
                    <span className="font-bold text-white">🟣 Solana (SOL)</span>
                    <span className="text-[#ff007f] font-black">15.00 SOL</span>
                  </div>
                </div>

                <div className="p-3 bg-[#00f0ff] text-black font-black text-xs uppercase text-center border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  ⚡ CLAUDE MCP SSE PROTOCOL CONNECTED
                </div>
              </div>
            </div>
          </section>

          {/* FEATURE MATRIX GRID */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-[#ff007f] text-white text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                CORE ARCHITECTURE
              </span>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight">WHY NORTHVEIL LEADS THE WEB3 ERA</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#141419] border-4 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-4">
                <div className="w-12 h-12 bg-[#ccff00] border-2 border-black text-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#000]">
                  <Shield className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-lg font-black text-white uppercase">SELF-CUSTODIAL VAULT</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your seed phrase is encrypted client-side using military-grade AES-256-GCM. We never store private keys on external servers.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#141419] border-4 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-4">
                <div className="w-12 h-12 bg-[#00f0ff] border-2 border-black text-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#000]">
                  <Bot className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-lg font-black text-white uppercase">NATIVE MCP AI AGENTS</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect Anthropic Claude, ChatGPT, or Cursor to control your wallet, query portfolios, and deploy contracts over secure MCP SSE.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#141419] border-4 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-4">
                <div className="w-12 h-12 bg-[#ff007f] border-2 border-black text-white flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#000]">
                  <Code2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-lg font-black text-white uppercase">SMART CONTRACT STUDIO</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generate, audit, compile, and deploy Solidity smart contracts directly onto Ethereum & Sepolia testnets with automated verification.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ═════════════════════════════════════════════════════════════
          TAB 2: COMPLETE API & MCP DOCUMENTATION PORTAL
          ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'docs' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
          <div className="bg-[#141419] border-4 border-white p-8 shadow-[8px_8px_0px_0px_#00f0ff] space-y-4">
            <span className="px-3 py-1 bg-[#00f0ff] text-black text-xs font-black uppercase border border-black">
              DEVELOPER & AI AGENT SPECIFICATION
            </span>
            <h2 className="text-3xl font-black text-white uppercase">NORTHVEIL MCP PROTOCOL & REST API DOCS</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Northveil MCP Server exposes 11 real-time blockchain execution tools compliant with the official Model Context Protocol (v2024-11-05) standard and OpenAPI 3.0 specification.
            </p>
          </div>

          {/* Interactive Tool Documentation Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Tool List */}
            <div className="lg:col-span-4 bg-[#141419] border-4 border-white p-4 space-y-2 shadow-[6px_6px_0px_0px_#ccff00]">
              <div className="text-xs font-black text-[#ccff00] uppercase tracking-wider pb-2 border-b border-white/20">
                AVAILABLE MCP TOOLS ({MCP_TOOLS.length})
              </div>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                {MCP_TOOLS.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTool(t.name)}
                    className={`w-full text-left p-3 font-mono text-xs font-black uppercase border-2 transition-all cursor-pointer ${
                      selectedTool === t.name
                        ? 'bg-[#ccff00] text-black border-black shadow-[3px_3px_0px_0px_#000]'
                        : 'bg-[#0a0a0c] text-slate-300 border-white/10 hover:border-white hover:text-white'
                    }`}
                  >
                    <div className="truncate">⚡ {t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Tool Detail View */}
            <div className="lg:col-span-8 bg-[#141419] border-4 border-white p-6 space-y-6 shadow-[6px_6px_0px_0px_#00f0ff]">
              <div className="flex items-center justify-between border-b-2 border-white pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-xl font-black text-[#00f0ff] uppercase">TOOL: {activeToolObj.name}</h3>
                  <p className="text-xs text-slate-300 mt-1">{activeToolObj.description}</p>
                </div>
                <span className="px-2.5 py-1 bg-[#ccff00] text-black text-[10px] font-black uppercase border border-black">
                  MCP READY
                </span>
              </div>

              {/* Input Schema Parameters */}
              <div className="space-y-3">
                <div className="text-xs font-black text-white uppercase">INPUT SCHEMA PARAMETERS:</div>
                <div className="bg-[#0a0a0c] border-2 border-white/20 p-4 font-mono text-xs space-y-2">
                  {Object.keys(activeToolObj.inputSchema.properties).length > 0 ? (
                    Object.entries(activeToolObj.inputSchema.properties).map(([paramName, paramObj]) => (
                      <div key={paramName} className="border-b border-white/10 pb-2">
                        <div className="text-[#00f0ff] font-bold">
                          `{paramName}` <span className="text-slate-400">({paramObj.type})</span>
                        </div>
                        <div className="text-slate-300 text-[11px] mt-0.5">{paramObj.description}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic">No required parameters. Automatically operates on active session wallet.</div>
                  )}
                </div>
              </div>

              {/* Sample Request Payload */}
              <div className="space-y-2">
                <div className="text-xs font-black text-[#ccff00] uppercase">SAMPLE MCP JSON-RPC REQUEST:</div>
                <pre className="bg-[#0a0a0c] border-2 border-[#ccff00] p-4 text-xs font-mono text-[#ccff00] overflow-x-auto">
{JSON.stringify(
  {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: activeToolObj.name,
      arguments: Object.fromEntries(
        Object.keys(activeToolObj.inputSchema.properties).map((k) => [k, 'sample_value'])
      ),
    },
    id: 1,
  },
  null,
  2
)}
                </pre>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ═════════════════════════════════════════════════════════════
          TAB 3: PROFESSIONAL TERMS OF SERVICE PAGE
          ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'terms' && (
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
          <div className="bg-[#141419] border-4 border-white p-8 shadow-[8px_8px_0px_0px_#ccff00] space-y-3">
            <span className="px-3 py-1 bg-[#ccff00] text-black text-xs font-black uppercase border border-black">
              LEGAL DOCUMENTATION
            </span>
            <h2 className="text-3xl font-black text-white uppercase">TERMS OF SERVICE AGREEMENT</h2>
            <p className="text-xs text-slate-300 font-mono">LAST UPDATED: AUGUST 4, 2026 | VERSION 3.0</p>
          </div>

          <div className="bg-[#141419] border-4 border-white p-8 space-y-6 text-xs leading-relaxed text-slate-300 font-mono">
            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase">1. ACCEPTANCE OF TERMS</h3>
              <p>
                By accessing, using, or interacting with the Northveil Web3 Wallet application, Model Context Protocol (MCP) server endpoints, or associated smart contract tools, you explicitly agree to be bound by these Terms of Service.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase">2. SELF-CUSTODIAL NATURE & DISCLOSURE</h3>
              <p>
                Northveil is a strictly non-custodial software protocol. Users retain exclusive control over their private keys, seed phrases, and account credentials. Northveil developers do not maintain custody of funds, nor do we possess the technical capability to recover lost seed phrases or reverse on-chain transactions.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase">3. MODEL CONTEXT PROTOCOL (MCP) & AI AUTOMATION</h3>
              <p>
                When connecting third-party AI models (including Anthropic Claude, ChatGPT, or Cursor) to the Northveil MCP Server, you acknowledge that AI agents execute actions based on user prompts. You assume sole responsibility for reviewing and verifying AI-generated transaction parameters prior to broadcast.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase">4. BLOCKCHAIN IMMUTABILITY & RISKS</h3>
              <p>
                All smart contract executions, token swaps, and asset transfers occur directly on decentralized public blockchains (Ethereum, Polygon, Solana, Bitcoin). Transactions are irreversible once confirmed by network validators.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase">5. LIMITATION OF LIABILITY</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NORTHVEIL AND ITS DEVELOPERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM SMART CONTRACT DEPLOYMENTS, NETWORK CONGESTION, OR THIRD-PARTY API OUTAGES.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ═════════════════════════════════════════════════════════════
          TAB 4: COMPREHENSIVE PRIVACY POLICY PAGE
          ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'privacy' && (
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
          <div className="bg-[#141419] border-4 border-white p-8 shadow-[8px_8px_0px_0px_#ff007f] space-y-3">
            <span className="px-3 py-1 bg-[#ff007f] text-white text-xs font-black uppercase border border-black">
              ZERO-KNOWLEDGE PRIVACY
            </span>
            <h2 className="text-3xl font-black text-white uppercase">PRIVACY POLICY STATEMENT</h2>
            <p className="text-xs text-slate-300 font-mono">LAST UPDATED: AUGUST 4, 2026 | VERSION 3.0</p>
          </div>

          <div className="bg-[#141419] border-4 border-white p-8 space-y-6 text-xs leading-relaxed text-slate-300 font-mono">
            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase">1. ZERO PERSONAL IDENTIFIABLE INFORMATION (PII)</h3>
              <p>
                Northveil does not collect, store, or track Personally Identifiable Information (PII) such as real names, email addresses, phone numbers, or government ID documents.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase">2. LOCAL CLIENT-SIDE KEY STORAGE</h3>
              <p>
                Your wallet seed phrases and private keys are encrypted locally within your browser using AES-256-GCM encryption. Unencrypted private key material is never transmitted across the network or stored in external databases.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase">3. SUPABASE CLOUD DATABASE TELEMETRY</h3>
              <p>
                To provide seamless multi-device state synchronization and MCP tool execution logs, public wallet addresses and non-sensitive API activity logs are synced with our Supabase Cloud database infrastructure.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-white uppercase">4. COOKIES & TRACKING TECHNOLOGIES</h3>
              <p>
                Northveil utilizes local storage (`localStorage`) solely for persisting user preferences, active network selections, and encrypted vault parameters. We do not use third-party tracking cookies or advertising pixels.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ═════════════════════════════════════════════════════════════
          FOOTER SECTION
          ═════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#141419] border-t-4 border-white px-4 sm:px-8 py-8 mt-16 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="https://iili.io/CgBPBHv.jpg" alt="Logo" className="w-8 h-8 rounded border border-white" />
            <div>
              <div className="font-black text-white uppercase">NORTHVEIL WEB3 & MCP AGENT PROTOCOL</div>
              <div className="text-[10px] text-slate-400">MILITARY-GRADE SELF-CUSTODIAL INFRASTRUCTURE</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold">
            <button onClick={() => setActiveTab('docs')} className="text-[#00f0ff] hover:underline cursor-pointer">
              MCP DOCS
            </button>
            <button onClick={() => setActiveTab('terms')} className="text-[#ccff00] hover:underline cursor-pointer">
              TERMS OF SERVICE
            </button>
            <button onClick={() => setActiveTab('privacy')} className="text-[#ff007f] hover:underline cursor-pointer">
              PRIVACY POLICY
            </button>
            <a href="https://github.com/Fortunehack45/Northveil" target="_blank" rel="noreferrer" className="text-white hover:underline flex items-center gap-1">
              <span>GITHUB</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
