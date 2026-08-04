import React from 'react';
import { Terminal, Shield, ExternalLink, Github } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="border-t-4 border-white bg-[#0a0a0c] py-12 px-4 sm:px-8 font-mono">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <img 
              src="https://iili.io/CU64M11.png" 
              alt="Northveil Logo" 
              className="w-8 h-8 object-contain rounded border border-white/20 bg-black" 
            />
            <span className="text-lg font-black text-white uppercase tracking-tight">
              NORTH<span className="text-[#ccff00]">VEIL</span> PROTOCOL
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Non-Custodial Web3 Wallet, Multi-Tenant Model Context Protocol (MCP) AI Server, and Real On-Chain Smart Contract Deployment Engine.
          </p>
          <div className="text-[10px] text-slate-500 pt-2">
            © 2026 NORTHVEIL PROTOCOL • ALL RIGHTS RESERVED
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="space-y-2 text-xs">
          <div className="font-black text-[#ccff00] uppercase mb-3">DOCUMENTATION</div>
          <button onClick={() => setActiveTab('mcpDocs')} className="block text-slate-300 hover:text-white hover:underline text-left">
            MCP Server Docs
          </button>
          <button onClick={() => setActiveTab('apiDocs')} className="block text-slate-300 hover:text-white hover:underline text-left">
            OpenAPI 3.0 REST Specs
          </button>
          <button onClick={() => setActiveTab('sdkDocs')} className="block text-slate-300 hover:text-white hover:underline text-left">
            TypeScript & Python SDK
          </button>
          <button onClick={() => setActiveTab('deployGuide')} className="block text-slate-300 hover:text-white hover:underline text-left">
            Vercel Deployment Guide
          </button>
        </div>

        {/* Col 3: Legal Links */}
        <div className="space-y-2 text-xs">
          <div className="font-black text-[#00f0ff] uppercase mb-3">LEGAL & PRIVACY</div>
          <button onClick={() => setActiveTab('terms')} className="block text-slate-300 hover:text-white hover:underline text-left">
            Terms of Service
          </button>
          <button onClick={() => setActiveTab('terms')} className="block text-slate-300 hover:text-white hover:underline text-left">
            Privacy Policy
          </button>
          <a href="https://github.com/Fortunehack45/Northveil" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#ccff00] hover:underline pt-2">
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
