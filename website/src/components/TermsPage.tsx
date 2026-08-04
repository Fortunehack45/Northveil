import React from 'react';
import { FileText, Shield, Scale, AlertTriangle, Lock, FileCheck } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-[96%] mx-auto py-8 px-2 sm:px-4 space-y-10 text-left bg-[#0a0a0c]">
      
      {/* Neo-Brutalist Title Banner */}
      <div className="bg-[#ff007f] text-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00] space-y-4 font-mono">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ff007f] text-xs font-black uppercase">
          <Scale className="w-4 h-4" /> MASTER TERMS OF SERVICE
        </div>
        <h1 className="text-3xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">
          NORTHVEIL PROTOCOL <br />
          <span className="bg-black text-[#ccff00] px-2 py-0.5 inline-block my-1">TERMS OF SERVICE</span>
        </h1>
        <p className="text-xs font-bold text-white border-t-3 border-black pt-3 uppercase">
          EFFECTIVE DATE: AUGUST 4, 2026 • REVISION 3.0 (NON-CUSTODIAL & MCP AI PROTOCOL)
        </p>
      </div>

      {/* Attorney Review Disclaimer Banner */}
      <div className="bg-[#ccff00] text-black border-3 border-black p-4 font-mono text-xs font-bold uppercase shadow-[4px_4px_0px_0px_#000] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-black stroke-[3] mt-0.5" />
        <div>
          <b>ATTORNEY REVIEW DISCLAIMER:</b> THIS MASTER TERMS OF SERVICE DOCUMENT IS STRUCTURED AS A COMPREHENSIVE LEGAL FRAMEWORK FOR NON-CUSTODIAL WEB3 SOFTWARE INTERFACES AND MODEL CONTEXT PROTOCOL (MCP) AI SERVERS. IT MUST BE REVIEWED BY A LICENSED ATTORNEY IN YOUR OPERATING JURISDICTION PRIOR TO PUBLISHING WITH LIVE FUNDS.
        </div>
      </div>

      {/* Document Sections */}
      <div className="space-y-6 font-mono text-xs text-slate-200">
        
        {/* Section 1 */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-3">
          <h2 className="text-base font-black text-[#00f0ff] uppercase border-b-2 border-white/20 pb-2 flex items-center justify-between">
            <span>1. ACCEPTANCE OF TERMS & ELIGIBILITY</span>
            <span className="bg-[#00f0ff] text-black px-2 py-0.5 text-[10px]">SECTION 1</span>
          </h2>
          <p className="leading-relaxed">
            By accessing, browsing, interacting with, or connecting to the Northveil Web3 Wallet software interface, Northveil REST API, or Northveil Model Context Protocol (MCP) server (collectively, the "Services"), you acknowledge that you have read, understood, and agree to be bound by these Master Terms of Service ("Terms"). If you do not agree to these Terms, you must immediately cease all access and use of the Services.
          </p>
          <p className="leading-relaxed">
            You represent and warrant that you are of legal age to form a binding contract in your operating jurisdiction (at least 18 years of age or older), and that you are not barred from accessing or using the Services under the laws of the United States, European Union, or other applicable jurisdictions.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-3">
          <h2 className="text-base font-black text-[#ccff00] uppercase border-b-2 border-white/20 pb-2 flex items-center justify-between">
            <span>2. NON-CUSTODIAL ARCHITECTURE & KEY SECURITY</span>
            <span className="bg-[#ccff00] text-black px-2 py-0.5 text-[10px]">SECTION 2</span>
          </h2>
          <p className="leading-relaxed">
            Northveil is strictly a non-custodial software application. At no point do Northveil developers, operators, or backend infrastructure hold, possess, store, manage, or maintain access to your unencrypted private keys, 12-word or 24-word seed phrases, or cryptographic keystore vaults.
          </p>
          <p className="leading-relaxed">
            <b>Client-Side Vault Encryption:</b> Your seed phrases and private keys are encrypted locally on your client device using 256-bit AES-GCM cryptography derived via PBKDF2 (100,000 iterations + SHA-256). You maintain 100% exclusive control over your cryptographic credentials. You acknowledge and accept that if you lose your seed phrase, passcode, or device, Northveil has no capacity to recover your funds or reset your credentials.
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-3">
          <h2 className="text-base font-black text-[#ff007f] uppercase border-b-2 border-white/20 pb-2 flex items-center justify-between">
            <span>3. AI AGENT & MCP TOOL EXECUTION LIABILITY</span>
            <span className="bg-[#ff007f] text-white px-2 py-0.5 text-[10px]">SECTION 3</span>
          </h2>
          <p className="leading-relaxed">
            When utilizing the Northveil Model Context Protocol (MCP) server or API endpoints with third-party Large Language Model (LLM) agents (including Claude, ChatGPT, Cursor, or custom AI scripts), tool requests (such as <code>send_transfer</code>, <code>execute_swap</code>, or <code>deploy_smart_contract</code>) are executed based on authorization granted by your API key (<code>nv_live_...</code>).
          </p>
          <p className="leading-relaxed">
            <b>Signable Unsigned Intents:</b> To prevent unauthorized autonomous drains, fund-moving and contract deployment tool calls return a signable unsigned transaction intent object for explicit in-app user biometric approval, unless you have explicitly pre-authorized a time-boxed session key grant. You are solely responsible for reviewing all transaction parameters (recipient address, gas fees, token amounts, slippage tolerance) prior to signing.
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-3">
          <h2 className="text-base font-black text-[#00f0ff] uppercase border-b-2 border-white/20 pb-2 flex items-center justify-between">
            <span>4. ON-CHAIN TRANSACTIONS & GAS FEES</span>
            <span className="bg-[#00f0ff] text-black px-2 py-0.5 text-[10px]">SECTION 4</span>
          </h2>
          <p className="leading-relaxed">
            All transactions broadcasted via Northveil RPC connections are executed directly on public decentralized blockchain networks (Ethereum Mainnet, Sepolia, Polygon, Arbitrum, Solana, Bitcoin). Blockchain transactions are final, irreversible, and subject to variable gas fees dictated by network consensus rules.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-black border-3 border-[#ff007f] p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-3">
          <h2 className="text-base font-black text-[#ff007f] uppercase border-b-2 border-white/20 pb-2 flex items-center justify-between">
            <span>5. DISCLAIMERS & LIMITATION OF LIABILITY</span>
            <span className="bg-[#ff007f] text-white px-2 py-0.5 text-[10px]">SECTION 5</span>
          </h2>
          <p className="uppercase font-black text-[#ccff00] leading-relaxed">
            THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, NORTHVEIL DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="leading-relaxed">
            IN NO EVENT SHALL NORTHVEIL, ITS DEVELOPERS, OR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, LOSS OF CRYPTOGRAPHIC ASSETS, LOSS OF PROFITS, OR DATA LOSS ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICES OR DEPLOYED SMART CONTRACTS.
          </p>
        </div>

      </div>
    </div>
  );
};
