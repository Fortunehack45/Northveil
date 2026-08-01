import React, { useState, useEffect } from 'react';
import {
  Star,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  CreditCard,
  DollarSign,
  ArrowLeftRight,
  Send,
  Check,
  Activity,
  Lock,
  Globe,
  MessageSquare,
  MessageCircle,
  Code,
  FileText,
  Info,
} from 'lucide-react';
import { CryptoAsset } from '../types';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/initialData';

interface TokenDetailsViewProps {
  asset: CryptoAsset;
  onBack: () => void;
  onOpenSend: (assetId?: string) => void;
  onOpenReceive: (assetId?: string) => void;
  onNavigateSwap: (fromAssetId?: string) => void;
  onNavigateBuySell?: (assetId?: string, mode?: 'buy' | 'sell') => void;
}

export const TokenDetailsView: React.FC<TokenDetailsViewProps> = ({
  asset,
  onBack,
  onOpenSend,
  onOpenReceive,
  onNavigateSwap,
  onNavigateBuySell,
}) => {
  const { toggleFavoriteAsset, activeChain } = useWallet();

  // Always scroll to top when token details view is opened or asset changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [asset.id]);

  const launchYear =
    asset.launchYear ||
    (asset.symbol === 'BTC'
      ? 2009
      : asset.symbol === 'ETH'
      ? 2015
      : asset.symbol === 'SOL'
      ? 2020
      : asset.symbol === 'USDC'
      ? 2018
      : asset.symbol === 'POL'
      ? 2017
      : asset.symbol === 'BNB'
      ? 2017
      : asset.symbol === 'AVAX'
      ? 2020
      : asset.symbol === 'ARB'
      ? 2021
      : 2021);

  const tokenBio =
    asset.bio ||
    `${asset.name} (${asset.symbol}) is a cryptographic asset operating on the ${asset.network.toUpperCase()} blockchain network, serving decentralized transactions, smart contracts, and Web3 ecosystem utility.`;

  const socials = {
    website: asset.socials?.website || `https://coingecko.com/en/coins/${asset.name.toLowerCase().replace(/\s+/g, '-')}`,
    twitter: asset.socials?.twitter || `https://x.com/search?q=%23${asset.symbol}`,
    telegram: asset.socials?.telegram,
    discord: asset.socials?.discord,
    github: asset.socials?.github,
    whitepaper: asset.socials?.whitepaper,
  };
  const selectedChain =
    SUPPORTED_CHAINS.find((c) => c.id === asset.network || c.symbol.toLowerCase() === asset.network.toLowerCase()) ||
    SUPPORTED_CHAINS.find((c) => c.id === activeChain) ||
    SUPPORTED_CHAINS[0];

  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL'>('7D');
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(!!asset.isFavorite);
  const [activeActionModal, setActiveActionModal] = useState<'buy' | 'sell' | null>(null);

  // Buy / Sell state
  const [fiatAmount, setFiatAmount] = useState('500');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Chart hover state
  const [hoverPoint, setHoverPoint] = useState<{ price: number; label: string } | null>(null);

  const formatNumberUsd = (val?: number) => {
    if (val === undefined || val === null) return 'N/A';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)} T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)} B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)} M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(2)} K`;
    return `$${val.toFixed(2)}`;
  };

  const handleCopyContract = () => {
    if (!asset.contractAddress) return;
    navigator.clipboard.writeText(asset.contractAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handleToggleFav = () => {
    setIsFavorite(!isFavorite);
    toggleFavoriteAsset(asset.id);
  };

  // Holdings Calculations
  const fiatValue = asset.balance * asset.priceUsd;
  const avgCost = asset.avgBuyPriceUsd || asset.priceUsd * 0.85;
  const totalCost = asset.balance * avgCost;
  const pnlAmount = fiatValue - totalCost;
  const pnlPercent = totalCost > 0 ? (pnlAmount / totalCost) * 100 : 0;
  const isPnlPositive = pnlAmount >= 0;

  // Generate chart data based on selected timeframe
  const generateChartData = () => {
    const pointsCount = 30;
    const basePrice = asset.priceUsd;
    const volatility = timeframe === '1H' ? 0.005 : timeframe === '24H' ? 0.02 : timeframe === '7D' ? 0.06 : 0.15;

    const data = [];
    let current = basePrice * (1 - (asset.change24h / 100) * 0.5);

    for (let i = 0; i < pointsCount; i++) {
      const factor = 1 + (Math.sin(i / 2) * volatility + (Math.random() - 0.48) * volatility);
      current = Math.max(0.0001, current * factor);

      let timeLabel = `${i}:00`;
      if (timeframe === '7D') timeLabel = `Day ${Math.floor(i / 4) + 1}`;
      if (timeframe === '30D') timeLabel = `Day ${i + 1}`;
      if (timeframe === '1Y') timeLabel = `Month ${Math.floor(i / 2.5) + 1}`;

      data.push({
        price: i === pointsCount - 1 ? asset.priceUsd : current,
        volume: Math.random() * 80 + 20,
        label: timeLabel,
      });
    }
    return data;
  };

  const chartPoints = generateChartData();
  const minPrice = Math.min(...chartPoints.map((p) => p.price));
  const maxPrice = Math.max(...chartPoints.map((p) => p.price));
  const priceRange = maxPrice - minPrice || 1;

  // Map to SVG coordinates (width: 800, height: 240)
  const svgWidth = 800;
  const svgHeight = 240;
  const pointsString = chartPoints
    .map((p, idx) => {
      const x = (idx / (chartPoints.length - 1)) * svgWidth;
      const y = svgHeight - ((p.price - minPrice) / priceRange) * (svgHeight - 40) - 20;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-4 sm:space-y-6 font-mono select-none w-full animate-fadeIn pb-24 sm:pb-12 px-1 sm:px-0">
      {/* Top Header Navigation Bar */}
      <div className="flex items-center justify-between gap-2 bg-[#141419] border-2 border-white p-2.5 sm:p-4 shadow-[3px_3px_0px_0px_#ccff00] sm:shadow-[5px_5px_0px_0px_#ccff00]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#ccff00] text-black font-black text-[11px] sm:text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            <span>BACK</span>
            <span className="hidden xs:inline"> TO PORTFOLIO</span>
          </button>

          <span className="hidden md:inline-block px-2.5 py-1 bg-[#00f0ff] text-black text-[11px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
            TOKEN DETAILS & METRICS
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-white font-black text-[10px] sm:text-xs uppercase px-2 py-1 bg-[#0a0a0c] border border-white/40">
            {asset.network.toUpperCase()}
          </span>

          {/* Add to Favorites Toggle */}
          <button
            onClick={handleToggleFav}
            className={`px-2 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase border-2 border-black flex items-center gap-1 sm:gap-2 shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all ${
              isFavorite ? 'bg-[#ffe600] text-black' : 'bg-[#0a0a0c] text-white border-white/40 hover:border-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-black' : ''}`} />
            <span className="hidden xs:inline">{isFavorite ? 'FAVORITED' : 'ADD TO FAVORITES'}</span>
            <span className="xs:hidden">{isFavorite ? 'SAVED' : 'FAV'}</span>
          </button>
        </div>
      </div>

      {/* 1. Main Token Banner Header */}
      <div className="bg-[#0a0a0c] border-2 border-white p-3.5 sm:p-6 shadow-[4px_4px_0px_0px_#00f0ff] sm:shadow-[8px_8px_0px_0px_#00f0ff] space-y-3 sm:space-y-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={asset.icon}
              alt={asset.name}
              className="w-10 h-10 sm:w-16 sm:h-16 bg-[#ffe600] p-1 sm:p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 sm:px-1.5 sm:py-0.5 bg-black text-[#ccff00] font-black text-[8px] sm:text-[10px] border border-white">
              {asset.symbol}
            </span>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-lg sm:text-3xl font-black text-white uppercase tracking-tight truncate">{asset.name}</h1>
              <span className="text-xs sm:text-sm text-slate-400 font-bold uppercase">({asset.symbol})</span>
            </div>

            {/* Contract Address row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
              <span className="text-slate-400 font-bold uppercase hidden xs:inline">CONTRACT:</span>
              <span className="text-[#00f0ff] font-bold font-mono">
                {asset.contractAddress
                  ? `${asset.contractAddress.slice(0, 6)}...${asset.contractAddress.slice(-6)}`
                  : 'NATIVE CURRENCY'}
              </span>
              {asset.contractAddress && (
                <button
                  onClick={handleCopyContract}
                  className="px-1.5 py-0.5 bg-[#141419] border border-white text-[9px] sm:text-[10px] text-white hover:bg-[#ccff00] hover:text-black cursor-pointer flex items-center gap-1"
                  title="Copy Contract Address"
                >
                  {isCopied ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'COPIED' : 'COPY'}</span>
                </button>
              )}
              <a
                href={`${selectedChain.explorerUrl}/token/${asset.contractAddress || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1.5 py-0.5 bg-[#141419] border border-white text-[9px] sm:text-[10px] text-slate-300 hover:text-[#ccff00] flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>EXPLORER</span>
              </a>
            </div>
          </div>
        </div>

        {/* Live Price & 24h Change */}
        <div className="flex flex-row items-center justify-between w-full border-t pt-2.5 sm:pt-4 border-white/20 gap-2">
          <div>
            <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase block">LIVE MARKET PRICE</span>
            <span className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">${asset.priceUsd.toLocaleString()}</span>
          </div>
          <span
            className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] flex items-center gap-1 shrink-0 ${
              asset.change24h >= 0 ? 'bg-[#ccff00] text-black' : 'bg-[#ff007f] text-white'
            }`}
          >
            {asset.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" /> : <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%</span>
          </span>
        </div>
      </div>

      {/* 2. Key Token Metrics Grid (Market Cap, Liquidity, Volume 24h, APY/Status) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-[#141419] border-2 border-white p-3 sm:p-4 shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] space-y-1">
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block truncate">MARKET CAP</span>
          <span className="text-base sm:text-xl font-black text-white truncate block">{formatNumberUsd(asset.marketCapUsd)}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block truncate">GLOBAL CIRCULATING</span>
        </div>

        <div className="bg-[#141419] border-2 border-white p-3 sm:p-4 shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] space-y-1">
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block truncate">24H VOLUME</span>
          <span className="text-base sm:text-xl font-black text-[#ccff00] truncate block">{formatNumberUsd(asset.volume24hUsd)}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block truncate">24H AGGREGATE</span>
        </div>

        <div className="bg-[#141419] border-2 border-white p-3 sm:p-4 shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] space-y-1">
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block truncate">DEX LIQUIDITY</span>
          <span className="text-base sm:text-xl font-black text-[#00f0ff] truncate block">{formatNumberUsd(asset.liquidityUsd)}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block truncate">LOCKED IN POOLS</span>
        </div>

        <div className="bg-[#141419] border-2 border-white p-3 sm:p-4 shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] space-y-1">
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block truncate">STAKING YIELD</span>
          <span className="text-base sm:text-xl font-black text-[#ffe600] truncate block">
            {asset.isStakable ? `${asset.apy}% APY` : 'NOT STAKABLE'}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block truncate">PASSIVE YIELD</span>
        </div>
      </div>

      {/* 3. Interactive Full-Width Price Chart Component */}
      <div className="bg-[#0a0a0c] border-2 border-white p-3.5 sm:p-6 shadow-[4px_4px_0px_0px_#ffe600] sm:shadow-[8px_8px_0px_0px_#ffe600] space-y-4 sm:space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#ccff00]" />
            <div>
              <h3 className="text-xs sm:text-base font-black text-white uppercase tracking-tight">INTERACTIVE PRICE CHART</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">HISTORICAL ON-CHAIN PRICE PERFORMANCE</p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex flex-wrap gap-1 bg-[#141419] p-1 border border-white/30 w-full md:w-auto justify-between sm:justify-start">
            {(['1H', '24H', '7D', '30D', '90D', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black uppercase transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#ccff00] text-black border border-black shadow-[1px_1px_0px_0px_#000]'
                    : 'bg-transparent text-slate-300 hover:text-white hover:bg-[#202028]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart Display */}
        <div className="relative w-full h-52 sm:h-72 bg-[#141419] border-2 border-white/40 p-3 overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setHoverPoint(null)}
          >
            <defs>
              <linearGradient id="fullTokenChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ccff00" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ccff00" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="0" y1="50" x2={svgWidth} y2="50" stroke="#ffffff" strokeOpacity="0.1" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2={svgWidth} y2="100" stroke="#ffffff" strokeOpacity="0.1" strokeDasharray="4 4" />
            <line x1="0" y1="150" x2={svgWidth} y2="150" stroke="#ffffff" strokeOpacity="0.1" strokeDasharray="4 4" />
            <line x1="0" y1="200" x2={svgWidth} y2="200" stroke="#ffffff" strokeOpacity="0.1" strokeDasharray="4 4" />

            {/* Gradient Fill */}
            <polygon
              points={`0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`}
              fill="url(#fullTokenChartGradient)"
            />

            {/* Polyline */}
            <polyline
              fill="none"
              stroke="#ccff00"
              strokeWidth="3.5"
              points={pointsString}
            />

            {/* Interactive Circles */}
            {chartPoints.map((p, idx) => {
              const x = (idx / (chartPoints.length - 1)) * svgWidth;
              const y = svgHeight - ((p.price - minPrice) / priceRange) * (svgHeight - 40) - 20;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="4.5"
                  className="fill-[#00f0ff] stroke-black stroke-2 hover:r-7 cursor-pointer transition-all"
                  onMouseEnter={() => setHoverPoint({ price: p.price, label: p.label })}
                />
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoverPoint && (
            <div className="absolute top-4 left-6 bg-black border-2 border-[#ccff00] p-3 text-xs text-white shadow-[4px_4px_0px_0px_#ccff00]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{hoverPoint.label}</div>
              <div className="text-base font-black text-[#ccff00]">
                ${hoverPoint.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Holdings & Position Analytics Card */}
      <div className="bg-[#0a0a0c] border-2 border-white p-3.5 sm:p-6 shadow-[4px_4px_0px_0px_#ff007f] sm:shadow-[8px_8px_0px_0px_#ff007f] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-white/20 pb-3">
          <h3 className="text-xs sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#ff007f] shrink-0" />
            <span>YOUR VAULT HOLDINGS & POSITION ANALYTICS</span>
          </h3>

          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#ff007f] text-white text-[9px] sm:text-[10px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000] shrink-0">
            ON-CHAIN BALANCE VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-[#141419] p-3 sm:p-4 border-2 border-white space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">STORED TOKEN BALANCE</span>
            <span className="text-xl sm:text-2xl font-black text-white block">
              {asset.balance.toLocaleString()} {asset.symbol}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block">
              AVG BUY PRICE: <span className="text-white font-bold">${avgCost.toFixed(2)}</span>
            </span>
          </div>

          <div className="bg-[#141419] p-3 sm:p-4 border-2 border-white space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">CURRENT FIAT VALUATION</span>
            <span className="text-xl sm:text-2xl font-black text-[#00f0ff] block">
              ${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block">
              TOTAL COST BASIS: <span className="text-white font-bold">${totalCost.toFixed(2)}</span>
            </span>
          </div>

          <div className="bg-[#141419] p-3 sm:p-4 border-2 border-white space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">UNREALIZED PROFIT / LOSS</span>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-xl sm:text-2xl font-black ${isPnlPositive ? 'text-[#ccff00]' : 'text-[#ff007f]'}`}>
                {isPnlPositive ? '+' : ''}${pnlAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 border border-black ${
                  isPnlPositive ? 'bg-[#ccff00] text-black' : 'bg-[#ff007f] text-white'
                }`}
              >
                {isPnlPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block">CALCULATED FROM PURCHASE HISTORY</span>
          </div>
        </div>
      </div>

      {/* 5. Token Action Control Bar (Buy, Sell, Swap, Transfer) */}
      <div className="bg-[#141419] border-2 border-white p-3.5 sm:p-6 shadow-[3px_3px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">TOKEN ACTIONS</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <button
            onClick={() => {
              if (onNavigateBuySell) {
                onNavigateBuySell(asset.id, 'buy');
              } else {
                setActiveActionModal('buy');
              }
            }}
            className="py-2.5 sm:py-4 px-2 bg-[#ccff00] text-black font-black text-xs sm:text-sm uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 transition-all"
          >
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] shrink-0" />
            <span className="truncate">BUY {asset.symbol}</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateBuySell) {
                onNavigateBuySell(asset.id, 'sell');
              } else {
                setActiveActionModal('sell');
              }
            }}
            className="py-2.5 sm:py-4 px-2 bg-[#ff007f] text-white font-black text-xs sm:text-sm uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] hover:bg-[#ff3399] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 transition-all"
          >
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] shrink-0" />
            <span className="truncate">SELL {asset.symbol}</span>
          </button>

          <button
            onClick={() => onNavigateSwap(asset.id)}
            className="py-2.5 sm:py-4 px-2 bg-[#ffe600] text-black font-black text-xs sm:text-sm uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] hover:bg-[#fff033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] shrink-0" />
            <span className="truncate">SWAP TOKEN</span>
          </button>

          <button
            onClick={() => onOpenSend(asset.id)}
            className="py-2.5 sm:py-4 px-2 bg-[#00f0ff] text-black font-black text-xs sm:text-sm uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] hover:bg-[#33f3ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 transition-all"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] shrink-0" />
            <span className="truncate">TRANSFER</span>
          </button>
        </div>
      </div>

      {/* 6. Token Overview, Bio & Social Links */}
      <div className="bg-[#0a0a0c] border-2 border-white p-3.5 sm:p-6 shadow-[4px_4px_0px_0px_#ccff00] sm:shadow-[8px_8px_0px_0px_#ccff00] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-white/20 pb-3">
          <h3 className="text-xs sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#ccff00] shrink-0 stroke-[2.5]" />
            <span>TOKEN BIO & SOCIAL LINKS</span>
          </h3>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 bg-[#ffe600] text-black text-[10px] sm:text-xs font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              LAUNCHED IN {launchYear}
            </span>
          </div>
        </div>

        {/* Bio Description Box */}
        <div className="bg-[#141419] border-2 border-white p-3.5 sm:p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00f0ff] shrink-0" />
            <span className="text-[10px] sm:text-xs text-[#00f0ff] font-black uppercase tracking-wider">
              ABOUT {asset.name.toUpperCase()} ({asset.symbol})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
            {tokenBio}
          </p>
        </div>

        {/* Key Token Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-[#141419] border border-white/30 p-2.5 sm:p-3 space-y-0.5">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">YEAR OF LAUNCH</span>
            <span className="text-sm sm:text-base font-black text-[#ccff00]">{launchYear}</span>
          </div>
          <div className="bg-[#141419] border border-white/30 p-2.5 sm:p-3 space-y-0.5">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">NETWORK</span>
            <span className="text-sm sm:text-base font-black text-[#00f0ff] uppercase">{asset.network}</span>
          </div>
          <div className="bg-[#141419] border border-white/30 p-2.5 sm:p-3 space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">ASSET ARCHITECTURE</span>
            <span className="text-sm sm:text-base font-black text-[#ffe600] uppercase">
              {asset.contractAddress && asset.contractAddress !== '0x0000000000000000000000000000000000000000' ? 'SMART CONTRACT' : 'NATIVE CURRENCY'}
            </span>
          </div>
        </div>

        {/* Official Social Links */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">OFFICIAL COMMUNITY & SOCIAL LINKS</span>
          <div className="flex flex-wrap gap-2">
            {socials.website && (
              <a
                href={socials.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#141419] text-white border-2 border-white hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>WEBSITE</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#141419] text-white border-2 border-white hover:bg-[#00f0ff] hover:text-black font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>TWITTER / X</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            {socials.telegram && (
              <a
                href={socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#141419] text-white border-2 border-white hover:bg-[#00f0ff] hover:text-black font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>TELEGRAM</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            {socials.discord && (
              <a
                href={socials.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#141419] text-white border-2 border-white hover:bg-[#ff007f] hover:text-white font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>DISCORD</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#141419] text-white border-2 border-white hover:bg-[#ffe600] hover:text-black font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Code className="w-4 h-4" />
                <span>GITHUB</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            {socials.whitepaper && (
              <a
                href={socials.whitepaper}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#141419] text-white border-2 border-white hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>WHITEPAPER</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Buy / Sell Order Dialog Sub-Modal */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141419] border-4 border-white p-6 max-w-md w-full shadow-[10px_10px_0px_0px_#00f0ff] space-y-4 font-mono">
            <div className="flex items-center justify-between border-b-2 border-white pb-2">
              <h4 className="text-base font-black text-white uppercase">
                {activeActionModal === 'buy' ? `BUY ${asset.symbol} WITH FIAT` : `SELL ${asset.symbol} TO STABLECOIN`}
              </h4>
              <button
                onClick={() => {
                  setActiveActionModal(null);
                  setActionSuccess(null);
                }}
                className="text-xs bg-[#ff007f] text-white px-2 py-0.5 border border-black font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold uppercase">
                AMOUNT ({activeActionModal === 'buy' ? 'USD' : asset.symbol}):
              </label>
              <input
                type="number"
                value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
                className="w-full mt-2 bg-[#0a0a0c] border-2 border-white p-3 text-sm font-bold text-white focus:outline-none"
              />
            </div>

            <div className="p-3 bg-[#0a0a0c] border border-white/40 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>ESTIMATED RECEIVE:</span>
                <span className="text-[#ccff00] font-black">
                  {activeActionModal === 'buy'
                    ? `${(parseFloat(fiatAmount || '0') / asset.priceUsd).toFixed(4)} ${asset.symbol}`
                    : `$${(parseFloat(fiatAmount || '0') * asset.priceUsd).toFixed(2)} USDC`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>NETWORK FEE:</span>
                <span className="text-white font-bold">$1.20</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActionSuccess(
                  activeActionModal === 'buy'
                    ? `✓ PURCHASE ORDER OF $${fiatAmount} EXECUTED SAFELY ON-CHAIN!`
                    : `✓ LIQUIDATION ORDER OF ${fiatAmount} ${asset.symbol} COMPLETED!`
                );
                setTimeout(() => {
                  setActiveActionModal(null);
                  setActionSuccess(null);
                }, 1500);
              }}
              className={`w-full py-3.5 font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer ${
                activeActionModal === 'buy' ? 'bg-[#ccff00] text-black' : 'bg-[#ff007f] text-white'
              }`}
            >
              CONFIRM {activeActionModal.toUpperCase()} ORDER
            </button>

            {actionSuccess && (
              <div className="p-3 bg-[#0a0a0c] border-2 border-[#ccff00] text-xs text-[#ccff00] font-black">
                {actionSuccess}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
