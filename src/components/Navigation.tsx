import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../context/WalletContext';
import { BlockiesAvatar } from './BlockiesAvatar';
import { formatShortAddress } from '../services/addressUtils';
import { MpcWalletService } from '../services/MpcWalletService';
import { SupabaseService } from '../services/SupabaseService';
import {
  LayoutGrid,
  Wallet,
  Bot,
  ShieldCheck,
  Code2,
  User,
  Lock,
  LogOut,
  Sparkles,
  AlertTriangle,
  Sun,
  Moon,
} from 'lucide-react';

export type TabType =
  | 'overview'
  | 'wallets'
  | 'agents'
  | 'approvals'
  | 'developerHub'
  | 'profile'
  | 'adminPanel';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenOnboarding?: () => void;
  onOpenTour?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onCloseMobile,
  onOpenOnboarding,
  onOpenTour,
}) => {
  const { lockWallet, logOut, activeSubWallet, subWallets, theme, toggleTheme } = useWallet();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const checkPending = async () => {
      try {
        const allAddresses = Array.from(new Set([
          activeSubWallet?.address,
          ...(subWallets || []).map((w) => w.address),
        ])).filter(Boolean) as string[];

        const [stagedPending, liveApprovals] = await Promise.all([
          MpcWalletService.getPendingApprovals(activeSubWallet?.address).catch(() => []),
          SupabaseService.fetchApprovalsForWallet(allAddresses).catch(() => []),
        ]);

        const pendingIds = new Set<string>();
        (stagedPending || []).forEach((p: any) => {
          const id = p.requestId || p.id || p.approvalToken;
          if (id && (p.status || '').toLowerCase() === 'pending') pendingIds.add(id);
        });
        (liveApprovals || []).forEach((a: any) => {
          const id = a.request_id || a.id || a.approval_token;
          if (id && a.status === 'PENDING') pendingIds.add(id);
        });

        setPendingCount(pendingIds.size);
      } catch {}
    };
    checkPending();
    const interval = setInterval(checkPending, 2000);
    return () => clearInterval(interval);
  }, [activeSubWallet?.address, subWallets]);

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutGrid className="w-4 h-4 stroke-[1.8]" />,
    },
    {
      id: 'wallets',
      label: 'Wallets',
      icon: <Wallet className="w-4 h-4 stroke-[1.8]" />,
    },
    {
      id: 'agents',
      label: 'AI Agents',
      icon: <Bot className="w-4 h-4 stroke-[1.8]" />,
      badge: 'Live',
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: <ShieldCheck className="w-4 h-4 stroke-[1.8]" />,
      badge: pendingCount > 0 ? `${pendingCount}` : undefined,
    },
    {
      id: 'developerHub',
      label: 'Developers',
      icon: <Code2 className="w-4 h-4 stroke-[1.8]" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4 stroke-[1.8]" />,
    },
  ];

  // 5 Core Navigation Items for the Floating Mobile Bottom Bar
  const mobileNavItems: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutGrid className="w-4 h-4 stroke-[1.8]" />,
    },
    {
      id: 'wallets',
      label: 'Wallets',
      icon: <Wallet className="w-4 h-4 stroke-[1.8]" />,
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: <Bot className="w-4 h-4 stroke-[1.8]" />,
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: <ShieldCheck className="w-4 h-4 stroke-[1.8]" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4 stroke-[1.8]" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation (Full Suite of Tabs in Desktop & Mobile Drawer) */}
      <aside
        id="tour-navigation"
        className={`w-72 max-w-[85vw] md:w-64 h-full bg-white dark:bg-[#070709] flex flex-col justify-between shrink-0 transition-transform duration-200 ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 translate-x-0 shadow-2xl'
            : 'hidden md:flex z-30'
        }`}
      >
        {/* Brand Header with Standalone Logo */}
        <div className="p-5 pb-3 shrink-0 bg-white dark:bg-[#070709]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveTab('overview');
                if (isMobileOpen && onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-1 cursor-pointer hover:opacity-85 transition-opacity text-left"
            >
              <img
                src="https://iili.io/CDS9fvn.png"
                alt="Northveil Logo"
                className="h-10 w-auto object-contain shrink-0 northveil-logo transition-all"
              />
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Northveil
              </span>
            </button>
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                className="md:hidden text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] text-xs font-bold cursor-pointer"
                aria-label="Close navigation"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items (All 6 Tabs listed in the Sidebar) */}
        <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Menu
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobileOpen && onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white dark:text-black' : 'text-zinc-500 dark:text-zinc-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white text-black dark:bg-black dark:text-white'
                        : 'bg-black/[0.08] text-black dark:bg-white/[0.08] dark:text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions: Active Identity, Quick Tour + Theme Toggle, Lock Vault, Log Out */}
        <div className="p-3 bg-white dark:bg-[#070709] shrink-0 space-y-2">
          {activeSubWallet && (
            <div className="p-2.5 bg-black/[0.03] dark:bg-white/[0.03] rounded-xl flex items-center gap-2.5">
              <BlockiesAvatar address={activeSubWallet.address} size={24} />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block truncate">
                  {activeSubWallet.name}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono block truncate">
                  {formatShortAddress(activeSubWallet.address, activeSubWallet.accountIndex || 0)}
                </span>
              </div>
            </div>
          )}

          {/* Quick Tour Button + Theme Toggle Row */}
          <div className="flex gap-1.5 items-center">
            {(onOpenTour || onOpenOnboarding) && (
              <button
                onClick={() => {
                  if (onOpenTour) onOpenTour();
                  else if (onOpenOnboarding) onOpenOnboarding();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Quick Tour
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="py-2 px-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-300 text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 stroke-[1.8]" />
              ) : (
                <Moon className="w-3.5 h-3.5 stroke-[1.8]" />
              )}
            </button>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => lockWallet()}
              className="flex-1 py-2 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Lock Vault"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] hover:bg-red-500/20 text-zinc-600 dark:text-zinc-400 hover:text-red-500 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Log Out & Clear Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Log Out Confirmation Modal (Rendered with React Portal) */}
      {showLogoutModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Log Out of Northveil?</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                This will clear active vault credentials and session state from this browser. Make sure you have backed up your seed phrase or private key before logging out.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(false);
                    logOut();
                  }}
                  className="flex-1 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-85 text-xs font-bold cursor-pointer shadow-sm"
                >
                  Confirm Log Out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Floating Mobile Bottom Navigation Bar (Curved Glassmorphism & Safe-Area Aware) */}
      <div className="md:hidden fixed bottom-2.5 inset-x-2.5 max-w-sm sm:max-w-md mx-auto z-40 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
        <nav
          aria-label="Mobile Navigation"
          className="pointer-events-auto bg-white/90 dark:bg-[#0f0f12]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.7)] p-1.5 flex items-center justify-between transition-all"
        >
          {mobileNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                }`}
              >
                <span className="shrink-0 scale-90 sm:scale-100">{item.icon}</span>
                <span className="text-[9.5px] sm:text-[11px] font-semibold mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
