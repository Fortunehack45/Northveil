import React from 'react';
import { FileText, Shield, Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-8 space-y-10 font-mono">
      <div className="border-b-4 border-white pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ccff00] text-black text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <Scale className="w-4 h-4" /> LEGAL DISCLOSURES & USER AGREEMENT
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          NORTHVEIL <span className="text-[#00f0ff]">TERMS OF SERVICE</span>
        </h2>
        <p className="text-xs text-slate-400">
          LAST UPDATED: AUGUST 4, 2026 • REVISION 3.0
        </p>
      </div>

      <div className="bg-[#141419] border-4 border-white p-6 sm:p-10 shadow-[10px_10px_0px_0px_#00f0ff] space-y-8 text-xs leading-relaxed text-slate-300">
        
        <section className="space-y-3">
          <h3 className="text-lg font-black text-[#ccff00] uppercase border-b border-white/20 pb-2">
            1. NON-CUSTODIAL PROTOCOL AGREEMENT
          </h3>
          <p>
            Northveil is a non-custodial Web3 software interface and Model Context Protocol (MCP) server. Northveil does not hold, store, or manage private keys, seed phrases, or unencrypted user credentials. Users retain 100% exclusive control over their cryptographic private keys and assets at all times.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-[#00f0ff] uppercase border-b border-white/20 pb-2">
            2. AI ASSISTANT & MCP SERVER TOOL EXECUTION
          </h3>
          <p>
            When utilizing the Northveil MCP Server with AI clients (Claude, ChatGPT, Cursor), tool execution requests (such as `send_transfer`, `execute_swap`, or `deploy_smart_contract`) are routed via user-permissioned API keys (`nv_live_...`). Users acknowledge that AI-assisted actions on blockchain networks are final, irreversible, and governed by public consensus rules.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-[#ff007f] uppercase border-b border-white/20 pb-2">
            3. ON-CHAIN BLOCKCHAIN TRANSACTIONS & GAS FEES
          </h3>
          <p>
            All transaction broadcasts executed via Ethers.js RPC providers are subject to decentralized network gas fees. Northveil is not responsible for slippage, network congestion, failed smart contract calls, or user-submitted parameters.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-[#ccff00] uppercase border-b border-white/20 pb-2">
            4. LIMITATION OF LIABILITY
          </h3>
          <p>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL NORTHVEIL PROTOCOL DEVELOPERS OR CONTRIBUTORS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM THE USE OF THE SOFTWARE OR DEPLOYED SMART CONTRACTS.
          </p>
        </section>

      </div>
    </div>
  );
};
