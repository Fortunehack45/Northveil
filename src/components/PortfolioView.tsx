import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { CustomSelect } from './CustomSelect';
import { ImportTokenModal } from './ImportTokenModal';
import {
  Wallet,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  BarChart2,
  ChevronDown,
  CandlestickChart,
  Users,
  ArrowRightLeft,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  LayoutGrid,
  List,
} from 'lucide-react';

import { TokenDetailsView } from './TokenDetailsView';
import { CryptoAsset } from '../types';
import { SUPPORTED_CHAINS } from '../data/initialData';

interface PortfolioViewProps {
  onOpenSend: (assetId?: string) => void;
  onOpenReceive: (assetId?: string) => void;
  onNavigateSwap: (assetId?: string) => void;
  onNavigateDAppBrowser?: () => void;
  onNavigateNFT?: () => void;
  onNavigateBuySell?: (assetId?: string, mode?: 'buy' | 'sell') => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  onOpenSend,
  onOpenReceive,
  onNavigateSwap,
  onNavigateDAppBrowser,
  onNavigateNFT,
  onNavigateBuySell,
}) => {
  const {
    assets,
    subWallets,
    activeWalletId,
    activeSubWallet,
    setActiveWalletId,
    createSubWallet,
    ownedNFTs,
    historicalPerformance,
  } = useWallet();

  const totalUsd = assets.reduce((sum, a) => sum + (a.balance * a.priceUsd), 0);
  const totalDeposits = totalUsd > 0 ? totalUsd * 0.85 : 0;
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');
  const [selectedAsset, setSelectedAsset] = useState<string>('ETH');
  const [selectedVaultNft, setSelectedVaultNft] = useState<any | null>(null);
  const [nftViewMode, setNftViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTokenDetails, setSelectedTokenDetails] = useState<CryptoAsset | null>(null);
  const [showAddWalletModal, setShowAddWalletModal] = useState<boolean>(false);
  const [quickWalletName, setQuickWalletName] = useState<string>('');
  const [showImportTokenModal, setShowImportTokenModal] = useState<boolean>(false);

  useEffect(() => {
    const handleCustomTokenOpen = (e: Event) => {
      const customEvent = e as CustomEvent<CryptoAsset>;
      if (customEvent.detail) {
        setSelectedTokenDetails(customEvent.detail);
        document.querySelector('main')?.scrollTo(0, 0);
      }
    };
    const handleResetPortfolio = () => {
      setSelectedTokenDetails(null);
    };

    window.addEventListener('open-token-details', handleCustomTokenOpen as EventListener);
    window.addEventListener('reset-portfolio', handleResetPortfolio);
    return () => {
      window.removeEventListener('open-token-details', handleCustomTokenOpen as EventListener);
      window.removeEventListener('reset-portfolio', handleResetPortfolio);
    };
  }, []);

  const handleOpenTokenDetails = (asset: CryptoAsset) => {
    setSelectedTokenDetails(asset);
    document.querySelector('main')?.scrollTo(0, 0);
  };

  const handleCreateWalletFromDashboard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = quickWalletName.trim() || `Sub-Account #${subWallets.length + 1}`;
    const newW = createSubWallet(finalName);
    if (newW) {
      setActiveWalletId(newW.id);
    }
    setQuickWalletName('');
    setShowAddWalletModal(false);
  };

  if (selectedTokenDetails) {
    return (
      <TokenDetailsView
        asset={selectedTokenDetails}
        onBack={() => setSelectedTokenDetails(null)}
        onOpenSend={onOpenSend}
        onOpenReceive={onOpenReceive}
        onNavigateSwap={onNavigateSwap}
        onNavigateBuySell={onNavigateBuySell}
      />
    );
  }

  // Chain Allocation Items
  const chainAllocations = assets
    .filter(a => a.balance * a.priceUsd > 0)
    .map((a, i) => {
      const amountUsd = a.balance * a.priceUsd;
      const pct = totalUsd > 0 ? (amountUsd / totalUsd) * 100 : 0;
      const palette = ['#ccff00', '#00f0ff', '#ff007f', '#9d00ff', '#ff7b00'];
      const color = palette[i % palette.length];
      const isImageUrl = a.icon.length > 5 || a.icon.startsWith('http');
      
      return {
        name: a.name,
        icon: isImageUrl ? undefined : a.icon,
        iconUrl: isImageUrl ? a.icon : undefined,
        symbol: a.symbol,
        amount: `$ ${amountUsd.toFixed(2)}`,
        pct: `${pct.toFixed(2)}%`,
        color: color
      };
    })
    .sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct))
    .slice(0, 5);
  const [showZeroBalances, setShowZeroBalances] = useState<boolean>(false);

  const candlestickPoints = historicalPerformance;

  const MAIN_NATIVE_SYMBOLS = useMemo(() => new Set(['ETH', 'SOL', 'BTC', 'BNB', 'POL', 'MATIC', 'AVAX', 'ARB']), []);

  const filteredAssetsList = useMemo(() => {
    if (showZeroBalances) return assets;

    return assets.filter(asset => {
      const usdVal = asset.balance * asset.priceUsd;
      const symUpper = asset.symbol?.toUpperCase() || '';
      const isMainNative = MAIN_NATIVE_SYMBOLS.has(symUpper) || 
                           asset.id?.startsWith('native-') || 
                           asset.id?.endsWith('-native') || 
                           asset.id?.endsWith('-main');

      // Rule 1: Always include main coins from the 7 primary blockchains even if balance is 0
      if (isMainNative) return true;

      // Rule 2: Include other tokens ONLY if they have real balance and real non-zero USD value (> $0.0001)
      // Filters out spam dust tokens like MEZO 0.00000017 with $0.00 value
      return asset.balance > 0.000001 && usdVal >= 0.0001;
    });
  }, [assets, showZeroBalances, MAIN_NATIVE_SYMBOLS]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssetsList].sort((a, b) => {
      const valA = a.balance * a.priceUsd;
      const valB = b.balance * b.priceUsd;
      if (valB !== valA) return valB - valA;
      if (b.balance !== a.balance) return b.balance - a.balance;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [filteredAssetsList]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 sm:space-y-6 pb-12 w-full">
      {/* Active Sub-Wallet Header Control Bar */}
      <div className="bg-[#141419] border-2 border-white p-2.5 sm:p-4 shadow-[3px_3px_0px_0px_#00f0ff] sm:shadow-[4px_4px_0px_0px_#00f0ff] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 font-mono w-full min-w-0 max-w-full relative z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full sm:w-auto">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_#000]" style={{ backgroundColor: activeSubWallet.colorTag || '#00f0ff' }}>
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[3]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[8px] sm:text-[9px] bg-[#00f0ff] text-black px-1 py-0.2 font-black uppercase border border-black shrink-0">
                ACTIVE WALLET
              </span>
              <h3 className="text-xs sm:text-base font-black text-white truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs">{activeSubWallet?.name || 'Account 1'}</h3>
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              <span className="hidden xs:inline">{activeSubWallet?.derivationPath || "m/44'/60'/0'/0/0"} • </span>
              <span className="text-[#ccff00] font-bold">
                {activeSubWallet?.address ? (
                  activeSubWallet.address.length > 10 ? `${activeSubWallet.address.slice(0, 8)}...${activeSubWallet.address.slice(-6)}` : activeSubWallet.address
                ) : '0x...'}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Sub-Wallet Switcher & Add Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
          <CustomSelect
            options={(subWallets || []).map((w) => {
              const addr = w?.address || '';
              const short = addr.length > 8 ? `${addr.slice(0, 6)}...` : addr;
              return {
                value: w?.id || '',
                label: `${w?.name || 'Wallet'} (${short})`,
              };
            })}
            value={activeWalletId}
            onChange={(val) => setActiveWalletId(val)}
            variant="dark"
            className="flex-1 min-w-0 sm:w-64"
            compact
          />

          <button
            type="button"
            onClick={() => setShowAddWalletModal(true)}
            className="px-2 sm:px-3 py-1.5 bg-[#ccff00] text-black font-mono font-black text-[11px] sm:text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33] whitespace-nowrap shrink-0 active:translate-x-0.5 active:translate-y-0.5"
          >
            + ADD WALLET
          </button>
        </div>
      </div>

      {/* 1. Top KPI Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
        {/* Card 1: Total Assets */}
        <div className="bg-[#141419] border-2 border-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#ccff00] sm:shadow-[5px_5px_0px_0px_#ccff00] flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ccff00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000] shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-mono font-black text-[#ccff00] uppercase tracking-wider block truncate">
              TOTAL ASSETS
            </span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 truncate">
              $ {totalUsd > 0 && totalUsd < 0.01 ? totalUsd.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Card 2: Total deposits */}
        <div className="bg-[#141419] border-2 border-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#00f0ff] sm:shadow-[5px_5px_0px_0px_#00f0ff] flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00f0ff] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000] shrink-0">
            <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-mono font-black text-[#00f0ff] uppercase tracking-wider block truncate">
              TOTAL DEPOSITS
            </span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 truncate">
              $ {totalDeposits > 0 && totalDeposits < 0.01 ? totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Card 3: APY */}
        <div className="bg-[#141419] border-2 border-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#ff007f] sm:shadow-[5px_5px_0px_0px_#ff007f] flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ff007f] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000] shrink-0">
            <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-mono font-black text-[#ff007f] uppercase tracking-wider block truncate">
              ESTIMATED APY
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#ccff00] font-mono mt-0.5 truncate">
              + 0.00%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Middle Section: Portfolios performance Chart & Chain Allocation Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width): Portfolios performance Candlestick Chart & Owned NFTs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141419] border-2 border-white p-6 sm:p-7 shadow-[6px_6px_0px_0px_#ffe600]">
            <div>
              {/* Chart Header & Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#ffe600] text-black font-black text-[10px] uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                    ANALYTICS
                  </span>
                  <h3 className="text-lg font-black text-white font-mono tracking-tight uppercase">
                    PORTFOLIOS PERFORMANCE
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Asset Dropdown Pill */}
                  <CustomSelect
                    options={['ETH', 'BTC', 'SOL']}
                    value={selectedAsset}
                    onChange={(val) => setSelectedAsset(val)}
                    variant="yellow"
                  />

                  {/* Candlestick Toggle Button */}
                  <button
                    className="p-1.5 bg-[#00f0ff] border-2 border-black text-black font-black shadow-[2px_2px_0px_0px_#000]"
                    title="Toggle Candlesticks"
                  >
                    <CandlestickChart className="w-4 h-4 text-black stroke-[3]" />
                  </button>

                  {/* Timeframe Pills */}
                  <div className="flex items-center gap-1 bg-[#0a0a0c] p-1 border-2 border-white">
                    {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2.5 py-1 text-[11px] font-mono font-black transition-all cursor-pointer ${
                          timeframe === tf
                            ? 'bg-[#ccff00] text-black border border-black shadow-[2px_2px_0px_0px_#000]'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Interactive Candlestick Chart Area */}
              {(() => {
                const hasChartData = candlestickPoints.length > 0;
                const allPrices = candlestickPoints.flatMap(pt => [pt.high, pt.low]);
                const chartMax = hasChartData ? Math.max(...allPrices) * 1.05 : 4500;
                const chartMin = hasChartData ? Math.max(0, Math.min(...allPrices) * 0.95) : 3000;
                const chartRange = chartMax - chartMin || 1;
                
                const currentPrice = hasChartData ? candlestickPoints[candlestickPoints.length - 1].close : 0;
                const currentPricePct = hasChartData ? 100 - ((currentPrice - chartMin) / chartRange) * 100 : 0;
                
                const gridSteps = 4;
                const gridValues = Array.from({ length: gridSteps }, (_, i) => 
                  chartMax - (chartRange / (gridSteps - 1)) * i
                );

                return (
                  <div className="relative h-64 sm:h-72 w-full bg-[#0a0a0c] border-2 border-white p-4 flex flex-col justify-between overflow-hidden">
                    {/* Background Horizontal Grid Lines */}
                    {hasChartData && (
                      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-30">
                        {gridValues.map((val, i) => (
                          <div key={i} className={`border-b border-dashed ${i === 0 ? 'border-[#ccff00] text-[#ccff00]' : 'border-slate-600 text-slate-400'} text-[10px] font-mono`}>
                            $ {val > 0 && val < 0.01 ? val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 }) : val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Floating Price Pill Tag on Right */}
                    {hasChartData && (
                      <div 
                        className="absolute right-3 z-10 bg-[#ff007f] text-white font-mono text-[10px] sm:text-xs font-black px-2.5 py-1 border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all"
                        style={{ top: `${Math.max(5, Math.min(95, currentPricePct))}%`, transform: 'translateY(-50%)' }}
                      >
                        $ {currentPrice > 0 && currentPrice < 0.01 ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 }) : currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    )}

                    {/* Candlestick Bars Container */}
                    <div className="h-full w-full flex items-end justify-between px-2 pt-6 relative z-0">
                      {hasChartData ? candlestickPoints.map((pt, idx) => {
                        const bodyTopPct = 100 - ((Math.max(pt.open, pt.close) - chartMin) / chartRange) * 100;
                        const bodyBottomPct = 100 - ((Math.min(pt.open, pt.close) - chartMin) / chartRange) * 100;
                        const bodyHeightPct = Math.max(2, bodyBottomPct - bodyTopPct);

                        const wickTopPct = 100 - ((pt.high - chartMin) / chartRange) * 100;
                        const wickBottomPct = 100 - ((pt.low - chartMin) / chartRange) * 100;

                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center justify-end h-full flex-1 group cursor-pointer"
                          >
                            {/* Wick line */}
                            <div
                              className={`w-0.5 sm:w-1 absolute bottom-12 ${
                                pt.isGreen ? 'bg-[#ccff00]' : 'bg-[#ff007f]'
                              }`}
                              style={{
                                top: `${wickTopPct}%`,
                                bottom: `${100 - wickBottomPct}%`,
                              }}
                            />

                            {/* Candle Body */}
                            <div
                              className={`w-3 sm:w-5 border border-black relative z-10 transition-transform group-hover:scale-110 ${
                                pt.isGreen
                                  ? 'bg-[#ccff00] shadow-[2px_2px_0px_0px_#000]'
                                  : 'bg-[#ff007f] shadow-[2px_2px_0px_0px_#000]'
                              }`}
                              style={{
                                height: `${bodyHeightPct}%`,
                              }}
                            />
                          </div>
                        );
                      }) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 font-mono text-[10px] sm:text-xs uppercase z-20">
                          <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff007f] mb-3 stroke-[2.5]" />
                          <span className="font-bold">NO HISTORICAL DATA FOUND</span>
                          <span className="text-[9px] mt-1 text-slate-600">CONNECT OMNICHAIN API KEY IN SETTINGS</span>
                        </div>
                      )}
                    </div>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 pt-2 border-t-2 border-white mt-2 relative z-10 px-2">
                      {candlestickPoints.length > 0 ? (
                        [
                          candlestickPoints[0],
                          candlestickPoints[Math.floor(candlestickPoints.length * 0.25)],
                          candlestickPoints[Math.floor(candlestickPoints.length * 0.5)],
                          candlestickPoints[Math.floor(candlestickPoints.length * 0.75)],
                          candlestickPoints[candlestickPoints.length - 1],
                        ].map((pt, idx) => (
                          <span key={idx}>{pt?.date || ''}</span>
                        ))
                      ) : null}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 2b. Owned NFTs Section */}
          <div className="bg-[#141419] border-2 border-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-4 font-mono">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-[#00f0ff] text-black font-black text-[10px] uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                  {ownedNFTs.length > 4 ? `SHOWING 4 OF ${ownedNFTs.length} NFTS` : `${ownedNFTs.length} STORED IN VAULT`}
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#ccff00]" />
                  <span>OWNED NFT COLLECTIBLES</span>
                </h3>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                {/* Grid vs List View Mode Toggle */}
                <div className="flex items-center bg-[#0a0a0c] p-1 border-2 border-white shadow-[2px_2px_0px_0px_#000]">
                  <button
                    type="button"
                    onClick={() => setNftViewMode('grid')}
                    className={`p-1.5 transition-all cursor-pointer ${
                      nftViewMode === 'grid'
                        ? 'bg-[#ccff00] text-black border border-black shadow-[1px_1px_0px_0px_#000]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNftViewMode('list')}
                    className={`p-1.5 transition-all cursor-pointer ${
                      nftViewMode === 'list'
                        ? 'bg-[#ccff00] text-black border border-black shadow-[1px_1px_0px_0px_#000]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {onNavigateNFT && (
                  <button
                    onClick={onNavigateNFT}
                    className="px-3 py-1 bg-[#ccff00] text-black font-black text-[11px] uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>EXPLORE GALLERY</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>

            {/* NFT Rendering: Grid or List (Max 4 items on Home Page) */}
            {nftViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5 min-h-[250px]">
                {ownedNFTs.length > 0 ? (
                  <>
                    {ownedNFTs.slice(0, 4).map((nft) => (
                      <div
                        key={nft.id}
                        onClick={() => setSelectedVaultNft(nft)}
                        className="bg-[#0a0a0c] border-2 border-white p-3 shadow-[4px_4px_0px_0px_#00f0ff] hover:shadow-[6px_6px_0px_0px_#ccff00] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="relative aspect-square w-full bg-[#141419] border-2 border-white overflow-hidden">
                            <img
                              src={nft.image}
                              alt={nft.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#ff007f] text-white font-black text-[9px] uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                              {nft.network}
                            </span>
                            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-[#ccff00] font-black text-[9px] border border-white/50">
                              {nft.tokenId}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block truncate uppercase">
                              {nft.collection}
                            </span>
                            <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">
                              {nft.name}
                            </h4>
                          </div>
                        </div>

                        <div className="pt-2 mt-3 border-t border-white/20 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">FLOOR</span>
                            <span className="text-xs font-black text-[#ccff00]">{nft.floorPrice}</span>
                          </div>
                          <span className="text-[10px] text-slate-300 font-bold px-1.5 py-0.5 bg-[#141419] border border-white/40">
                            {nft.estUsd}
                          </span>
                        </div>
                      </div>
                    ))}
                    {ownedNFTs.length > 4 && (
                      <div
                        onClick={onNavigateNFT}
                        className="col-span-full sm:col-span-1 bg-[#181824] border-2 border-dashed border-[#ccff00] p-6 shadow-[4px_4px_0px_0px_#ff007f] hover:bg-[#202030] transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                      >
                        <span className="w-10 h-10 rounded-full bg-[#ccff00] text-black font-black text-sm flex items-center justify-center border border-black shadow-[2px_2px_0px_0px_#000] group-hover:scale-110 transition-transform">
                          +{ownedNFTs.length - 4}
                        </span>
                        <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
                          MORE NFTS IN GALLERY
                        </span>
                        <span className="text-[10px] text-[#00f0ff] font-mono font-bold flex items-center gap-1">
                          VIEW ALL {ownedNFTs.length} NFTS <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center border-2 border-dashed border-white/20 text-slate-500 font-mono text-xs uppercase min-h-[250px] bg-[#0a0a0c]">
                    <ImageIcon className="w-8 h-8 mb-3 opacity-50" />
                    <span>NO NFTS IN VAULT</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 min-h-[250px]">
                {ownedNFTs.length > 0 ? (
                  <>
                    {ownedNFTs.slice(0, 4).map((nft) => (
                      <div
                        key={nft.id}
                        onClick={() => setSelectedVaultNft(nft)}
                        className="bg-[#0a0a0c] border-2 border-white p-3 shadow-[3px_3px_0px_0px_#00f0ff] hover:shadow-[4px_4px_0px_0px_#ccff00] transition-all cursor-pointer group flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-[#141419] border-2 border-white overflow-hidden shrink-0">
                            <img
                              src={nft.image}
                              alt={nft.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.2 bg-[#ff007f] text-white font-black text-[8px] sm:text-[9px] uppercase border border-black">
                                {nft.network}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold">{nft.tokenId}</span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-white uppercase truncate mt-0.5 group-hover:text-[#ccff00] transition-colors">
                              {nft.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-bold block truncate uppercase">
                              {nft.collection}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">FLOOR</span>
                            <div className="text-xs font-black text-[#ccff00] text-right">{nft.floorPrice}</div>
                            <div className="text-[10px] text-slate-300 font-bold text-right">{nft.estUsd}</div>
                          </div>
                          <button
                            type="button"
                            className="hidden xs:inline-block px-3 py-1 bg-[#00f0ff] text-black font-black text-[10px] uppercase border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]"
                          >
                            INSPECT
                          </button>
                        </div>
                      </div>
                    ))}
                    {ownedNFTs.length > 4 && (
                      <button
                        onClick={onNavigateNFT}
                        className="w-full p-3 bg-[#181824] border-2 border-dashed border-[#ccff00] text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#202030] transition-all cursor-pointer"
                      >
                        <span>+{ownedNFTs.length - 4} MORE NFTS IN GALLERY</span>
                        <ArrowUpRight className="w-4 h-4 text-[#00f0ff]" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 text-slate-500 font-mono text-xs uppercase min-h-[250px] bg-[#0a0a0c]">
                    <List className="w-8 h-8 mb-3 opacity-50" />
                    <span>NO NFTS IN VAULT</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width): Chain Allocation & Community Cards */}
        <div className="flex flex-col justify-between gap-6">
          {/* Chain Allocation Card */}
          <div className="bg-[#141419] border-2 border-white p-5 shadow-[5px_5px_0px_0px_#00f0ff] space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase tracking-tight">CHAIN ALLOCATION</h3>

            <div className="space-y-3 min-h-[160px]">
              {chainAllocations.length > 0 ? chainAllocations.map((chain) => (
                <div key={chain.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-6 h-6 text-black border border-black font-black flex items-center justify-center text-[11px] shadow-[1px_1px_0px_0px_#000]"
                        style={{ backgroundColor: chain.color }}
                      >
                        {chain.iconUrl ? (
                          <img src={chain.iconUrl} alt={chain.name} className="w-4 h-4 object-contain" />
                        ) : (
                          chain.icon
                        )}
                      </span>
                      <span className="text-white uppercase">{chain.name}</span>
                    </div>
                    <span className="font-mono" style={{ color: chain.color }}>{chain.amount}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-[#0a0a0c] border border-white flex items-center justify-between">
                    <div
                      className="h-full border-r border-black"
                      style={{ width: chain.pct, backgroundColor: chain.color }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right font-mono font-bold">{chain.pct}</div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[160px] border-2 border-dashed border-white/20 text-slate-500 font-mono text-[10px] uppercase">
                  <span>NO CHAIN ALLOCATIONS</span>
                </div>
              )}
            </div>

            <button className="w-full py-2 bg-[#ccff00] text-black font-black border-2 border-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer">
              VIEW ALL ALLOCATIONS
            </button>
          </div>

          {/* Join Our Community Card */}
          <div className="bg-[#141419] border-2 border-white p-5 shadow-[5px_5px_0px_0px_#ff007f] text-center space-y-3">
            <div className="flex justify-center -space-x-2 overflow-hidden py-0.5">
              <img
                className="inline-block h-8 w-8 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Member 1"
              />
              <img
                className="inline-block h-8 w-8 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Member 2"
              />
              <img
                className="inline-block h-8 w-8 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                alt="Member 3"
              />
            </div>

            <div>
              <h4 className="text-sm font-black text-white uppercase font-mono">JOIN OUR COMMUNITY</h4>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5 max-w-xs mx-auto">
                CONNECT WITH 120,000+ TRADERS & HARDWARE SECURITY ENTHUSIASTS.
              </p>
            </div>

            <button className="w-full py-2 bg-[#ff007f] text-white font-black border-2 border-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] hover:bg-[#ff3399] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer">
              JOIN NOW
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="bg-[#141419] border-2 border-white p-3.5 sm:p-4 shadow-[4px_4px_0px_0px_#ffe600] sm:shadow-[5px_5px_0px_0px_#ffe600] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />
          <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
            QUICK VAULT ACTIONS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenSend()}
            className="px-3 sm:px-4 py-2 bg-[#ccff00] text-black font-mono font-black text-[11px] sm:text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-center truncate"
          >
            SEND CRYPTO
          </button>

          <button
            onClick={() => onOpenReceive()}
            className="px-3 sm:px-4 py-2 bg-[#00f0ff] text-black font-mono font-black text-[11px] sm:text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] hover:bg-[#33f3ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-center truncate"
          >
            RECEIVE DEPOSIT
          </button>

          <button
            onClick={onNavigateSwap}
            className="px-3 sm:px-4 py-2 bg-[#ffe600] text-black font-mono font-black text-[11px] sm:text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] hover:bg-[#fff033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-center truncate"
          >
            DEX SWAP
          </button>

          {onNavigateDAppBrowser && (
            <button
              onClick={onNavigateDAppBrowser}
              className="px-3 sm:px-4 py-2 bg-[#ff007f] text-white font-mono font-black text-[11px] sm:text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] hover:bg-[#ff3399] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-center truncate"
            >
              DAPP BROWSER
            </button>
          )}
        </div>
      </div>

      {/* 3. Bottom Table Section: Tokens */}
      <div className="bg-[#141419] border-2 border-white p-4 sm:p-7 shadow-[6px_6px_0px_0px_#ccff00] space-y-4 font-mono">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm sm:text-base font-black text-white uppercase font-mono">PORTFOLIO ASSET TOKENS</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowZeroBalances(prev => !prev)}
              className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-black border border-black shadow-[1.5px_1.5px_0px_0px_#000] cursor-pointer uppercase ${
                showZeroBalances ? 'bg-[#ff007f] text-white' : 'bg-[#141419] text-slate-300 border-white/40 hover:text-white'
              }`}
            >
              {showZeroBalances ? 'HIDE ZERO BALANCES' : 'SHOW ALL TOKENS'}
            </button>
            <button
              onClick={() => setShowImportTokenModal(true)}
              className="px-2.5 py-1 bg-[#00f0ff] text-black text-[9px] sm:text-[10px] font-black border border-black shadow-[1.5px_1.5px_0px_0px_#000] hover:bg-[#33f3ff] cursor-pointer uppercase"
            >
              + IMPORT TOKEN
            </button>
            <span className="px-2 py-0.5 bg-[#ccff00] text-black text-[9px] sm:text-[10px] font-black border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              REAL-TIME PRICE FEED
            </span>
          </div>
        </div>

        {/* Mobile View: Clean, readable asset cards */}
        <div className="md:hidden space-y-3 font-mono">
          {sortedAssets.map((asset) => {
            const usdVal = asset.balance * asset.priceUsd;
            const cleanName = asset.name.replace(/\s*\(.*?\)\s*/g, '').trim();
            const chainInfo = SUPPORTED_CHAINS.find(c => c.id === asset.network);
            
            return (
              <div
                key={asset.id}
                onClick={() => handleOpenTokenDetails(asset)}
                className="bg-[#0a0a0c] border-2 border-white p-3 shadow-[4px_4px_0px_0px_#ccff00] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0 flex items-center justify-center">
                      <img
                        src={asset.icon}
                        alt={asset.symbol}
                        className="w-7 h-7 bg-[#ffe600] p-0.5 border border-black shadow-[1.5px_1.5px_0px_0px_#000] object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.dataset.failed) {
                            target.dataset.failed = 'true';
                            target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><rect width="28" height="28" fill="%23ccff00"/><text x="50%" y="50%" font-family="monospace" font-weight="900" font-size="12" fill="black" text-anchor="middle" dominant-baseline="central">${asset.symbol[0]}</text></svg>`;
                          }
                        }}
                      />
                      {chainInfo && (
                        <span 
                          className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-[#141419] border border-white flex items-center justify-center shadow-sm z-10"
                          title={chainInfo.name}
                        >
                          <img src={chainInfo.icon} alt={chainInfo.name} className="w-2.5 h-2.5 object-contain" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-white text-sm uppercase flex items-center gap-1 truncate">
                        <span>{cleanName}</span>
                        {asset.isFavorite && <span className="text-[#ffe600] text-xs">★</span>}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{asset.symbol}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-[#ccff00] block">
                      ${usdVal > 0 && usdVal < 0.01 ? usdVal.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold block">
                      {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })} {asset.symbol}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenTokenDetails(asset)}
                    className="flex-1 py-1.5 bg-[#ccff00] text-black font-black border-2 border-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    DETAILS
                  </button>
                  <button
                    onClick={() => onNavigateSwap(asset.id)}
                    className="flex-1 py-1.5 bg-[#00f0ff] text-black font-black border-2 border-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-[#33f3ff] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    TRADE
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-white text-[11px] font-black font-mono text-[#ccff00] uppercase tracking-wider">
                <th className="pb-3 pl-2">NAME</th>
                <th className="pb-3 text-right">BALANCE</th>
                <th className="pb-3 text-right">TOTAL VALUE</th>
                <th className="pb-3 text-right pr-2">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-xs sm:text-sm font-mono">
              {sortedAssets.map((asset) => {
                const usdVal = asset.balance * asset.priceUsd;
                const cleanName = asset.name.replace(/\s*\(.*?\)\s*/g, '').trim();
                const chainInfo = SUPPORTED_CHAINS.find(c => c.id === asset.network);

                return (
                  <tr
                    key={asset.id}
                    onClick={() => handleOpenTokenDetails(asset)}
                    className="hover:bg-[#1a1a22] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <img
                            src={asset.icon}
                            alt={asset.symbol}
                            className="w-8 h-8 bg-[#ffe600] p-1 border border-black shadow-[2px_2px_0px_0px_#000] object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (!target.dataset.failed) {
                                target.dataset.failed = 'true';
                                target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23ccff00"/><text x="50%" y="50%" font-family="monospace" font-weight="900" font-size="14" fill="black" text-anchor="middle" dominant-baseline="central">${asset.symbol[0]}</text></svg>`;
                              }
                            }}
                          />
                          {chainInfo && (
                            <span 
                              className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#141419] border border-white flex items-center justify-center shadow-[1px_1px_0px_0px_#000] z-10"
                              title={chainInfo.name}
                            >
                              <img src={chainInfo.icon} alt={chainInfo.name} className="w-3 h-3 object-contain" />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-white uppercase group-hover:text-[#ccff00] transition-colors flex items-center gap-1.5">
                            <span>{cleanName}</span>
                            {asset.isFavorite && <span className="text-[#ffe600]">★</span>}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{asset.symbol}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-right font-mono text-slate-200 font-bold">
                      {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })} {asset.symbol}
                    </td>

                    <td className="py-4 text-right font-mono font-black text-[#ccff00]">
                      ${usdVal > 0 && usdVal < 0.01 ? usdVal.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenTokenDetails(asset)}
                          className="px-3 py-1.5 bg-[#ccff00] text-black font-black border-2 border-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
                        >
                          DETAILS
                        </button>
                        <button
                          onClick={() => onNavigateSwap(asset.id)}
                          className="px-3 py-1.5 bg-[#00f0ff] text-black font-black border-2 border-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-[#33f3ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
                        >
                          TRADE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vault NFT Inspection Modal */}
      {selectedVaultNft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
          <div className="bg-[#141419] border-4 border-white p-6 max-w-lg w-full shadow-[12px_12px_0px_0px_#ccff00] relative space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <span className="px-2 py-0.5 bg-[#ccff00] text-black text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                VAULT COLLECTIBLE INSPECTOR
              </span>
              <button
                onClick={() => setSelectedVaultNft(null)}
                className="px-2 py-1 bg-[#ff007f] text-white font-black border-2 border-black cursor-pointer hover:bg-[#ff3399]"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <img
                src={selectedVaultNft.image}
                alt={selectedVaultNft.name}
                className="w-36 h-36 object-cover border-4 border-black shadow-[4px_4px_0px_0px_#00f0ff] shrink-0"
              />
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs text-slate-400 font-bold uppercase">{selectedVaultNft.collection}</span>
                <h3 className="text-xl font-black text-white uppercase">{selectedVaultNft.name}</h3>
                <div className="text-xs font-black text-[#ccff00]">
                  FLOOR PRICE: {selectedVaultNft.floorPrice} ({selectedVaultNft.estUsd})
                </div>
                <div className="text-[11px] text-slate-300">
                  CONTRACT: <span className="text-white font-bold">{selectedVaultNft.contract}</span>
                </div>
                <div className="inline-block px-2 py-0.5 bg-[#ff007f] text-white text-[10px] font-black uppercase border border-black">
                  NETWORK: {selectedVaultNft.network}
                </div>
              </div>
            </div>

            <div className="border-t-2 border-white/20 pt-4 space-y-2">
              <h4 className="text-xs font-black text-white uppercase">RARITY TRAITS:</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedVaultNft.attributes.map((attr: any, idx: number) => (
                  <div key={idx} className="bg-[#0a0a0c] p-2 border border-white text-[11px]">
                    <span className="text-slate-400 font-bold block uppercase">{attr.trait}:</span>
                    <span className="text-[#ccff00] font-black">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  alert(`Initiating Web3 signature to transfer ${selectedVaultNft.name}...`);
                  setSelectedVaultNft(null);
                }}
                className="flex-1 py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer"
              >
                TRANSFER COLLECTIBLE
              </button>
              {onNavigateNFT && (
                <button
                  onClick={() => {
                    setSelectedVaultNft(null);
                    onNavigateNFT();
                  }}
                  className="px-4 py-3 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#33f3ff] cursor-pointer"
                >
                  FULL GALLERY
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Sub-Wallet Modal */}
      {showAddWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono">
          <div className="bg-[#141419] border-4 border-white p-6 max-w-md w-full shadow-[8px_8px_0px_0px_#ccff00] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#ccff00] border border-black flex items-center justify-center text-black font-black">
                  +
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">DERIVE NEW SUB-WALLET</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddWalletModal(false)}
                className="px-2 py-0.5 bg-[#ff007f] text-white font-black text-xs border border-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWalletFromDashboard} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-300 block uppercase mb-1">
                  SUB-ACCOUNT NAME / LABEL
                </label>
                <input
                  type="text"
                  placeholder={`e.g. Sub-Account #${subWallets.length + 1}`}
                  value={quickWalletName}
                  onChange={(e) => setQuickWalletName(e.target.value)}
                  className="w-full bg-[#0a0a0c] border-2 border-white p-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#ccff00]"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Derives next HD wallet key at BIP-44 path: <span className="text-[#00f0ff]">m/44'/60'/0'/0/{subWallets.length}</span>
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  + DERIVE & ACTIVATE
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWalletModal(false)}
                  className="px-4 py-3 bg-[#181820] text-white font-black text-xs uppercase border-2 border-white cursor-pointer hover:bg-[#252530]"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Token Modal */}
      {showImportTokenModal && (
        <ImportTokenModal onClose={() => setShowImportTokenModal(false)} />
      )}
    </div>
  );
};
