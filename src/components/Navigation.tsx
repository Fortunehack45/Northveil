import React from 'react';
import { useWallet } from '../context/WalletContext';
import { BlockiesAvatar } from './BlockiesAvatar';
import {
  LayoutGrid,
  ArrowLeftRight,
  ArrowUpRight,
  Layers,
  Settings,
  User,
  LogOut,
  FileText,
  Compass,
  Image as ImageIcon,
  Code2,
  ShieldAlert,
  Bot,
  CreditCard,
  Menu,
  HelpCircle,
  Globe,
} from 'lucide-react';

export type TabType =
  | 'portfolio'
  | 'dexBridge'
  | 'buySell'
  | 'gasEstimator'
  | 'staking'
  | 'nftGallery'
  | 'smartContractStudio'
  | 'historyTax'
  | 'dappBrowser'
  | 'securityCenter'
  | 'developerHub'
  | 'securityBackup'
  | 'systemMetrics'
  | 'helpSupport'
  | 'reportBug'
  | 'networkManager';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleMobile?: () => void;
  onOpenOnboarding?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onCloseMobile,
  onToggleMobile,
  onOpenOnboarding,
}) => {
  const { lockWallet, activeSubWallet } = useWallet();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'portfolio', label: 'DASHBOARD', icon: <LayoutGrid className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'buySell', label: 'BUY & SELL', icon: <CreditCard className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'dexBridge', label: 'TRADE & SWAP', icon: <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'gasEstimator', label: 'DEPOSITS', icon: <ArrowUpRight className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'nftGallery', label: 'NFT GALLERY', icon: <ImageIcon className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'smartContractStudio', label: 'CONTRACT STUDIO', icon: <Code2 className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'staking', label: 'PROTOCOLS', icon: <Layers className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'historyTax', label: 'TAX & HISTORY', icon: <FileText className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'securityCenter', label: 'SECURITY SHIELD', icon: <ShieldAlert className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'developerHub', label: 'AI & DEV HUB', icon: <Bot className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'securityBackup', label: 'SETTINGS', icon: <Settings className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'systemMetrics', label: 'PROFILE', icon: <User className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'helpSupport', label: 'HELP & SUPPORT', icon: <HelpCircle className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'networkManager', label: 'NETWORK MGR', icon: <Globe className="w-4 h-4 stroke-[2.5]" /> },
  ];

  // Core 5 primary pages (featured on mobile bottom nav bar)
  const coreNavItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'portfolio', label: 'HOME', icon: <LayoutGrid className="w-5 h-5 stroke-[2.5]" /> },
    { id: 'buySell', label: 'BUY & SELL', icon: <CreditCard className="w-5 h-5 stroke-[2.5]" /> },
    { id: 'dexBridge', label: 'TRADE & SWAP', icon: <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" /> },
    { id: 'nftGallery', label: 'NFT', icon: <ImageIcon className="w-5 h-5 stroke-[2.5]" /> },
    { id: 'dappBrowser', label: 'DAPP BROWSER', icon: <Compass className="w-5 h-5 stroke-[2.5]" /> },
  ];

  // Secondary items (featured in sidebar)
  const secondaryNavItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'gasEstimator', label: 'DEPOSITS', icon: <ArrowUpRight className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'smartContractStudio', label: 'CONTRACT STUDIO', icon: <Code2 className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'staking', label: 'PROTOCOLS', icon: <Layers className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'historyTax', label: 'TAX & HISTORY', icon: <FileText className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'securityCenter', label: 'SECURITY SHIELD', icon: <ShieldAlert className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'developerHub', label: 'AI & DEV HUB', icon: <Bot className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'securityBackup', label: 'SETTINGS', icon: <Settings className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'systemMetrics', label: 'PROFILE', icon: <User className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'helpSupport', label: 'HELP & SUPPORT', icon: <HelpCircle className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'networkManager', label: 'NETWORK MGR', icon: <Globe className="w-4 h-4 stroke-[2.5]" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay when Drawer is open */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 bg-black/80 z-40 transition-opacity"
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`w-64 bg-[#0e1017] border-r-2 border-white flex flex-col h-full shrink-0 select-none transition-transform duration-300 ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 flex shadow-[8px_0px_20px_rgba(0,0,0,0.9)] translate-x-0'
            : 'hidden md:flex z-30'
        }`}
      >
        {/* Northveil Brand Header */}
        <div className="p-4 sm:p-5 border-b-2 border-white/20 shrink-0 bg-[#0e1017]">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                setActiveTab('portfolio');
                window.dispatchEvent(new CustomEvent('reset-portfolio'));
                if (isMobileOpen && onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img 
                src="https://iili.io/CgBPBHv.jpg" 
                alt="Northveil Logo" 
                className="w-9 h-9 object-cover rounded-none border-2 border-white bg-black shadow-[3px_3px_0px_0px_#d4ff00] shrink-0 bg-[#000]" 
              />
              <div className="flex flex-col text-left font-mono">
                <span className="text-lg font-black tracking-tighter text-white uppercase leading-tight">
                  North<span className="text-[#d4ff00]">veil</span>
                </span>
                <span className="text-[9px] font-bold text-[#00f0ff] uppercase tracking-wider -mt-0.5">
                  AI DEFI VAULT
                </span>
              </div>
            </button>
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                className="md:hidden text-black bg-[#ff007f] px-2.5 py-1 font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items - Scrollable list */}
        <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3 font-mono">
          {/* Desktop Core Apps section */}
          <div className="hidden md:block space-y-1.5">
            <div className="px-2 py-0.5 text-[10px] font-black text-[#d4ff00] uppercase tracking-wider">
              CORE ECOSYSTEM
            </div>
            {coreNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'portfolio' && activeTab === 'portfolio') {
                      window.dispatchEvent(new CustomEvent('reset-portfolio'));
                    }
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#d4ff00] text-black border-2 border-black shadow-[3px_3px_0px_0px_#ff007f] translate-x-0.5'
                      : 'bg-[#151821] text-slate-200 border-2 border-white/20 hover:border-white hover:text-white hover:bg-[#1d212d] shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Secondary Tools & Services section */}
          <div className="space-y-1.5">
            <div className="px-2 py-0.5 text-[10px] font-black text-[#00f0ff] uppercase tracking-wider">
              {isMobileOpen ? 'MORE SERVICES & TOOLS' : 'SERVICES & PROTOCOLS'}
            </div>
            {secondaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00f0ff] text-black border-2 border-black shadow-[3px_3px_0px_0px_#ff007f] translate-x-0.5'
                      : 'bg-[#151821] text-slate-200 border-2 border-white/20 hover:border-white hover:text-white hover:bg-[#1d212d] shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer Actions - Fixed at Bottom */}
        <div className="p-3 border-t-2 border-white/20 bg-[#0e1017] shrink-0 space-y-2 font-mono">
          {/* Account Profile Badge */}
          {activeSubWallet && (
            <div className="p-2 bg-[#0a0b0e] border-2 border-white/40 shadow-[2px_2px_0px_0px_#000] flex items-center gap-2.5 mb-2 font-mono">
              <BlockiesAvatar address={activeSubWallet.address} size={30} />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-white block truncate uppercase">{activeSubWallet.name}</span>
                <span className="text-[10px] text-[#00f0ff] font-bold block truncate font-mono">
                  {activeSubWallet.address.slice(0, 6)}...{activeSubWallet.address.slice(-4)}
                </span>
              </div>
            </div>
          )}

          {onOpenOnboarding && (
            <button
              onClick={() => {
                onOpenOnboarding();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#00f0ff] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono font-black text-[11px] uppercase tracking-wider hover:bg-[#33f3ff] cursor-pointer mb-2"
            >
              <span>VAULT & BACKUP</span>
            </button>
          )}

          <button
            onClick={lockWallet}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#ff007f] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] font-mono font-black text-xs uppercase tracking-wider hover:bg-[#ff3399] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[3]" />
            <span>LOG OUT</span>
          </button>
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0e1017] border-t-2 border-white flex items-center justify-around z-40 px-1 font-mono select-none shadow-[0px_-4px_12px_rgba(0,0,0,0.8)]">
        {coreNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'portfolio' && activeTab === 'portfolio') {
                  window.dispatchEvent(new CustomEvent('reset-portfolio'));
                }
                setActiveTab(item.id);
                if (isMobileOpen && onCloseMobile) onCloseMobile();
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-[#d4ff00] font-black scale-105'
                  : 'text-slate-400 hover:text-white font-bold'
              }`}
            >
              <div
                className={`p-1 border-2 transition-all ${
                  isActive
                    ? 'bg-[#d4ff00] text-black border-black shadow-[2px_2px_0px_0px_#ff007f]'
                    : 'bg-transparent border-transparent'
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[8.5px] uppercase tracking-tighter mt-0.5 truncate max-w-[56px] text-center font-black">
                {item.label === 'TRADE & SWAP' ? 'SWAP' : item.label === 'DAPP BROWSER' ? 'DAPPS' : item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};


