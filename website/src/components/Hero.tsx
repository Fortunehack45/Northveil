import React, { useState } from 'react';
import { Cpu, Terminal, Shield, Check, Copy, ArrowRight, Activity, Globe, Zap, Layers, Lock, Server, CheckCircle2, ShieldCheck, FileText, ChevronRight, Code } from 'lucide-react';
import { getMcpSseUrl } from '../config/endpointConfig';

interface HeroProps {
  onExploreMcp: () => void;
  onExploreApi: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMcp, onExploreApi }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const mcpSseUrl = getMcpSseUrl();

  const copySseUrl = () => {
    navigator.clipboard.writeText(mcpSseUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const chainMatrix = [
    { name: 'Ethereum Mainnet', type: 'EVM Layer 1', status: 'LIVE RPC', badge: '#ccff00' },
    { name: 'Ethereum Sepolia', type: 'EVM Testnet', status: 'LIVE RPC', badge: '#00f0ff' },
    { name: 'Polygon PoS', type: 'EVM Layer 2', status: 'LIVE RPC', badge: '#ff007f' },
    { name: 'Arbitrum One', type: 'EVM Rollup', status: 'LIVE RPC', badge: '#ccff00' },
    { name: 'Optimism Mainnet', type: 'EVM Rollup', status: 'LIVE RPC', badge: '#00f0ff' },
    { name: 'Base Layer 2', type: 'EVM Rollup', status: 'LIVE RPC', badge: '#ff007f' },
    { name: 'Solana Mainnet', type: 'Non-EVM (Ed25519)', status: 'LIVE RPC', badge: '#ccff00' },
    { name: 'Bitcoin Network', type: 'UTXO Native', status: 'LIVE INDEXER', badge: '#00f0ff' },
  ];

  const useCases = [
    {
      title: 'AI PORTFOLIO HEALTH AUDITING',
      desc: 'Claude and ChatGPT query live balances across EVM, Solana, and Bitcoin, computing overall risk metrics, asset allocation percentages, and 24h P&L.',
      icon: <Activity className="w-6 h-6 text-black stroke-[3]" />,
      color: '#ccff00'
    },
    {
      title: 'AUTOMATED DEX SWAP ROUTING',
      desc: 'AI agents fetch real-time 1inch EVM and Jupiter Solana DEX liquidity quotes, checking price impact and minimum received amounts before proposing transactions.',
      icon: <Zap className="w-6 h-6 text-black stroke-[3]" />,
      color: '#00f0ff'
    },
    {
      title: 'SMART CONTRACT GENERATION & DEPLOYMENT',
      desc: 'Generate OpenZeppelin Solidity smart contracts via AI prompt, compile, run static audit security scans, and deploy directly to Sepolia or Ethereum Mainnet.',
      icon: <Code className="w-6 h-6 text-[#ff007f] stroke-[3]" />,
      color: '#0a0a0c'
    },
    {
      title: 'EIP-1559 GAS FEE OPTIMIZATION',
      desc: 'Query live base fees and priority fee tips directly from connected JSON-RPC nodes to optimize execution speed and prevent stuck transactions.',
      icon: <Server className="w-6 h-6 text-black stroke-[3]" />,
      color: '#ccff00'
    }
  ];

  return (
    <div className="relative pt-6 pb-20 px-2 sm:px-4 bg-[#0a0a0c] brutal-grid text-left font-mono">
      <div className="max-w-[96%] mx-auto space-y-12">
        
        {/* HERO POSTER BANNER */}
        <div className="bg-[#ccff00] text-black border-4 border-black p-6 sm:p-12 shadow-[8px_8px_0px_0px_#00f0ff] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-black uppercase border-b-3 border-black pb-4">
            <span className="bg-black text-[#ccff00] px-3 py-1 border border-black">
              REAL ON-CHAIN BROADCAST ENGINE
            </span>
            <span className="bg-white text-black px-3 py-1 border border-black">
              MCP SSE STREAMING CONNECTED
            </span>
          </div>

          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black text-black uppercase tracking-tighter leading-[0.9]">
            NORTHVEIL IS... <br />
            <span className="bg-black text-[#ccff00] px-2 py-0.5 inline-block my-1">ON-CHAIN AI WALLET</span> <br />
            INFRASTRUCTURE.
          </h1>

          <p className="text-sm sm:text-base font-bold text-black max-w-5xl leading-relaxed border-t-3 border-black pt-4">
            NORTHVEIL CONNECTS ANTHROPIC CLAUDE WEB, CHATGPT ACTIONS, AND CURSOR IDE DIRECTLY TO REAL BLOCKCHAIN RPC NODES. EXECUTE MULTI-CHAIN PORTFOLIO ANALYTICS, TOKEN SWAPS, AND SMART CONTRACT DEPLOYMENTS WITH ZERO KNOWLEDGE SECURITY.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onExploreMcp}
              className="px-8 py-4 bg-black text-[#ccff00] font-black text-sm uppercase border-3 border-black shadow-[4px_4px_0px_0px_#ffffff] hover:bg-[#00f0ff] hover:text-black transition-all flex items-center gap-3 cursor-pointer"
            >
              <Cpu className="w-5 h-5 stroke-[3]" />
              <span>MCP AI SERVER MANUAL</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>

            <button
              onClick={onExploreApi}
              className="px-8 py-4 bg-white text-black font-black text-sm uppercase border-3 border-black shadow-[4px_4px_0px_0px_#000000] hover:bg-[#ff007f] hover:text-white transition-all flex items-center gap-3 cursor-pointer"
            >
              <Terminal className="w-5 h-5 stroke-[3]" />
              <span>REST API SPECIFICATION</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: WHAT IS NORTHVEIL PROTOCOL? */}
        <section className="bg-[#141419] border-3 border-white p-6 sm:p-10 shadow-[8px_8px_0px_0px_#ccff00] space-y-6">
          <div className="border-b-3 border-white/20 pb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-4xl font-black text-[#ccff00] uppercase tracking-tight flex items-center gap-3">
              <Globe className="w-7 h-7 text-[#ccff00] stroke-[3]" />
              <span>1. WHAT IS NORTHVEIL PROTOCOL?</span>
            </h2>
            <span className="bg-[#ccff00] text-black font-black px-3 py-1 text-xs border border-black uppercase">
              EXECUTIVE BRIEFING
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs sm:text-sm leading-relaxed text-slate-200">
            <div className="space-y-4">
              <p>
                Northveil is a dual-architecture Web3 system designed specifically for the era of Autonomous AI Coding Agents and LLM Assistants. It combines a <b>Zero-Knowledge Client-Side Web3 Wallet</b> with a <b>Multi-Tenant Model Context Protocol (MCP) AI Server</b>.
              </p>
              <p>
                While traditional crypto wallets isolate private keys inside static browser extensions, Northveil provides an open, authenticated protocol layer allowing AI models (like Claude 3.5 Sonnet, ChatGPT-4o, Devin, or Cursor) to safely read live on-chain data and propose signable transaction intents.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                Every action executed by an AI model is verified against multi-tier permission scopes (<code>read_only</code>, <code>transfer_enabled</code>, <code>contract_deploy_enabled</code>) and gated behind local in-app biometric/passcode confirmation to guarantee zero unauthorized fund movements.
              </p>
              <div className="bg-black border-2 border-[#00f0ff] p-4 text-[#00f0ff] font-bold space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" /> REAL BLOCKCHAIN RPC NODES (NO SIMULATIONS)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" /> NO HARDCODED FALLBACK WALLETS (STRICT HTTP 401 AUTH)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" /> 100% AES-256-GCM LOCAL VAULT ENCRYPTION
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: CORE SECURITY ARCHITECTURE */}
        <section className="space-y-6">
          <div className="border-b-3 border-white pb-3 flex items-center justify-between">
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-[#00f0ff] stroke-[3]" />
              <span>2. CORE SECURITY ARCHITECTURE</span>
            </h2>
            <span className="bg-[#00f0ff] text-black font-black px-3 py-1 text-xs border border-black uppercase">
              DEFENSE IN DEPTH
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-3">
              <div className="text-[#ccff00] text-xs font-black uppercase flex items-center gap-2">
                <Lock className="w-4 h-4 stroke-[3]" /> STEP 01 /// KEY ISOLATION
              </div>
              <h3 className="text-lg font-black text-white uppercase">ZERO-KNOWLEDGE VAULT</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unencrypted 12-word or 24-word seed phrases and private keys never leave local browser memory. Storage is encrypted via PBKDF2 (100k iterations) deriving 256-bit AES-GCM vault keys.
              </p>
            </div>

            <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-3">
              <div className="text-[#00f0ff] text-xs font-black uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 stroke-[3]" /> STEP 02 /// API SCOPING
              </div>
              <h3 className="text-lg font-black text-white uppercase">PERMISSIONED API KEYS</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                API keys (<code>nv_live_...</code>) enforce per-tool access boundaries. Unauthenticated calls respond with 401 Unauthorized; unauthorized tool scopes respond with 403 Forbidden.
              </p>
            </div>

            <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-3">
              <div className="text-[#ff007f] text-xs font-black uppercase flex items-center gap-2">
                <Shield className="w-4 h-4 stroke-[3]" /> STEP 03 /// INTENT PROPOSING
              </div>
              <h3 className="text-lg font-black text-white uppercase">SIGNABLE INTENT APPROVAL</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fund-moving AI tools return a signable unsigned intent payload. The transaction is pushed to your device for biometric confirmation before local broadcast.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: OPERATIONAL USE CASES */}
        <section className="space-y-6">
          <div className="border-b-3 border-white pb-3 flex items-center justify-between">
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Zap className="w-7 h-7 text-[#ff007f] stroke-[3]" />
              <span>3. OPERATIONAL USE CASES & AI INTEGRATIONS</span>
            </h2>
            <span className="bg-[#ff007f] text-white font-black px-3 py-1 text-xs border border-black uppercase">
              AI CAPABILITIES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((uc, idx) => (
              <div key={idx} className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-3">
                <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
                  <span className="text-xs font-black text-[#ccff00] uppercase">USE CASE 0{idx + 1}</span>
                  <div className="p-2 border border-black" style={{ backgroundColor: uc.color }}>
                    {uc.icon}
                  </div>
                </div>
                <h3 className="text-lg font-black text-white uppercase">{uc.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: SUPPORTED BLOCKCHAIN ECOSYSTEMS MATRIX */}
        <section className="bg-[#141419] border-3 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#00f0ff] space-y-6">
          <div className="border-b-3 border-white/20 pb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-4xl font-black text-[#00f0ff] uppercase tracking-tight flex items-center gap-3">
              <Layers className="w-7 h-7 text-[#00f0ff] stroke-[3]" />
              <span>4. SUPPORTED BLOCKCHAIN ECOSYSTEMS</span>
            </h2>
            <span className="bg-[#00f0ff] text-black font-black px-3 py-1 text-xs border border-black uppercase">
              22+ CHAINS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {chainMatrix.map((item, idx) => (
              <div key={idx} className="bg-black border-2 border-white p-4 space-y-2 shadow-[4px_4px_0px_0px_#ccff00]">
                <div className="flex items-center justify-between">
                  <span className="text-white font-black uppercase">{item.name}</span>
                  <span className="bg-[#ccff00] text-black font-black text-[9px] px-1.5 py-0.5 border border-black">
                    {item.status}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">{item.type}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: REMOTE MCP SSE ENDPOINT BANNER */}
        <div className="bg-[#00f0ff] text-black border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00] space-y-4">
          <div className="flex items-center justify-between text-xs font-black uppercase border-b-3 border-black pb-3">
            <span>REMOTE MCP SSE ENDPOINT URL (CLAUDE & CHATGPT CONNECTOR):</span>
            <span className="bg-black text-[#00f0ff] px-3 py-1 border border-black">HTTP 200 ONLINE</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 p-3.5 bg-black text-[#ccff00] font-bold text-xs sm:text-sm border-3 border-black overflow-x-auto">
              {mcpSseUrl}
            </code>
            <button
              onClick={copySseUrl}
              className="px-6 py-3.5 bg-black text-white hover:bg-[#ff007f] font-black text-xs uppercase border-3 border-black transition-all cursor-pointer flex items-center gap-2"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-[#ccff00] stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
              <span>{copiedUrl ? 'COPIED' : 'COPY URL'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
