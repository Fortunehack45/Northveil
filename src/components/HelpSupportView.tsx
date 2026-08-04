import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Ticket,
  Bug,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { CreateTicketView } from './CreateTicketView';
import { ReportBugView } from './ReportBugView';

export const HelpSupportView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'ticket' | 'bugReport'>('faqs');

  const faqs = [
    {
      q: 'How does Northveil store my private keys and seed phrase?',
      a: 'Northveil runs locally in your browser container. All private keys and 12-word seed phrases are encrypted using AES-GCM 256-bit cryptography and guarded by local biometric hardware protocols (Touch ID / Face ID).',
    },
    {
      q: 'What should I do if my Web3 transaction is stuck on pending?',
      a: 'Navigate to the DEPOSITS / GAS ESTIMATOR tab and use the Speed Up feature to replace your pending transaction with a higher priority gas tip.',
    },
    {
      q: 'How do I connect my Ledger or Trezor hardware wallet?',
      a: 'Go to SETTINGS -> HARDWARE WALLET INTEGRATION, connect your device via USB or Bluetooth, and click Pair Device.',
    },
    {
      q: 'Is MEV sandwich attack protection enabled by default?',
      a: 'Yes, Northveil routes all DEX trades through private RPC relays (Flashbots Protect & CowSwap) to shield your trades from front-running bots.',
    },
    {
      q: 'How do I export my historical crypto transactions for taxes?',
      a: 'Navigate to TAX & HISTORY in the sidebar menu. You can view capital gains, FIFO/LIFO breakdowns, and download a CSV tax file.',
    },
    {
      q: 'Where can I view live system metrics and RPC ping?',
      a: 'Check your PROFILE / SYSTEM METRICS page to inspect local storage usage, active RPC node latency, and system memory consumption.',
    },
  ];

  if (activeTab === 'ticket') {
    return (
      <CreateTicketView
        onBack={() => {
          setActiveTab('faqs');
        }}
      />
    );
  }

  if (activeTab === 'bugReport') {
    return (
      <ReportBugView
        onBack={() => {
          setActiveTab('faqs');
        }}
      />
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full font-mono select-none animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#141419] border-2 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-1 bg-[#ccff00] text-black text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
            24/7 DECENTRALIZED DESK
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-2">
            HELP, SUPPORT & BUG DESK
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            KNOWLEDGE BASE, COMMUNITY DISCORD, ENCRYPTED TICKETS, AND FEATURE REQUESTS.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2.5 text-xs font-black uppercase border-2 shadow-[3px_3px_0px_0px_#000] flex items-center gap-2 cursor-pointer ${
              activeTab === 'faqs' ? 'bg-[#ccff00] text-black border-black' : 'bg-[#0a0a0c] text-white border-white/40'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> FAQS & GUIDES
          </button>

          <button
            onClick={() => setActiveTab('ticket')}
            className="px-4 py-2.5 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#33f3ff] cursor-pointer flex items-center gap-2"
          >
            <Ticket className="w-4 h-4 stroke-[2.5]" /> CREATE TICKET
          </button>

          <button
            onClick={() => setActiveTab('bugReport')}
            className="px-4 py-2.5 bg-[#ff007f] text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#ff3399] cursor-pointer flex items-center gap-2"
          >
            <Bug className="w-4 h-4 stroke-[2.5]" /> REPORT BUG
          </button>
        </div>
      </div>

      {/* Quick Action Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab('ticket')}
          className="bg-[#0a0a0c] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] hover:border-[#00f0ff] cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-[#00f0ff] text-black text-[10px] font-black uppercase border border-black">
              SUPPORT DESK
            </span>
            <ChevronRight className="w-5 h-5 text-[#00f0ff] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#00f0ff]" />
            <span>SUBMIT SUPPORT TICKET</span>
          </h3>
          <p className="text-xs text-slate-300">
            Encrypted client-side support desk ticket for stuck transactions, gas issues, or hardware pairing.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('bugReport')}
          className="bg-[#0a0a0c] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] hover:border-[#ff007f] cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-[#ff007f] text-white text-[10px] font-black uppercase border border-black">
              BOUNTY DESK
            </span>
            <ChevronRight className="w-5 h-5 text-[#ff007f] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
            <Bug className="w-5 h-5 text-[#ff007f]" />
            <span>REPORT BUG & VULNERABILITY</span>
          </h3>
          <p className="text-xs text-slate-300">
            Vulnerability reporting console with stack traces, environment specs, and bug bounty rewards up to $5,000.
          </p>
        </div>
      </div>

      {/* FAQ Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-tight">KNOWLEDGE BASE & FREQUENTLY ASKED QUESTIONS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-3"
            >
              <h4 className="text-sm font-black text-[#ccff00] uppercase flex items-start gap-2">
                <span>Q:</span> {faq.q}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/20">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
