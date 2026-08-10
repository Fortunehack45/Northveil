import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Star,
  Loader2,
  Check,
  Plus,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { CryptoAsset } from '../types';
import { TokenService } from '../services/TokenService';
import { INITIAL_ASSETS } from '../data/initialData';

interface TokenSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken?: (asset: CryptoAsset) => void;
  onSelect?: (asset: CryptoAsset) => void;
  selectedAssetId?: string;
  title?: string;
  filterNetwork?: string;
}

export const TokenSearchModal: React.FC<TokenSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
  onSelect,
  selectedAssetId,
  title = 'SELECT TOKEN',
  filterNetwork,
}) => {
  const { assets, toggleFavoriteAsset, activeSubWallet, addCustomToken } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'favorites' | 'stables' | 'layer1' | 'defi'>('all');
  const [isResolvingContract, setIsResolvingContract] = useState(false);
  const [contractError, setContractError] = useState('');

  // Ensure assets fallback to INITIAL_ASSETS if assets array is empty
  const baseAssets = (assets && assets.length > 0) ? assets : INITIAL_ASSETS;

  // Filter assets by search query (symbol, name, contract address) and category
  const filteredAssets = useMemo(() => {
    let list = baseAssets;

    if (filterNetwork) {
      list = list.filter((a) => a.network === filterNetwork);
    }

    if (activeCategory === 'favorites') {
      const favs = list.filter((a) => a.isFavorite);
      list = favs.length > 0 ? favs : list;
    } else if (activeCategory === 'stables') {
      list = list.filter((a) => ['USDC', 'USDT', 'DAI', 'FDUSD', 'BUSD'].includes(a.symbol.toUpperCase()));
    } else if (activeCategory === 'layer1') {
      list = list.filter((a) => ['ETH', 'SOL', 'BTC', 'POL', 'BNB', 'AVAX', 'MATIC'].includes(a.symbol.toUpperCase()));
    } else if (activeCategory === 'defi') {
      list = list.filter((a) => ['UNI', 'AAVE', 'LINK', 'CRV', 'LDO', 'MKR', 'PENDLE', 'SNX'].includes(a.symbol.toUpperCase()));
    }

    const query = searchQuery.trim().toLowerCase();
    let result = list;
    if (query) {
      result = list.filter((a) => {
        const matchSymbol = (a.symbol || '').toLowerCase().includes(query);
        const matchName = (a.name || '').toLowerCase().includes(query);
        const matchContract = a.contractAddress ? a.contractAddress.toLowerCase().includes(query) : false;
        return matchSymbol || matchName || matchContract;
      });
    }

    // Sort Alphabetically by Symbol (A to Z)
    return [...result].sort((a, b) => (a.symbol || '').localeCompare(b.symbol || ''));
  }, [assets, filterNetwork, activeCategory, searchQuery]);

  const handleSelectAsset = (asset: CryptoAsset) => {
    if (onSelectToken) onSelectToken(asset);
    if (onSelect) onSelect(asset);
    onClose();
  };

  if (!isOpen) return null;

  // Handle Contract Resolution if user pastes a 0x address not in list
  const isAddressQuery = searchQuery.startsWith('0x') && searchQuery.length >= 38;
  const showContractImportButton = isAddressQuery && filteredAssets.length === 0;

  const handleResolveContract = async () => {
    setIsResolvingContract(true);
    setContractError('');
    try {
      const networkToUse = filterNetwork || 'ethereum';
      const walletAddressToUse = activeSubWallet?.address || '';
      const resolved = await TokenService.resolveCustomToken(searchQuery.trim(), networkToUse, walletAddressToUse);

      if (resolved) {
        addCustomToken(resolved);
        onSelectToken(resolved);
        onClose();
      } else {
        setContractError('Could not find ERC-20 contract on this network.');
      }
    } catch (e: any) {
      setContractError('Failed to resolve contract: ' + (e.message || e));
    } finally {
      setIsResolvingContract(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#141419] border-t-4 sm:border-2 border-white p-5 sm:p-8 max-w-lg w-full rounded-t-3xl sm:rounded-none shadow-[0px_-8px_20px_rgba(0,0,0,0.9)] sm:shadow-[12px_12px_0px_0px_#00f0ff] relative space-y-4 sm:space-y-5 max-h-[88vh] sm:max-h-[85vh] flex flex-col font-mono">
        {/* Native Mobile Sheet Pull Handle Bar */}
        <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-white pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#00f0ff] text-black border border-black shadow-[2px_2px_0px_0px_#000]">
              <Coins className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">{title}</h3>
              <p className="text-[10px] text-slate-300">SEARCH BY NAME, TICKER, OR CONTRACT ADDRESS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative shrink-0">
          <input
            type="text"
            placeholder="SEARCH TOKEN NAME, TICKER (ETH/USDC) OR 0X ADDRESS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full pl-10 pr-10 py-3 bg-[#0a0a0c] text-white font-mono font-black text-xs border-2 border-white shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:border-[#00f0ff] placeholder:text-slate-400 placeholder:font-normal"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1">
          {[
            { id: 'all', label: 'ALL' },
            { id: 'favorites', label: '★ FAVORITES' },
            { id: 'stables', label: 'STABLES' },
            { id: 'layer1', label: 'LAYER 1' },
            { id: 'defi', label: 'DEFI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'border-[#00f0ff] bg-[#00f0ff] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'border-white/20 bg-[#0a0a0c] text-slate-300 hover:border-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Token List View */}
        <div className="overflow-y-auto no-scrollbar flex-1 space-y-2 pr-1 pb-20 sm:pb-4 divide-y divide-white/10">
          {filteredAssets.length === 0 ? (
            <div className="py-8 text-center space-y-4 font-mono">
              {showContractImportButton ? (
                <div className="bg-[#0a0a0c] border-2 border-[#00f0ff] p-5 space-y-3 text-center shadow-[4px_4px_0px_0px_#000]">
                  <Sparkles className="w-8 h-8 text-[#00f0ff] mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase">UNTRACKED SMART CONTRACT DETECTED</h4>
                    <p className="text-[10px] text-slate-300 font-bold break-all">{searchQuery}</p>
                  </div>
                  <button
                    disabled={isResolvingContract}
                    onClick={handleResolveContract}
                    className="w-full py-2.5 bg-[#ccff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {isResolvingContract ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>READING SMART CONTRACT...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>IMPORT TOKEN FROM BLOCKCHAIN</span>
                      </>
                    )}
                  </button>
                  {contractError && <p className="text-[10px] text-[#ff007f] font-bold">{contractError}</p>}
                </div>
              ) : (
                <div className="text-slate-400 py-6">
                  <Coins className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase">NO TOKENS FOUND MATCHING "{searchQuery}"</p>
                  <p className="text-[10px] text-slate-400 mt-1">Try searching by ticker, name, or full 0x contract address.</p>
                </div>
              )}
            </div>
          ) : (
            filteredAssets.map((asset) => {
              if (!asset) return null;
              const symbol = asset.symbol || 'TOKEN';
              const name = asset.name || symbol;
              const network = asset.network || 'ethereum';
              const icon = asset.icon || 'https://assets.coingecko.com/coins/images/279/small/ethereum.png';
              const safePrice = typeof asset.priceUsd === 'number' && !isNaN(asset.priceUsd) ? asset.priceUsd : 0;
              const safeBalance = typeof asset.balance === 'number' && !isNaN(asset.balance) ? asset.balance : 0;
              const isSelected = selectedAssetId === asset.id;
              const usdValue = safeBalance * safePrice;

              return (
                <div
                  key={asset.id || `token-${Math.random()}`}
                  onClick={() => handleSelectAsset(asset)}
                  className={`flex items-center justify-between p-3 border-2 transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-[#00f0ff] bg-[#00f0ff]/10 shadow-[3px_3px_0px_0px_#00f0ff]'
                      : 'border-transparent hover:border-white/40 hover:bg-[#1a1a24]'
                  }`}
                >
                  {/* Left: Icon, Symbol, Name & Network */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={icon}
                        alt={symbol}
                        className="w-8 h-8 object-contain rounded-full border border-white/20 bg-black p-0.5"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 text-[8px] font-black uppercase px-1 bg-black text-[#00f0ff] border border-white/40">
                        {network.slice(0, 3)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white group-hover:text-[#00f0ff] uppercase">
                          {symbol}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00f0ff] stroke-[3]" />}
                      </div>
                      <p className="text-[10px] text-slate-300 font-bold max-w-[140px] truncate">{name}</p>
                    </div>
                  </div>

                  {/* Right: Balance, Price & Favorite Button */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs font-black font-mono text-white">
                        {safeBalance > 0 ? safeBalance.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'}{' '}
                        <span className="text-[10px] text-slate-400">{symbol}</span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        ${safePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {safeBalance > 0 && <span className="text-[#ccff00] font-bold"> (${usdValue.toFixed(2)})</span>}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (asset.id) toggleFavoriteAsset(asset.id);
                      }}
                      className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-[#ccff00] transition-colors cursor-pointer"
                      title={asset.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                    >
                      <Star className={`w-4 h-4 ${asset.isFavorite ? 'fill-[#ccff00] text-[#ccff00]' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
