import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../context/WalletContext';
import { CryptoAsset } from '../types';
import {
  Search,
  Check,
  Zap,
  Sparkles,
} from 'lucide-react';

interface TokenSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: CryptoAsset) => void;
  selectedAssetId?: string;
  title?: string;
}

export const TokenSearchModal: React.FC<TokenSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
  selectedAssetId,
  title = 'Select Token',
}) => {
  const { assets } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'holdings' | 'l1' | 'defi' | 'meme'>('all');

  const filteredTokens = useMemo(() => {
    // 1. Separate tokens with balance > 0 vs 0 balance
    const withBalance = assets
      .filter((a) => a.balance > 0)
      .sort((a, b) => (b.balance * b.priceUsd) - (a.balance * a.priceUsd));

    const ethZero = assets.find((a) => a.id === 'eth-main' || (a.symbol === 'ETH' && a.network === 'ethereum'));
    const usdcZero = assets.find((a) => a.id === 'usdc-eth' || (a.symbol === 'USDC' && a.network === 'ethereum'));
    const solZero = assets.find((a) => a.id === 'sol-main' || (a.symbol === 'SOL' && a.network === 'solana'));

    const coreZero = [ethZero, usdcZero, solZero].filter(
      (item): item is CryptoAsset => !!item && !withBalance.some((t) => t.id === item.id)
    );

    const baseList = [...withBalance, ...coreZero];

    return baseList.filter((asset) => {
      // Category filter
      if (activeCategory === 'holdings' && asset.balance <= 0) return false;
      if (activeCategory === 'meme' && !asset.name.toLowerCase().includes('pepe') && !asset.name.toLowerCase().includes('doge') && !asset.name.toLowerCase().includes('bonk')) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = asset.name.toLowerCase().includes(q);
        const matchSym = asset.symbol.toLowerCase().includes(q);
        const matchAddr = asset.contractAddress && asset.contractAddress.toLowerCase().includes(q);
        return matchName || matchSym || matchAddr;
      }
      return true;
    });
  }, [assets, searchQuery, activeCategory]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
      <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] p-6 max-w-md w-full rounded-3xl shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 shrink-0">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-1 text-sm font-medium cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <div className="relative shrink-0">
          <input
            type="text"
            placeholder="Search name or paste contract address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-black dark:focus:border-white"
            autoFocus
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Categories */}
        <div className="mono-segmented-container w-full flex shrink-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'holdings', label: 'Holdings' },
            { id: 'l1', label: 'Layer 1' },
            { id: 'meme', label: 'Meme' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Token List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-1">
          {filteredTokens.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No matching tokens found.
            </div>
          ) : (
            filteredTokens.map((token) => {
              const isSelected = token.id === selectedAssetId;
              return (
                <div
                  key={token.id}
                  onClick={() => onSelectToken(token)}
                  className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={token.icon}
                      alt={token.symbol}
                      className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs">{token.symbol}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'}`}>
                          {token.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono capitalize block ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {token.network}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="font-semibold">
                      ${token.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    {token.balance > 0 && (
                      <span className={`text-[10px] ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {token.balance.toLocaleString()} {token.symbol}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
