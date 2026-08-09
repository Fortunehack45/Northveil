import React, { useState } from 'react';
import {
  Globe,
  Search,
  Compass,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Lock,
  Zap,
  Layers,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { WalletService } from '../services/WalletService';

interface DApp {
  id: string;
  name: string;
  category: 'DeFi' | 'NFT' | 'Lending' | 'Staking' | 'Gaming' | 'Predictions';
  description: string;
  url: string;
  icon: string;
  badge?: string;
  users24h: string;
  volume24h: string;
  network: string;
  color: string;
}

const FEATURED_DAPPS: DApp[] = [
  {
    id: 'uniswap',
    name: 'Uniswap V3',
    category: 'DeFi',
    description: 'Swap tokens & earn fees with concentrated liquidity pools.',
    url: 'https://app.uniswap.org',
    icon: '🦄',
    badge: 'HOT',
    users24h: '142.5K',
    volume24h: '$1.4B',
    network: 'Ethereum',
    color: '#ff007f',
  },
  {
    id: 'aave',
    name: 'Aave V3 Protocol',
    category: 'Lending',
    description: 'Non-custodial liquidity protocol for earning interest & borrowing.',
    url: 'https://app.aave.com',
    icon: '👻',
    badge: 'POPULAR',
    users24h: '48.2K',
    volume24h: '$850M',
    network: 'Multi-Chain',
    color: '#00f0ff',
  },
  {
    id: 'opensea',
    name: 'OpenSea Pro',
    category: 'NFT',
    description: 'The premier Web3 NFT marketplace for digital collectibles & art.',
    url: 'https://opensea.io',
    icon: '⛵',
    users24h: '35.1K',
    volume24h: '$42M',
    network: 'Ethereum / Polygon',
    color: '#ccff00',
  },
  {
    id: 'lido',
    name: 'Lido Liquid Staking',
    category: 'Staking',
    description: 'Liquid staking solution for ETH. Receive stETH with daily yields.',
    url: 'https://stake.lido.fi',
    icon: '💧',
    badge: '6.4% APY',
    users24h: '89.0K',
    volume24h: '$3.2B Staked',
    network: 'Ethereum',
    color: '#00f0ff',
  },
  {
    id: 'polymarket',
    name: 'Polymarket',
    category: 'Predictions',
    description: 'Decentralized information & event prediction markets platform.',
    url: 'https://polymarket.com',
    icon: '📈',
    badge: 'TRENDING',
    users24h: '210.4K',
    volume24h: '$120M',
    network: 'Polygon',
    color: '#ffe600',
  },
  {
    id: 'curve',
    name: 'Curve Finance',
    category: 'DeFi',
    description: 'Deep liquidity exchange for stablecoins with low slippage.',
    url: 'https://curve.fi',
    icon: '🌈',
    users24h: '29.3K',
    volume24h: '$410M',
    network: 'Multi-Chain',
    color: '#ff007f',
  },
  {
    id: 'pancakeswap',
    name: 'PancakeSwap V3',
    category: 'DeFi',
    description: 'Leading DEX on BNB Chain with yield farming, lotteries & NFTs.',
    url: 'https://pancakeswap.finance',
    icon: '🥞',
    users24h: '185.2K',
    volume24h: '$620M',
    network: 'BNB Chain / Base',
    color: '#ffe600',
  },
  {
    id: 'hyperliquid',
    name: 'Hyperliquid DEX',
    category: 'DeFi',
    description: 'L1 perpetual DEX with sub-second order book matching.',
    url: 'https://app.hyperliquid.xyz',
    icon: '⚡',
    badge: 'NEW',
    users24h: '64.8K',
    volume24h: '$2.1B',
    network: 'Hyperliquid L1',
    color: '#ccff00',
  },
];

export const DAppBrowserView: React.FC = () => {
  const { hardwareWallet, userSettings } = useWallet();
  const [urlInput, setUrlInput] = useState<string>('');
  const [activeDApp, setActiveDApp] = useState<DApp | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookmarkedDApps, setBookmarkedDApps] = useState<string[]>(['uniswap', 'aave', 'lido']);
  const [simulatedTxPending, setSimulatedTxPending] = useState<boolean>(false);
  const [simulatedTxSuccess, setSimulatedTxSuccess] = useState<string | null>(null);

  const categories = ['All', 'DeFi', 'Lending', 'NFT', 'Staking', 'Predictions'];

  const filteredDApps = FEATURED_DAPPS.filter((dapp) => {
    const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
    const matchesSearch =
      urlInput === '' ||
      dapp.name.toLowerCase().includes(urlInput.toLowerCase()) ||
      dapp.url.toLowerCase().includes(urlInput.toLowerCase()) ||
      dapp.category.toLowerCase().includes(urlInput.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDApp = (dapp: DApp) => {
    setActiveDApp(dapp);
    setUrlInput(dapp.url);
  };

  const handleNavigateUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput || !urlInput.trim()) return;
    const trimmed = urlInput.trim();

    // Check if input matches a known featured dapp
    const found = FEATURED_DAPPS.find(
      (d) =>
        d.url.toLowerCase().includes(trimmed.toLowerCase()) ||
        d.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (found) {
      setActiveDApp(found);
      return;
    }

    const isFullUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');
    const hasDomainDot = trimmed.includes('.') && !trimmed.includes(' ');

    let targetUrl = '';
    let targetName = '';

    if (isFullUrl || hasDomainDot) {
      targetUrl = isFullUrl ? trimmed : 'https://' + trimmed;
      targetName = trimmed.replace('https://', '').replace('http://', '').split('/')[0];
    } else {
      // Direct Google Search Query
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
      targetName = `Google: "${trimmed}"`;
    }

    setActiveDApp({
      id: 'custom-' + Date.now(),
      name: targetName,
      category: 'DeFi',
      description: `Google Web Search & Browsing for ${targetName}`,
      url: targetUrl,
      icon: '🔍',
      users24h: 'Google Search Engine',
      volume24h: 'Live Web Query',
      network: userSettings.preferredNetwork || 'Ethereum',
      color: '#ccff00',
    });
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedDApps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const { seedPhrase, activeSubWallet } = useWallet();

  const handleSimulateDAppInteraction = async (actionName: string) => {
    setSimulatedTxPending(true);
    setSimulatedTxSuccess(null);

    if (!seedPhrase || seedPhrase.length === 0 || !activeSubWallet) {
      setSimulatedTxPending(false);
      setSimulatedTxSuccess('⚠️ Wallet is locked. Unlock wallet to sign EIP-1193 payload.');
      setTimeout(() => setSimulatedTxSuccess(null), 4000);
      return;
    }

    try {
      const messageToSign = `Northveil EIP-1193 Signature Request:\nApp: ${activeDApp?.name || 'Web3 DApp'}\nAction: ${actionName}\nTimestamp: ${new Date().toISOString()}`;
      const signedHash = await WalletService.signMessage(seedPhrase, activeSubWallet.accountIndex, messageToSign);

      setSimulatedTxPending(false);
      setSimulatedTxSuccess(`✅ EIP-191 Signature Created! Hash: ${signedHash.slice(0, 18)}...${signedHash.slice(-10)}`);
      setTimeout(() => setSimulatedTxSuccess(null), 6000);
    } catch (err: any) {
      setSimulatedTxPending(false);
      setSimulatedTxSuccess(`❌ Signature Failed: ${err?.message || err}`);
      setTimeout(() => setSimulatedTxSuccess(null), 4000);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full">
      {/* Top Browser Bar & Injection Status */}
      <div className="bg-[#141419] border-2 border-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#ccff00] sm:shadow-[8px_8px_0px_0px_#ccff00] space-y-4 font-mono">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#ccff00] stroke-[3] shrink-0" />
            <h2 className="text-base sm:text-xl font-black text-white font-mono uppercase tracking-tight">
              WEB3 DAPP BROWSER
            </h2>
            <span className="px-2 py-0.5 bg-[#00f0ff] text-black text-[9px] sm:text-[10px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              PROVIDER INJECTED
            </span>
          </div>

          {/* Web3 Connection Status Badge */}
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono flex-wrap w-full md:w-auto">
            <div className="bg-[#0a0a0c] px-2.5 py-1 sm:px-3 sm:py-1.5 border-2 border-white flex items-center gap-2 shadow-[1.5px_1.5px_0px_0px_#000] flex-1 md:flex-none justify-between md:justify-start">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
                <span className="text-slate-300 text-[10px] sm:text-xs">CONNECTED:</span>
              </div>
              <span className="text-white font-bold font-mono text-[10px] sm:text-xs">
                {hardwareWallet.address ? hardwareWallet.address.slice(0, 6) + '...' + hardwareWallet.address.slice(-4) : '0x71C8...C8'}
              </span>
            </div>
            <div className="bg-[#ffe600] px-2.5 py-1 sm:px-3 sm:py-1.5 border-2 border-black text-black font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000] text-[10px] sm:text-xs">
              {userSettings.preferredNetwork || 'ETHEREUM'}
            </div>
          </div>
        </div>

        {/* Browser URL Input Bar */}
        <form onSubmit={handleNavigateUrl} className="flex items-center gap-2">
          {activeDApp && (
            <button
              type="button"
              onClick={() => setActiveDApp(null)}
              className="p-2.5 bg-[#ff007f] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#ff3399] cursor-pointer shrink-0"
              title="Back to DApp Store"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </button>
          )}

          <div className="relative flex-1 min-w-0">
            <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
              <Lock className="w-3 h-3 text-[#ccff00]" />
              <span className="text-[9px] sm:text-[10px] font-mono font-black text-[#ccff00] uppercase hidden xs:inline">WEB3://</span>
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="SEARCH OR ENTER DAPP URL..."
              className="w-full pl-8 xs:pl-20 sm:pl-24 pr-8 py-2.5 bg-[#0a0a0c] text-white font-mono font-bold text-xs border-2 border-white placeholder-slate-500 focus:outline-none focus:bg-[#16161c]"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
            >
              <Search className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="submit"
              className="px-3 sm:px-4 py-2.5 bg-[#ccff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer"
            >
              GO
            </button>
            <button
              type="button"
              onClick={() => {
                const query = urlInput.trim() || 'crypto web3 dapps';
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                setActiveDApp({
                  id: 'google-' + Date.now(),
                  name: `Google Search: "${query}"`,
                  category: 'DeFi',
                  description: `Google Web Search results for ${query}`,
                  url: googleUrl,
                  icon: '🔍',
                  users24h: 'Google Engine',
                  volume24h: 'Search Results',
                  network: userSettings.preferredNetwork || 'Ethereum',
                  color: '#00f0ff',
                });
              }}
              className="px-3 sm:px-4 py-2.5 bg-[#00f0ff] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#33f3ff] cursor-pointer flex items-center gap-1"
              title="Search with Google Search Engine"
            >
              <Search className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">GOOGLE</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Container: DApp Store OR Active DApp Simulated Canvas */}
      {!activeDApp ? (
        <div className="space-y-6">
          {/* Quick Bookmarks Bar */}
          {bookmarkedDApps.length > 0 && (
            <div className="bg-[#141419] border-2 border-white p-3.5 sm:p-4 shadow-[4px_4px_0px_0px_#ff007f] sm:shadow-[6px_6px_0px_0px_#ff007f] space-y-3 font-mono">
              <div className="flex items-center gap-2 border-b-2 border-white/20 pb-2">
                <Bookmark className="w-4 h-4 text-[#ff007f] stroke-[3]" />
                <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                  BOOKMARKED DAPPS
                </h3>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                {bookmarkedDApps.map((id) => {
                  const dapp = FEATURED_DAPPS.find((d) => d.id === id);
                  if (!dapp) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => handleOpenDApp(dapp)}
                      className="px-3 py-2 bg-[#0a0a0c] border-2 border-white text-xs font-mono font-black text-white flex items-center justify-between sm:justify-start gap-2 hover:bg-[#181820] shadow-[2px_2px_0px_0px_#000] cursor-pointer min-w-0"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm shrink-0">{dapp.icon}</span>
                        <span className="truncate">{dapp.name}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#ccff00] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 border-2 text-xs font-mono font-black uppercase whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#ffe600] border-black text-black shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-[#141419] border-white/40 text-slate-300 hover:border-white shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* DApp Marketplace Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredDApps.map((dapp) => {
              const isBookmarked = bookmarkedDApps.includes(dapp.id);
              return (
                <div
                  key={dapp.id}
                  onClick={() => handleOpenDApp(dapp)}
                  className="bg-[#141419] border-2 border-white p-5 space-y-4 flex flex-col justify-between shadow-[6px_6px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#ccff00] hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div>
                    {/* Top Row: Icon, Title, Bookmark Button */}
                    <div className="flex items-start justify-between gap-3 border-b-2 border-white/20 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0a0a0c] border-2 border-white flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_#000] group-hover:scale-110 transition-transform">
                          {dapp.icon}
                        </div>
                        <div>
                          <h4 className="font-mono font-black text-white text-sm uppercase">
                            {dapp.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {dapp.category} • {dapp.network}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(dapp.id, e)}
                        className="p-1.5 text-slate-400 hover:text-[#ff007f] transition-colors"
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark DApp'}
                      >
                        <Bookmark
                          className={`w-4 h-4 stroke-[3] ${
                            isBookmarked ? 'text-[#ff007f] fill-[#ff007f]' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs font-mono text-slate-300 mt-3 line-clamp-2">
                      {dapp.description}
                    </p>
                  </div>

                  {/* Metrics & Launch CTA */}
                  <div className="space-y-3 pt-3 border-t-2 border-white/20">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                      <span>24H VOL: <strong className="text-[#ccff00]">{dapp.volume24h}</strong></span>
                      <span>USERS: <strong className="text-white">{dapp.users24h}</strong></span>
                    </div>

                    <button className="w-full py-2.5 bg-[#ccff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] group-hover:bg-[#d8ff33] flex items-center justify-center gap-2">
                      <span>LAUNCH DAPP</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active DApp Interactive Sandbox Container */
        <div className="bg-[#141419] border-4 border-white p-6 shadow-[10px_10px_0px_0px_#00f0ff] space-y-6">
          {/* Simulated Browser Address & Status Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b-2 border-white pb-4 bg-[#0a0a0c] p-4 border-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeDApp.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white font-mono uppercase">
                    {activeDApp.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-[#ccff00] text-black text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_0px_#000]">
                    VERIFIED SECURE
                  </span>
                </div>
                <div className="text-xs font-mono text-[#00f0ff] underline flex items-center gap-1">
                  <span>{activeDApp.url}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveDApp(null)}
                className="px-4 py-2 bg-[#ff007f] text-white font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#ff3399]"
              >
                CLOSE DAPP
              </button>
            </div>
          </div>

          {/* Feedback Banner for DApp Interaction */}
          {simulatedTxSuccess && (
            <div className="bg-[#ccff00] text-black border-2 border-black p-4 font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] flex items-center gap-2">
              <CheckCircle className="w-5 h-5 stroke-[3]" />
              <span>{simulatedTxSuccess}</span>
            </div>
          )}

          {/* Active Web3 DApp Browser Frame */}
          <div className="bg-[#0a0a0c] border-2 border-white p-3 sm:p-4 min-h-[600px] flex flex-col justify-between relative shadow-[4px_4px_0px_0px_#000] font-mono">
            {/* Top Interactive Browser Address Bar Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b-2 border-white/20 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const iframe = document.getElementById('dapp-iframe-frame') as HTMLIFrameElement;
                    if (iframe) iframe.src = activeDApp.url;
                  }}
                  className="p-1.5 bg-[#181c28] text-white border border-white/30 hover:border-white cursor-pointer"
                  title="Reload dApp Page"
                >
                  <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="flex-1 flex items-center bg-[#181c28] border-2 border-white px-3 py-1.5 shadow-[2px_2px_0px_0px_#d4ff00]">
                  <Lock className="w-3.5 h-3.5 text-[#d4ff00] mr-2 shrink-0 stroke-[3]" />
                  <input
                    type="text"
                    value={activeDApp.url}
                    readOnly
                    className="bg-transparent text-xs text-white font-mono font-bold w-full focus:outline-none"
                  />
                  <span className="text-[9px] font-black bg-[#d4ff00] text-black px-1.5 py-0.5 border border-black uppercase shrink-0 ml-2">
                    EIP-1193 INJECTED
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateDAppInteraction(`Execute Smart Protocol Interaction on ${activeDApp.name}`)}
                  className="px-3 py-1.5 bg-[#d4ff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#e0ff33] flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 stroke-[3]" />
                  <span>SIGN & EXECUTE</span>
                </button>
                <a
                  href={activeDApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#00f0ff] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#33f3ff] flex items-center gap-1.5"
                >
                  <span>OPEN NEW TAB</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
                </a>
              </div>
            </div>

            {/* Real Embedded Web Frame */}
            <div className="relative flex-1 min-h-[500px] w-full border-2 border-white bg-black">
              <iframe
                id="dapp-iframe-frame"
                src={activeDApp.url}
                className="w-full h-[520px] bg-black border-none"
                title={activeDApp.name}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>

            {/* DApp Footer Specs */}
            <div className="text-center text-[10px] font-mono text-slate-400 uppercase border-t-2 border-white/20 pt-3 mt-3 flex items-center justify-between">
              <span>Northveil Web3 Sandbox Guard Active</span>
              <span className="text-[#d4ff00] font-bold">RPC NODE: ETHEREUM MAINNET (EIP-1193 CONNECTED)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
