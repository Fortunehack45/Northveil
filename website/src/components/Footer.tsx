import React from 'react';
import { Terminal, Shield, ExternalLink, Github, Cpu, Code, BookOpen } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t-4 border-[#ccff00] bg-[#0a0a0c] text-white py-12 px-4 sm:px-6 lg:px-8 text-left select-none">
      
      {/* Ticker Bottom Marquee */}
      <div className="bg-[#00f0ff] text-black font-mono text-xs font-black uppercase py-2 px-4 border-b-3 border-black mb-8">
        JOIN THE DIALOGUE /// SUPPORT INDEPENDENT ON-CHAIN CODE /// STEP INTO NORTHVEIL PROTOCOL ///
      </div>

      <div className="max-w-[96%] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 font-mono">
        
        {/* Brand Description */}
        <div className="md:col-span-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#ccff00] p-1 border-2 border-black">
              <img 
                src="https://iili.io/CDS9fvn.png" 
                alt="Northveil Logo" 
                className="w-8 h-8 object-contain bg-black p-0.5 border border-white" 
              />
            </div>
            <span className="text-2xl font-black text-white uppercase tracking-tighter">
              NORTHVEIL PROTOCOL
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed">
            Enterprise non-custodial Web3 wallet, multi-tenant Model Context Protocol (MCP) AI server, and real on-chain smart contract deployment engine.
          </p>
          <div className="text-[11px] text-[#ccff00] font-black uppercase pt-2">
            © 2026 NORTHVEIL PROTOCOL • ZERO KNOWLEDGE ARCHITECTURE
          </div>
        </div>

        {/* Documentation Links */}
        <div className="md:col-span-3 space-y-3 text-xs">
          <div className="font-black text-[#ccff00] uppercase tracking-wider border-b-2 border-white/20 pb-1">
            DOCUMENTATION
          </div>
          <button onClick={() => handleNav('mcpDocs')} className="block text-slate-300 hover:text-[#00f0ff] uppercase transition-colors cursor-pointer">
            MCP AI Server Manual
          </button>
          <button onClick={() => handleNav('apiDocs')} className="block text-slate-300 hover:text-[#00f0ff] uppercase transition-colors cursor-pointer">
            OpenAPI 3.0 REST Specs
          </button>
          <button onClick={() => handleNav('sdkDocs')} className="block text-slate-300 hover:text-[#00f0ff] uppercase transition-colors cursor-pointer">
            TypeScript & Python SDK
          </button>
        </div>

        {/* Legal & GitHub */}
        <div className="md:col-span-3 space-y-3 text-xs">
          <div className="font-black text-[#00f0ff] uppercase tracking-wider border-b-2 border-white/20 pb-1">
            LEGAL & SOURCE
          </div>
          <button onClick={() => handleNav('terms')} className="block text-slate-300 hover:text-[#ccff00] uppercase transition-colors cursor-pointer">
            Terms of Service
          </button>
          <button onClick={() => handleNav('privacy')} className="block text-slate-300 hover:text-[#ccff00] uppercase transition-colors cursor-pointer">
            Privacy Policy & Disclosures
          </button>
          <a
            href="https://github.com/Fortunehack45/Northveil"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[#ccff00] hover:bg-[#ccff00] hover:text-black px-2 py-1 border border-black font-black uppercase transition-all mt-2"
          >
            <Github className="w-4 h-4 stroke-[3]" />
            <span>GITHUB REPOSITORY</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
