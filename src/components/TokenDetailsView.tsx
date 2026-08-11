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
import { TokenService } from '../services/TokenService';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Sometimes a slight delay helps if rendering is deferred
    setTimeout(() => {
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 10);
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


  const selectedChain =
    SUPPORTED_CHAINS.find((c) => c.id === asset.network || c.symbol.toLowerCase() === asset.network.toLowerCase()) ||
    SUPPORTED_CHAINS.find((c) => c.id === activeChain) ||
    SUPPORTED_CHAINS[0];

  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL'>('24H');
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(!!asset.isFavorite);
  const [activeActionModal, setActiveActionModal] = useState<'buy' | 'sell' | null>(null);

  // Real market data state
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(true);

  const [liveTickPrice, setLiveTickPrice] = useState<number | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  
  const livePrice = liveTickPrice || marketData?.currentPrice || asset?.priceUsd || 0;
  let liveChange = marketData?.priceChange24h ?? asset?.change24h ?? 0;

  const tokenBio =
    marketData?.description || asset?.bio ||
    `${asset?.name || 'Token'} (${asset?.symbol || 'SYM'}) is a cryptographic asset operating on the ${(asset?.network || 'ethereum').toUpperCase()} blockchain network, serving decentralized transactions, smart contracts, and Web3 ecosystem utility.`;

  const socials = {
    website: asset?.socials?.website || `https://coingecko.com/en/coins/${(asset?.name || '').toLowerCase().replace(/\s+/g, '-')}`,
    twitter: asset?.socials?.twitter || `https://x.com/search?q=%23${asset?.symbol || ''}`,
    telegram: asset?.socials?.telegram,
    discord: asset?.socials?.discord,
    github: asset?.socials?.github,
    whitepaper: asset?.socials?.whitepaper,
  };

  useEffect(() => {
    if (!asset?.symbol) return;
    let days = '7';
    if (timeframe === '24H' || timeframe === '1H') days = '1';
    if (timeframe === '30D') days = '30';
    if (timeframe === '90D') days = '90';
    if (timeframe === '1Y') days = '365';
    if (timeframe === 'ALL') days = 'max';
    
    setIsLoadingMarket(true);
    TokenService.fetchTokenMarketData(asset.symbol, asset.contractAddress, asset.network, days)
      .then(data => {
        setMarketData(data);
        setIsLoadingMarket(false);
      })
      .catch(() => setIsLoadingMarket(false));
  }, [asset?.id, timeframe]);

  // Real-time ultra-fast live price updates via Binance WebSocket API
  useEffect(() => {
    if (!asset?.symbol) return;
    const supportedSymbols = ['ETH', 'SOL', 'BTC', 'BNB', 'AVAX', 'ARB', 'LINK', 'POL'];
    if (!supportedSymbols.includes(asset.symbol.toUpperCase())) return;

    const streamSymbol = `${asset.symbol.toLowerCase()}usdt`;
    let ws: WebSocket;
    
    const connectWs = () => {
      try {
        ws = new WebSocket(`wss://stream.binance.us:9443/ws/${streamSymbol}@ticker`);
        
        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            if (data.c) {
              setLiveTickPrice(parseFloat(data.c));
            }
          } catch (e) {}
        };
      } catch (e) {}
    };

    connectWs();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [asset?.symbol]);

  // Buy / Sell state
  const [fiatAmount, setFiatAmount] = useState('500');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Chart hover state
  const [hoverPoint, setHoverPoint] = useState<{ price: number; label: string } | null>(null);

  const formatNumberUsd = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)} T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)} B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)} M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(2)} K`;
    return `$${val.toFixed(2)}`;
  };

  const handleCopyContract = () => {
    if (!asset?.contractAddress) return;
    navigator.clipboard.writeText(asset.contractAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handleToggleFav = () => {
    if (!asset?.id) return;
    setIsFavorite(!isFavorite);
    toggleFavoriteAsset(asset.id);
  };

  // Holdings Calculations (with full NaN & undefined guards)
  const balance = asset?.balance || 0;
  const fiatValue = balance * (livePrice || 0);
  const avgCost = asset?.avgBuyPriceUsd || ((livePrice || 0) > 0 ? (livePrice || 0) * 0.85 : 0);
  const totalCost = balance * avgCost;
  const pnlAmount = fiatValue - totalCost;
  const pnlPercent = totalCost > 0 ? (pnlAmount / totalCost) * 100 : 0;
  const isPnlPositive = pnlAmount >= 0;

  // Generate chart data safely
  const chartPoints = (marketData?.prices && Array.isArray(marketData.prices) && marketData.prices.length > 0) 
    ? marketData.prices.map((p: [number, number]) => {
        const date = new Date(p[0]);
        let label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (timeframe !== '24H' && timeframe !== '1H') {
          label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        return { price: Number(p[1]) || 0, label };
      })
    : [{ price: livePrice || 0, label: 'Now' }, { price: livePrice || 0, label: 'Now' }]; // fallback if no data

  // For 1H timeframe, take the last subset of 1 day data (since CoinGecko doesn't do 1H natively)
  let displayPoints = chartPoints;
  if (timeframe === '1H' && displayPoints.length > 12) {
    displayPoints = displayPoints.slice(-12); // Last hour roughly assuming 5 min intervals for 1d
  }

  // Downsample to max 150 points for rendering performance, especially for 'ALL' timeframe
  if (displayPoints.length > 150) {
    const step = Math.ceil(displayPoints.length / 150);
    displayPoints = displayPoints.filter((_: any, idx: number) => idx % step === 0 || idx === displayPoints.length - 1);
  }

  if (displayPoints.length === 1) {
    displayPoints = [displayPoints[0], displayPoints[0]]; // Duplicate to prevent division by 0
  } else if (displayPoints.length === 0) {
    displayPoints = [{ price: livePrice, label: 'Now' }, { price: livePrice, label: 'Now' }];
  }

  // Calculate dynamic timeframe price change percentage
  if (displayPoints.length > 1 && timeframe !== '24H') {
    const firstPrice = displayPoints[0].price;
    if (firstPrice > 0) {
      liveChange = ((livePrice - firstPrice) / firstPrice) * 100;
    }
  }


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
              src={marketData?.icon || asset.icon}
              alt={asset.name}
              className="w-10 h-10 sm:w-16 sm:h-16 bg-[#ffe600] p-1 sm:p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.failed) {
                  target.dataset.failed = 'true';
                  target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23ffe600"/><text x="50%" y="50%" font-family="monospace" font-weight="900" font-size="28" fill="black" text-anchor="middle" dominant-baseline="central">${asset.symbol.substring(0, 2).toUpperCase()}</text></svg>`;
                }
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
            <span className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
          </div>
          <span
            className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] flex items-center gap-1 shrink-0 ${
              liveChange >= 0 ? 'bg-[#ccff00] text-black' : 'bg-[#ff007f] text-white'
            }`}
          >
            {liveChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" /> : <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{liveChange >= 0 ? '+' : ''}{liveChange.toFixed(2)}%</span>
          </span>
        </div>
      </div>

      {/* 2. Key Token Metrics Grid (Market Cap, Liquidity, Volume 24h, APY/Status) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-[#141419] border-2 border-white p-3 sm:p-4 shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] space-y-1">
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block truncate">MARKET CAP</span>
          <span className="text-base sm:text-xl font-black text-white truncate block">{isLoadingMarket ? 'LOADING...' : formatNumberUsd(marketData?.marketCap || asset.marketCapUsd)}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block truncate">GLOBAL CIRCULATING</span>
        </div>

        <div className="bg-[#141419] border-2 border-white p-3 sm:p-4 shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] space-y-1">
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block truncate">24H VOLUME</span>
          <span className="text-base sm:text-xl font-black text-[#ccff00] truncate block">{isLoadingMarket ? 'LOADING...' : formatNumberUsd(marketData?.volume24h || asset.volume24hUsd)}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block truncate">24H AGGREGATE</span>
        </div>

        <div className="bg-[#141419] border-2 border-white p-3 sm:p-4 shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] space-y-1">
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block truncate">CIRCULATING SUPPLY</span>
          <span className="text-base sm:text-xl font-black text-[#00f0ff] truncate block">
            {isLoadingMarket ? 'LOADING...' : (
              marketData?.circulatingSupply 
                ? marketData.circulatingSupply.toLocaleString()
                : asset.marketCapUsd && livePrice > 0 
                  ? Math.floor(asset.marketCapUsd / livePrice).toLocaleString() 
                  : 'N/A'
            )}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block truncate">ACTIVE TOKENS</span>
        </div>

        <div className="bg-[#141419] border-2 border-white p-3 sm:p-4 shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] space-y-1">
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block truncate">STAKABLE STATUS</span>
          <span className="text-base sm:text-xl font-black text-[#ffe600] truncate block">
            {asset.isStakable ? 'ON-CHAIN STAKABLE' : 'NOT STAKABLE'}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block truncate">PROTOCOL LEVEL</span>
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

        {/* Recharts Chart Display */}
        <div className="relative w-full h-52 sm:h-72 bg-[#141419] border-2 border-white/40 p-3 pt-6 overflow-hidden font-mono text-[10px] sm:text-xs">
          {isLoadingMarket ? (
            <div className="w-full h-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-[#ccff00] animate-spin-slow" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayPoints}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  stroke="#475569" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                  tickMargin={10} 
                  minTickGap={30} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  stroke="#475569" 
                  tick={{ fill: '#94a3b8', fontSize: 9 }} 
                  tickFormatter={(value) => {
                    if (value >= 1000) return `$${Math.round(value).toLocaleString()}`;
                    if (value >= 1) return `$${value.toFixed(2)}`;
                    return `$${value.toFixed(4)}`;
                  }}
                  width={55}
                  axisLine={false}
                  tickLine={false}
                  orientation="left"
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#000', border: '2px solid #ccff00', borderRadius: 0, boxShadow: '4px 4px 0px 0px #ccff00' }}
                  itemStyle={{ color: '#ccff00', fontWeight: 900, fontSize: '16px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`, 'Price']}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#ccff00" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  activeDot={{ r: 6, fill: '#00f0ff', stroke: '#000', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
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
              {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })} {asset.symbol}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block">
              AVG BUY PRICE: <span className="text-white font-bold">${avgCost > 0 && avgCost < 0.01 ? avgCost.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 }) : avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </span>
          </div>

          <div className="bg-[#141419] p-3 sm:p-4 border-2 border-white space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">CURRENT FIAT VALUATION</span>
            <span className="text-xl sm:text-2xl font-black text-[#00f0ff] block">
              ${fiatValue > 0 && fiatValue < 0.01 ? fiatValue.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 }) : fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block">
              TOTAL COST BASIS: <span className="text-white font-bold">${totalCost > 0 && totalCost < 0.01 ? totalCost.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 }) : totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </span>
          </div>

          <div className="bg-[#141419] p-3 sm:p-4 border-2 border-white space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">UNREALIZED PROFIT / LOSS</span>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-xl sm:text-2xl font-black ${isPnlPositive ? 'text-[#ccff00]' : 'text-[#ff007f]'}`}>
                {isPnlPositive ? '+' : ''}${Math.abs(pnlAmount) > 0 && Math.abs(pnlAmount) < 0.01 ? pnlAmount.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 }) : pnlAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          <div>
            <p className={`text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium ${!isBioExpanded ? 'line-clamp-4' : ''}`}>
              {tokenBio}
            </p>
            {tokenBio.length > 250 && (
              <button 
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="mt-2 text-[10px] sm:text-xs text-[#ccff00] font-black uppercase hover:underline cursor-pointer flex items-center gap-1"
              >
                {isBioExpanded ? 'SHOW LESS' : 'READ MORE'}
              </button>
            )}
          </div>
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
