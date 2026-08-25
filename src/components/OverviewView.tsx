import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Bot,
  Layers,
  Plus,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Image as ImageIcon,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { CryptoAsset } from '../types';

interface OverviewViewProps {
  onOpenSend: (assetId?: string) => void;
  onOpenReceive: (assetId?: string) => void;
  onNavigateWallets: () => void;
  onNavigateAgents: () => void;
  onNavigateApprovals: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenSend,
  onOpenReceive,
  onNavigateWallets,
  onNavigateAgents,
  onNavigateApprovals,
}) => {
  const {
    assets,
    subWallets,
    activeSubWallet,
    setActiveWalletId,
    agents,
    transactions,
    ownedNFTs,
    totalNetWorthUsd,
    refreshBalances,
  } = useWallet();

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopyAddress = () => {
    if (!activeSubWallet?.address) return;
    navigator.clipboard.writeText(activeSubWallet.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalances();
    } catch (e) {
      console.warn('Balance refresh failed:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Strictly filter: tokens with balance > 0 on top, plus only ETH, USDC, SOL if 0 balance
  const visibleAssets = useMemo(() => {
    const withBalance = assets
      .filter((a) => Number(a.balance) > 0)
      .sort((a, b) => (b.balance * b.priceUsd) - (a.balance * a.priceUsd));

    const ethZero = assets.find((a) => (a.id === 'eth-main' || a.symbol === 'ETH') && a.network === 'ethereum');
    const usdcZero = assets.find((a) => (a.id === 'usdc-eth' || a.symbol === 'USDC') && a.network === 'ethereum');
    const solZero = assets.find((a) => (a.id === 'sol-main' || a.symbol === 'SOL') && a.network === 'solana');

    const coreZero = [ethZero, usdcZero, solZero].filter(
      (item): item is CryptoAsset => !!item && !withBalance.some((t) => t.id === item.id)
    );

    return [...withBalance, ...coreZero];
  }, [assets]);

  const activeAgents = agents.filter((a) => a.status === 'active');
  const recentTxs = transactions.slice(0, 5);

  const formatUsd = (num: number) => {
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatShortAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION: PORTFOLIO NET WORTH */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div id="tour-vault-balance" className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-mono font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
                VAULT OVERVIEW
              </span>
              <button
                onClick={handleCopyAddress}
                className="px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Copy Active Address"
              >
                <span>{activeSubWallet?.name || 'Primary Vault'}:</span>
                <span className="text-zinc-900 dark:text-zinc-200 font-mono font-semibold">
                  {formatShortAddress(activeSubWallet?.address || '')}
                </span>
                {copiedAddress ? (
                  <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                )}
              </button>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {formatUsd(totalNetWorthUsd)}
              </h1>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                title="Refresh Live Balances from Blockchain"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-zinc-900 dark:text-white' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Multi-chain balances across Ethereum, Solana, Base, Arbitrum & Sepolia Testnet.
            </p>
          </div>

          {/* Action Buttons */}
          <div id="tour-action-bar" className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onOpenSend()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs sm:text-sm hover:opacity-85 active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              Send
            </button>
            <button
              onClick={() => onOpenReceive()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black/[0.05] dark:bg-[#18181c] hover:bg-black/[0.08] dark:hover:bg-[#242429] text-zinc-900 dark:text-white active:scale-[0.98] font-medium text-xs sm:text-sm transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Receive
            </button>
            <button
              onClick={() => setShowAddFundsModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black/[0.05] dark:bg-[#18181c] hover:bg-black/[0.08] dark:hover:bg-[#242429] text-zinc-900 dark:text-white font-medium text-xs sm:text-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Funds
            </button>
            <button
              onClick={onNavigateApprovals}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-black/[0.05] dark:bg-[#18181c] hover:bg-black/[0.08] dark:hover:bg-[#242429] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white active:scale-[0.98] font-medium text-xs sm:text-sm transition-all cursor-pointer"
              title="MCP Action Approvals"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Approvals</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TWO-COLUMN LAYOUT: HOLDINGS (LEFT) vs WIDGETS (RIGHT) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: TOKEN HOLDINGS */}
        <div className="lg:col-span-2 space-y-4">
          <div id="tour-token-holdings" className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Token Holdings</h2>
              </div>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {visibleAssets.length} Assets
              </span>
            </div>

            <div className="space-y-1.5">
              {visibleAssets.map((asset) => {
                const totalValue = asset.balance * asset.priceUsd;
                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all cursor-pointer"
                    onClick={() => onOpenSend(asset.id)}
                  >
                    <div className="flex items-center gap-3">
                      {asset.icon ? (
                        <img
                          src={asset.icon}
                          alt={asset.name}
                          className="w-9 h-9 rounded-full object-cover bg-black"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center font-bold text-xs text-zinc-900 dark:text-white">
                          {asset.symbol.slice(0, 3)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                            {asset.symbol}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-black/[0.06] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300">
                            {asset.network}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 block">{asset.name}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-sm text-zinc-900 dark:text-white font-mono">
                        {asset.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 6,
                        })}{' '}
                        {asset.symbol}
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono block">
                        {formatUsd(totalValue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK PANELS */}
        <div className="space-y-6">
          {/* Panel 1: Connected Agents */}
          <div id="tour-connected-agents" className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Connected Agents</h3>
              </div>
              <button
                onClick={onNavigateAgents}
                className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeAgents.length === 0 ? (
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-black/40 text-center space-y-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No active AI agents connected</p>
                <button
                  onClick={onNavigateAgents}
                  className="text-xs px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold cursor-pointer shadow-sm"
                >
                  Connect Claude / GPT
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeAgents.slice(0, 3).map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center font-bold text-xs text-zinc-900 dark:text-white">
                        {agent.type === 'claude' ? 'C' : agent.type === 'chatgpt' ? 'GPT' : 'AI'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate max-w-[120px]">
                          {agent.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          {agent.duration === 'never' ? 'Permanent' : `Expires in ${agent.duration}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel 2: Multi-Wallet Accounts Summary */}
          <div className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Vault Accounts</h3>
              </div>
              <button
                onClick={onNavigateWallets}
                className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                All Accounts <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {subWallets.slice(0, 3).map((wallet) => {
                const isActive = wallet.id === activeSubWallet?.id;
                return (
                  <div
                    key={wallet.id}
                    onClick={() => setActiveWalletId(wallet.id)}
                    className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="truncate">
                      <p className="text-xs truncate font-medium">{wallet.name}</p>
                      <p className={`text-[10px] font-mono ${isActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'}`}>
                        {formatShortAddress(wallet.address)}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white text-black dark:bg-black dark:text-white font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel 3: Recent On-Chain Activity */}
          <div className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Recent Activity</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Live</span>
            </div>

            {recentTxs.length === 0 ? (
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-black/40 text-center space-y-1">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No recent transactions</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">Transfers will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center">
                        <ArrowUpRight className="w-3 h-3 text-zinc-900 dark:text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-900 dark:text-white capitalize font-medium">{tx.type}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-mono font-semibold text-zinc-900 dark:text-white">
                        {tx.fromAmount} {tx.fromAsset}
                      </p>
                      <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 font-medium">CONFIRMED</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ADD FUNDS / DEPOSIT MODAL (Rendered with React Portal to Document Body) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showAddFundsModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 sm:p-6 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl max-w-md w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              {/* Fixed Header */}
              <div className="p-6 pb-3 flex items-center justify-between shrink-0 bg-white dark:bg-[#121215]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Add Funds to Vault</h3>
                </div>
                <button
                  onClick={() => setShowAddFundsModal(false)}
                  className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-2 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-sm font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 pt-2 overflow-y-auto no-scrollbar space-y-4 flex-1">
                <div className="text-center space-y-3">
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    Transfer ETH, SOL, or Stablecoins directly to your active address:
                  </p>

                  {/* QR Code */}
                  <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl border border-black/[0.08] dark:border-transparent shadow-sm flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${activeSubWallet?.address}`}
                      alt="Wallet QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Address Box */}
                  <div className="p-3 bg-black/[0.03] dark:bg-black border border-black/[0.06] dark:border-white/[0.08] rounded-2xl flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate">
                      {activeSubWallet?.address}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="p-2 rounded-xl bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.12] dark:hover:bg-white/[0.12] text-zinc-900 dark:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy"
                    >
                      {copiedAddress ? (
                        <Check className="w-4 h-4 text-zinc-900 dark:text-white" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-transparent text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1">
                  <p className="text-zinc-900 dark:text-white font-semibold">Multi-Chain Deposit Ready</p>
                  <p className="text-zinc-500 dark:text-zinc-400">Supported: Ethereum, Sepolia, Base, Arbitrum, Polygon, Solana.</p>
                </div>

                <button
                  onClick={() => setShowAddFundsModal(false)}
                  className="w-full py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-85 transition-colors cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
