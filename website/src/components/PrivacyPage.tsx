import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-8 space-y-10 font-mono">
      <div className="border-b-4 border-white pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00f0ff] text-black text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <ShieldCheck className="w-4 h-4" /> ZERO-KNOWLEDGE PRIVACY POLICY
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          NORTHVEIL <span className="text-[#ccff00]">PRIVACY POLICY</span>
        </h2>
        <p className="text-xs text-slate-400">
          LAST UPDATED: AUGUST 4, 2026 • PRIVACY COMPLIANT V3.0
        </p>
      </div>

      <div className="bg-[#141419] border-4 border-white p-6 sm:p-10 shadow-[10px_10px_0px_0px_#ccff00] space-y-8 text-xs leading-relaxed text-slate-300">
        
        <section className="space-y-3">
          <h3 className="text-lg font-black text-[#00f0ff] uppercase border-b border-white/20 pb-2">
            1. ZERO-KNOWLEDGE PRIVATE KEY ARCHITECTURE
          </h3>
          <p>
            Northveil is engineered with a strict zero-knowledge privacy architecture. Your seed phrase and private keys are encrypted locally on your device using Web Crypto AES-256-GCM and never leave your client browser memory. Northveil servers and database backends have zero access to your unencrypted private keys.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-[#ccff00] uppercase border-b border-white/20 pb-2">
            2. MCP SERVER TELEMETRY & SUPABASE AUDIT LOGS
          </h3>
          <p>
            When utilizing the MCP AI Server, metadata related to API key authentication (`nv_live_...`), wallet addresses, tool execution timestamps, and smart contract deployment prompts are recorded in Supabase Cloud DB (`mcp_activity_logs` table) for security auditing, multi-tenant isolation, and rate-limiting purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-black text-[#ff007f] uppercase border-b border-white/20 pb-2">
            3. THIRD-PARTY BLOCKCHAIN RPC & INDEXERS
          </h3>
          <p>
            Public RPC nodes (Ethers.js, Cloudflare, Sepolia) and blockchain indexers (Blockscout, Coinpaprika) process public wallet addresses to return real-time balances and market feeds. No personal identifiable information (PII) or IP tracking is stored.
          </p>
        </section>

      </div>
    </div>
  );
};
