import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, Database, Server, Cpu } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-[96%] mx-auto py-8 px-2 sm:px-4 space-y-10 text-left bg-[#0a0a0c]">
      
      {/* Title Banner */}
      <div className="bg-[#ccff00] text-black border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#00f0ff] space-y-4 font-mono">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ccff00] text-xs font-black uppercase">
          <ShieldCheck className="w-4 h-4" /> ZERO-KNOWLEDGE PRIVACY POLICY
        </div>
        <h1 className="text-3xl sm:text-6xl font-black text-black uppercase tracking-tighter leading-none">
          NORTHVEIL PRIVACY <br />
          <span className="bg-black text-[#00f0ff] px-2 py-0.5 inline-block my-1">POLICY & DISCLOSURES</span>
        </h1>
        <p className="text-xs font-bold text-black border-t-3 border-black pt-3 uppercase">
          LAST REVISION: AUGUST 4, 2026 • GDPR & CCPA PRIVACY COMPLIANT
        </p>
      </div>

      {/* Document Sections */}
      <div className="space-y-6 font-mono text-xs text-slate-200">
        
        {/* Section 1 */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-3">
          <h2 className="text-base font-black text-[#ccff00] uppercase border-b-2 border-white/20 pb-2 flex items-center justify-between">
            <span>1. ZERO-KNOWLEDGE ARCHITECTURE COMMITMENT</span>
            <span className="bg-[#ccff00] text-black px-2 py-0.5 text-[10px]">SECTION 1</span>
          </h2>
          <p className="leading-relaxed">
            Northveil is engineered around a strict Zero-Knowledge Privacy Architecture. Your unencrypted 12-word or 24-word seed phrases, BIP39 passphrases, and private keys never leave your client browser or device memory under any circumstances.
          </p>
          <p className="leading-relaxed">
            Cryptographic derivation occurs locally via <code>bip39</code> and <code>ethers.HDNodeWallet</code>. Local vault storage is secured using Web Crypto AES-256-GCM encryption key derivation (PBKDF2 100,000 iterations). Northveil servers have zero capability to access or intercept your unencrypted private keys.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-3">
          <h2 className="text-base font-black text-[#00f0ff] uppercase border-b-2 border-white/20 pb-2 flex items-center justify-between">
            <span>2. MCP TELEMETRY & SUPABASE CLOUD AUDIT LOGS</span>
            <span className="bg-[#00f0ff] text-black px-2 py-0.5 text-[10px]">SECTION 2</span>
          </h2>
          <p className="leading-relaxed">
            When utilizing the Model Context Protocol (MCP) server or REST API, metadata required to fulfill tool execution requests is processed and recorded in Supabase Cloud DB (<code>mcp_activity_logs</code> table) for multi-tenant isolation, rate-limiting, and security auditing.
          </p>
          <div className="bg-black border-2 border-white p-4 space-y-1 text-slate-300">
            <div>• Processed Data: API key identifier (<code>nv_live_...</code>), public wallet address (<code>0x...</code>), tool name requested, parameter payload, execution timestamp, and HTTP status response code.</div>
            <div>• Excluded Data: Private keys, seed phrases, passcodes, IP addresses, or personal identity documents are NEVER collected or stored.</div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-3">
          <h2 className="text-base font-black text-[#ff007f] uppercase border-b-2 border-white/20 pb-2 flex items-center justify-between">
            <span>3. THIRD-PARTY RPC NODES & MARKET INDEXERS</span>
            <span className="bg-[#ff007f] text-white px-2 py-0.5 text-[10px]">SECTION 3</span>
          </h2>
          <p className="leading-relaxed">
            To retrieve real-time token balances, asset market valuations, and EIP-1559 gas fee estimates, Northveil queries public blockchain RPC providers (Cloudflare, Sepolia, Polygon), DEX aggregators (1inch, Jupiter), and market price engines (Coinpaprika).
          </p>
          <p className="leading-relaxed">
            Public RPC queries include your public wallet address to read on-chain state. No personally identifiable information (PII) is transmitted to these providers.
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-3">
          <h2 className="text-base font-black text-[#ccff00] uppercase border-b-2 border-white/20 pb-2 flex items-center justify-between">
            <span>4. GDPR & CCPA DATA SUBJECT RIGHTS</span>
            <span className="bg-[#ccff00] text-black px-2 py-0.5 text-[10px]">SECTION 4</span>
          </h2>
          <p className="leading-relaxed">
            Under the European General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you maintain specific data protection rights:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            <li><b>Right to Access / Export:</b> Request a copy of all non-custodial API activity logs associated with your API key.</li>
            <li><b>Right to Erasure:</b> Request deletion of non-essential database log records stored in Supabase.</li>
            <li><b>On-Chain Permanence:</b> Note that data broadcasted to public blockchains (transaction hashes, smart contract code) is permanently immutable and cannot be erased by any entity.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
