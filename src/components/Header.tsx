import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { TabType } from './Navigation';
import { SUPPORTED_CHAINS } from '../data/initialData';
import {
  Bell,
  Menu,
  ChevronDown,
  Wallet,
  Plus,
  Check,
  Copy,
  Zap,
} from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface HeaderProps {
  activeTab: TabType;
  onToggleMobileNav?: () => void;
  onNavigateNetworkManager?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  read: boolean;
}

const PAGE_TITLES: Record<TabType, string> = {
  overview: 'Overview',
  wallets: 'Wallets',
  agents: 'AI Agents',
  approvals: 'Approvals',
  developerHub: 'Developers',
  profile: 'Profile',
  adminPanel: 'Admin Panel',
};

export const Header: React.FC<HeaderProps> = ({ activeTab, onToggleMobileNav }) => {
  const {
    activeChain,
    setActiveChain,
    subWallets,
    activeWalletId,
    activeSubWallet,
    setActiveWalletId,
    createSubWallet,
    customNetworks,
  } = useWallet();

  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Optimal Gas Conditions',
      desc: 'Network gas is low. Ready for execution.',
      time: '2m ago',
      type: 'info',
      read: false,
    },
    {
      id: '2',
      title: 'Transfer Finalized',
      desc: '0.05 ETH transfer completed on-chain.',
      time: '18m ago',
      type: 'success',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleCreateNewSubWallet = (overrideName?: string) => {
    const finalName = (overrideName || newWalletName).trim() || `Vault Account #${subWallets.length + 1}`;
    const newW = createSubWallet(finalName);
    if (newW) {
      setActiveWalletId(newW.id);
    }
    setNewWalletName('');
    setIsCreatingWallet(false);
    setIsWalletMenuOpen(false);
  };

  const handleCopyAddr = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddr(address);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  return (
    <header className="w-full h-16 sm:h-18 px-4 sm:px-8 bg-white dark:bg-black flex items-center justify-between gap-3 sm:gap-6 shrink-0 z-30 relative">
      {(isWalletMenuOpen || isNotifOpen) && (
        <div
          onClick={() => {
            setIsWalletMenuOpen(false);
            setIsNotifOpen(false);
          }}
          className="fixed inset-0 z-40 bg-transparent"
        />
      )}

      {/* Left: Active Page Title (Consistent across all pages) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white p-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.05] cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {PAGE_TITLES[activeTab] || 'Overview'}
        </h1>
      </div>

      {/* Right Actions: Multi-Wallet Selector, Chain Selector, Notification Bell */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Sub-Wallet Selector Button & Dropdown */}
        <div className="relative z-50">
          <button
            onClick={() => {
              setIsWalletMenuOpen(!isWalletMenuOpen);
              setIsNotifOpen(false);
            }}
            className="px-3.5 py-2 bg-black/[0.05] dark:bg-white/[0.05] hover:bg-black/[0.09] dark:hover:bg-white/[0.09] text-zinc-900 dark:text-white rounded-full text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <span className="w-2 h-2 rounded-full shrink-0 bg-zinc-900 dark:bg-white" />
            <span className="hidden md:inline-block max-w-[110px] truncate font-medium">
              {activeSubWallet?.name || 'Primary Vault'}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              {activeSubWallet?.address ? `${activeSubWallet.address.slice(0, 6)}...` : '0x...'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          </button>

          {/* Sub-Wallet Menu Dropdown */}
          {isWalletMenuOpen && (
            <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-11 w-auto sm:w-80 max-w-sm bg-white dark:bg-[#131317] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-2xl p-3.5 z-50 space-y-2.5 mono-animate-in">
              <div className="flex items-center justify-between pb-1 px-1">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" /> Vault Accounts ({(subWallets || []).length})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-mono">
                  BIP-44
                </span>
              </div>

              {/* Sub-Wallets List */}
              <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1">
                {(subWallets || []).map((w) => {
                  if (!w) return null;
                  const isActive = w.id === activeWalletId;
                  const addrStr = w.address || '';
                  const shortAddr = addrStr.length > 10 ? `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}` : addrStr;

                  return (
                    <div
                      key={w.id}
                      onClick={() => {
                        setActiveWalletId(w.id);
                        setIsWalletMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                          : 'bg-black/[0.03] dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-white dark:bg-black' : 'bg-black dark:bg-white'}`}
                        />
                        <div className="truncate">
                          <div className="truncate text-xs">{w.name || 'Account'}</div>
                          <div className={`text-[10px] font-mono ${isActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'}`}>
                            {shortAddr}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleCopyAddr(e, w.address)}
                        className={`p-1 cursor-pointer ${isActive ? 'text-zinc-300 hover:text-white dark:text-zinc-600 dark:hover:text-black' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                        title="Copy Address"
                      >
                        {copiedAddr === w.address ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Create Sub-Wallet Inline Form */}
              {isCreatingWallet ? (
                <div className="p-3 bg-black/[0.03] dark:bg-black rounded-xl border border-black/[0.06] dark:border-transparent space-y-2">
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNewSubWallet()}
                    className="w-full bg-white dark:bg-[#18181c] border border-black/[0.08] dark:border-white/[0.08] rounded-lg p-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCreateNewSubWallet()}
                      className="flex-1 py-1.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-lg transition-opacity hover:opacity-85 cursor-pointer shadow-sm"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingWallet(false)}
                      className="px-3 py-1.5 bg-black/[0.06] dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreatingWallet(true)}
                  className="w-full py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/[0.09] dark:hover:bg-white/[0.12] text-zinc-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Account
                </button>
              )}
            </div>
          )}
        </div>

        {/* Active Chain Selector */}
        <div id="tour-network-switcher">
          <CustomSelect
            options={[
              ...SUPPORTED_CHAINS.map((chain) => ({
                value: chain.id,
                label: chain.name,
                icon: <img src={chain.icon} alt={chain.name} className="w-4 h-4 object-contain rounded-full" />,
              })),
              ...(customNetworks || []).map((chain) => ({
                value: chain.id,
                label: chain.name,
                icon: <Zap className="w-4 h-4 text-zinc-900 dark:text-white" />,
                badge: 'CUSTOM'
              })),
            ]}
            value={activeChain}
            onChange={(val) => {
              setActiveChain(val as any);
            }}
            variant="dark"
            align="right"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative hidden xs:block z-50">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsWalletMenuOpen(false);
            }}
            className="p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.09] dark:hover:bg-white/[0.09] transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-black dark:bg-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-11 w-auto sm:w-80 max-w-sm bg-white dark:bg-[#131317] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-2xl p-3.5 z-50 space-y-2.5 mono-animate-in">
              <div className="flex items-center justify-between pb-1 px-1">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-zinc-600 dark:text-zinc-300 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs space-y-0.5 ${
                      n.read
                        ? 'bg-black/[0.02] dark:bg-white/[0.02] text-zinc-500'
                        : 'bg-black/[0.05] dark:bg-white/[0.06] text-zinc-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{n.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
