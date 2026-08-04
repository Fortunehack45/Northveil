import React from 'react';
import { Terminal, Shield, BookOpen, Code, FileText, Cpu, ExternalLink, Zap } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'OVERVIEW', icon: <Terminal className="w-4 h-4" /> },
    { id: 'mcpDocs', label: 'MCP SERVER DOCS', icon: <Cpu className="w-4 h-4" /> },
    { id: 'apiDocs', label: 'REST API SPECS', icon: <Code className="w-4 h-4" /> },
    { id: 'sdkDocs', label: 'TS / PYTHON SDK', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'deployGuide', label: 'DEPLOYMENT GUIDE', icon: <Zap className="w-4 h-4" /> },
    { id: 'terms', label: 'TERMS & PRIVACY', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0c]/90 backdrop-blur-md border-b-4 border-white px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <img 
            src="https://iili.io/CU64M11.png" 
            alt="Northveil Logo" 
            className="w-9 h-9 object-contain rounded-md border-2 border-black shadow-[3px_3px_0px_0px_#ccff00] bg-black" 
          />
          <div className="text-left">
            <span className="text-xl font-black text-white tracking-tighter uppercase font-mono block">
              NORTH<span className="text-[#ccff00]">VEIL</span>
            </span>
            <span className="text-[10px] text-[#00f0ff] font-bold tracking-widest block -mt-1">
              PROTOCOL & MCP AI ENGINE
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ccff00] text-black border-2 border-black shadow-[3px_3px_0px_0px_#00f0ff] translate-x-0.5'
                    : 'bg-[#141419] text-slate-300 border-2 border-white/20 hover:border-white hover:text-white shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Launch Wallet App Action Button */}
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-[#00f0ff] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:bg-[#33f3ff] transition-all flex items-center gap-2"
          >
            <span>LAUNCH WALLET APP</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
