import React, { useState } from 'react';
import { Cpu, Code, BookOpen, Zap, Shield, ExternalLink, Menu, X, Terminal, ChevronRight, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'OVERVIEW', icon: <Terminal className="w-4 h-4 text-black stroke-[3]" /> },
    { id: 'mcpDocs', label: 'MCP AI DOCS', icon: <Cpu className="w-4 h-4 text-black stroke-[3]" /> },
    { id: 'apiDocs', label: 'REST API', icon: <Code className="w-4 h-4 text-black stroke-[3]" /> },
    { id: 'sdkDocs', label: 'SDK REF', icon: <BookOpen className="w-4 h-4 text-black stroke-[3]" /> },
    { id: 'terms', label: 'TERMS OF SERVICE', icon: <FileText className="w-4 h-4 text-black stroke-[3]" /> },
    { id: 'privacy', label: 'PRIVACY POLICY', icon: <Shield className="w-4 h-4 text-black stroke-[3]" /> },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0c] border-b-4 border-[#ccff00] select-none">
      
      {/* Ticker Banner Top Strip */}
      <div className="bg-[#ccff00] text-black font-mono text-[10px] font-black uppercase tracking-widest py-1 px-4 overflow-hidden whitespace-nowrap border-b-2 border-black">
        <div className="animate-marquee inline-block">
          NORTHVEIL PROTOCOL v3.0 /// REAL EVM RPC BROADCAST ENGINE /// MCP SSE STREAMING CONNECTED /// ZERO KNOWLEDGE KEY ENCRYPTION /// LIVE ON SEPOLIA & MAINNET ///
        </div>
      </div>

      <div className="max-w-[96%] mx-auto px-2 sm:px-4 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <button 
          onClick={() => handleSelectTab('home')}
          className="flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="bg-[#ccff00] p-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#00f0ff] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            <img 
              src="https://iili.io/CDS9fvn.png" 
              alt="Northveil Logo" 
              className="w-9 h-9 object-contain bg-black p-0.5 border border-white" 
            />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              NORTHVEIL <span className="text-xs bg-[#00f0ff] text-black font-mono font-black px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_#000]">v3.0</span>
            </span>
            <span className="text-[10px] text-[#ccff00] font-mono font-bold tracking-widest block uppercase -mt-1">
              WEB3 WALLET & MCP AI SERVER
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 font-mono text-[11px] font-black uppercase transition-all cursor-pointer border-2 ${
                  isActive
                    ? 'bg-[#ccff00] text-black border-black shadow-[3px_3px_0px_0px_#00f0ff]'
                    : 'bg-[#141419] text-white border-white/20 hover:bg-[#ccff00] hover:text-black hover:border-black'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <a
            href="https://wallet.northveil.xyz/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#00f0ff] text-black font-mono font-black text-xs uppercase border-3 border-black shadow-[4px_4px_0px_0px_#ccff00] hover:bg-[#ccff00] hover:shadow-[4px_4px_0px_0px_#00f0ff] transition-all cursor-pointer"
          >
            <span>LAUNCH APP</span>
            <ExternalLink className="w-4 h-4 stroke-[3]" />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 bg-[#ccff00] text-black border-3 border-black shadow-[3px_3px_0px_0px_#000]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 stroke-[3]" /> : <Menu className="w-6 h-6 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0a0a0c] border-b-4 border-[#ccff00] p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between p-3.5 font-mono text-xs font-black uppercase border-2 transition-all ${
                activeTab === item.id
                  ? 'bg-[#ccff00] text-black border-black shadow-[4px_4px_0px_0px_#00f0ff]'
                  : 'bg-[#141419] text-white border-white/20'
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          ))}

          <div className="pt-3">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 p-4 bg-[#00f0ff] text-black font-mono font-black text-xs uppercase border-3 border-black shadow-[4px_4px_0px_0px_#ccff00]"
            >
              <span>LAUNCH WEB APP</span>
              <ExternalLink className="w-4 h-4 stroke-[3]" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
