import React, { useState } from 'react';
import { Terminal, Cpu, ShieldCheck, Zap, ArrowRight, Copy, Check, ExternalLink, Play, Layers } from 'lucide-react';

interface HeroProps {
  onExploreMcp: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMcp }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const mcpUrl = 'https://northveil.vercel.app/sse';

  return (
    <section className="relative pt-12 pb-20 px-4 sm:px-8 brutal-grid overflow-hidden border-b-4 border-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Headlines & High-Impact Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff007f] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            PROTOCOL V3.0 • MULTI-TENANT MCP SERVER ACTIVE
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tighter uppercase font-mono">
            MILITARY-GRADE <span className="bg-[#ccff00] text-black px-2 border-4 border-black shadow-[6px_6px_0px_0px_#ff007f] inline-block mt-2">WEB3 WALLET</span> & AI ENGINE
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-mono leading-relaxed max-w-2xl">
            Northveil is a non-custodial multi-chain crypto wallet and universal **Model Context Protocol (MCP) AI Server**. Connect your wallet directly to **Claude, ChatGPT, and Cursor** to execute real-time on-chain token transfers, smart contract deployments, and portfolio analytics via real Ethers.js RPC nodes.
          </p>

          {/* Action Button Row */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={onExploreMcp}
              className="px-6 py-4 bg-[#ccff00] text-black font-mono font-black text-sm uppercase border-4 border-black shadow-[6px_6px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-3"
            >
              <Cpu className="w-5 h-5" />
              <span>EXPLORE MCP SERVER DOCS</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-4 bg-[#141419] text-white font-mono font-black text-sm uppercase border-4 border-white shadow-[6px_6px_0px_0px_#00f0ff] cursor-pointer hover:bg-[#202028] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-3"
            >
              <Terminal className="w-5 h-5 text-[#00f0ff]" />
              <span>OPEN WEB WALLET</span>
            </a>
          </div>

          {/* Quick Copy Server SSE Endpoint */}
          <div className="p-4 bg-[#141419] border-2 border-[#00f0ff] shadow-[4px_4px_0px_0px_#00f0ff] space-y-2">
            <div className="text-xs font-black text-[#00f0ff] uppercase flex items-center justify-between">
              <span>📡 CLAUDE & CHATGPT SSE CONNECTOR ENDPOINT:</span>
              <span className="text-[10px] text-[#ccff00]">HTTPS ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={mcpUrl}
                className="flex-1 bg-[#0a0a0c] border border-white/30 p-2.5 text-xs text-[#ccff00] font-bold"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(mcpUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="px-4 py-2.5 bg-[#ccff00] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33]"
              >
                {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Neo-Brutalist Code & Widget Terminal */}
        <div className="lg:col-span-5">
          <div className="bg-[#141419] border-4 border-white p-6 shadow-[10px_10px_0px_0px_#ccff00] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff007f]" />
                <span className="w-3 h-3 rounded-full bg-[#ccff00]" />
                <span className="w-3 h-3 rounded-full bg-[#00f0ff]" />
                <span className="text-xs font-black text-white ml-2">NORTHVEIL SDK PLAYGROUND</span>
              </div>
              <span className="text-[10px] font-black text-[#ccff00] uppercase bg-[#000] px-2 py-0.5 border border-white/30">
                v1.0.0 TS
              </span>
            </div>

            {/* Code Snippet Box */}
            <div className="bg-[#0a0a0c] border-2 border-white/20 p-4 text-xs font-mono text-slate-300 space-y-2 overflow-x-auto">
              <div className="text-slate-500">// Initialize Northveil Web3 SDK</div>
              <div><span className="text-[#ff007f]">import</span> &#123; NorthveilSDK &#125; <span className="text-[#ff007f]">from</span> <span className="text-[#ccff00]">'@northveil/sdk'</span>;</div>
              <br />
              <div><span className="text-[#00f0ff]">const</span> sdk = <span className="text-[#ff007f]">new</span> <span className="text-[#ccff00]">NorthveilSDK</span>(&#123;</div>
              <div className="pl-4">apiKey: <span className="text-[#ccff00]">"nv_live_9f82a17b09c82415d8a9"</span>,</div>
              <div className="pl-4">walletAddress: <span className="text-[#ccff00]">"0x71C8891575b50d22..."</span></div>
              <div>&#125;);</div>
              <br />
              <div className="text-slate-500">// Deploy Smart Contract on Sepolia</div>
              <div><span className="text-[#00f0ff]">const</span> res = <span className="text-[#ff007f]">await</span> sdk.<span className="text-[#ccff00]">deploySmartContract</span>(</div>
              <div className="pl-4"><span className="text-[#ccff00]">"NorthveilToken"</span>, <span className="text-[#ccff00]">"sepolia"</span></div>
              <div>);</div>
              <div>console.<span className="text-[#00f0ff]">log</span>(res.deployedAddress);</div>
            </div>

            {/* Execution Result Card */}
            <div className="p-3 bg-[#0a0a0c] border-2 border-[#ccff00] text-xs font-mono space-y-1">
              <div className="text-[#ccff00] font-black flex items-center justify-between">
                <span>⚡ EXECUTION RESULT:</span>
                <span className="text-[10px] text-white">HTTP 200 OK</span>
              </div>
              <div className="text-slate-300">Contract: <code className="text-white">NorthveilToken</code></div>
              <div className="text-slate-300">Address: <code className="text-[#00f0ff]">0x627efd016707adf93e51...</code></div>
              <div className="text-slate-300">Status: <span className="text-[#ccff00]">🟢 DEPLOYED ON SEPOLIA</span></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
