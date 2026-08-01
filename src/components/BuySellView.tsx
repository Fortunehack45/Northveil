import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Clock,
  RefreshCw,
  Info,
  ChevronDown,
  ArrowLeft,
  Building2,
  Wallet,
  Globe,
  Check,
  History,
  Search,
  X,
  FileCode,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/initialData';

interface BuySellViewProps {
  initialTokenId?: string;
  initialMode?: 'buy' | 'sell';
  onBack?: () => void;
}

export const BuySellView: React.FC<BuySellViewProps> = ({
  initialTokenId,
  initialMode = 'buy',
  onBack,
}) => {
  const { assets, selectedChain } = useWallet();
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode);

  // Selected asset
  const defaultAsset = assets.find((a) => a.id === initialTokenId) || assets[0];
  const [selectedAssetId, setSelectedAssetId] = useState<string>(defaultAsset.id);
  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  // Token Search & Category Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'l1' | 'l2' | 'stable'>('all');

  const filteredAssets = assets.filter((asset) => {
    // Category filter
    if (categoryFilter === 'stable' && asset.symbol !== 'USDC' && asset.symbol !== 'USDT') return false;
    if (categoryFilter === 'l1' && !['ETH', 'BTC', 'SOL', 'AVAX', 'BNB', 'POL'].includes(asset.symbol)) return false;
    if (categoryFilter === 'l2' && !['ARB', 'OP', 'MATIC'].includes(asset.symbol)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = asset.name.toLowerCase().includes(q);
    const symbolMatch = asset.symbol.toLowerCase().includes(q);
    const contractMatch = asset.contractAddress ? asset.contractAddress.toLowerCase().includes(q) : false;
    const networkMatch = asset.network.toLowerCase().includes(q);
    return nameMatch || symbolMatch || contractMatch || networkMatch;
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'bank' | 'moonpay'>('card');

  // Input Amounts
  const [fiatAmount, setFiatAmount] = useState<string>('500');
  const [isQuoting, setIsQuoting] = useState<boolean>(false);
  const [quoteTimer, setQuoteTimer] = useState<number>(15);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  // Quick Amount preset handler
  const handleQuickAmount = (val: number) => {
    setFiatAmount(val.toString());
  };

  // On-Ramp history table simulation
  const [history, setHistory] = useState([
    {
      id: 'tx-8891',
      type: 'BUY',
      asset: 'ETH',
      fiat: '$1,200.00 USD',
      cryptoAmount: '0.3478 ETH',
      provider: 'Visa Credit (*4921)',
      status: 'COMPLETED',
      date: '2026-08-01 13:42',
    },
    {
      id: 'tx-7412',
      type: 'SELL',
      asset: 'USDC',
      fiat: '$500.00 USD',
      cryptoAmount: '500.00 USDC',
      provider: 'SEPA Bank Direct',
      status: 'COMPLETED',
      date: '2026-07-29 09:15',
    },
    {
      id: 'tx-6102',
      type: 'BUY',
      asset: 'SOL',
      fiat: '$350.00 USD',
      cryptoAmount: '1.918 SOL',
      provider: 'Apple Pay',
      status: 'COMPLETED',
      date: '2026-07-24 18:04',
    },
  ]);

  const numFiat = parseFloat(fiatAmount) || 0;
  const receiveCrypto = selectedAsset ? (numFiat / selectedAsset.priceUsd).toFixed(4) : '0';
  const providerFee = (numFiat * 0.015).toFixed(2);
  const networkFee = '1.20';
  const totalFiatCost = (numFiat + parseFloat(providerFee) + parseFloat(networkFee)).toFixed(2);

  const handleConfirmOrder = () => {
    if (numFiat <= 0) return;
    setIsQuoting(true);
    setOrderStatus(null);

    setTimeout(() => {
      setIsQuoting(false);
      const newTx = {
        id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
        type: mode.toUpperCase(),
        asset: selectedAsset.symbol,
        fiat: `$${numFiat.toFixed(2)} USD`,
        cryptoAmount: `${receiveCrypto} ${selectedAsset.symbol}`,
        provider:
          paymentMethod === 'card'
            ? 'Credit Card'
            : paymentMethod === 'applepay'
            ? 'Apple Pay'
            : paymentMethod === 'bank'
            ? 'Bank Transfer'
            : 'MoonPay Direct',
        status: 'COMPLETED',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      setHistory([newTx, ...history]);
      setOrderStatus(
        `✓ ${mode.toUpperCase()} ORDER OF ${receiveCrypto} ${selectedAsset.symbol} COMPLETED SUCCESSFULLY! RECEIPT BROADCAST TO ON-CHAIN AUDIT.`
      );
    }, 1200);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-24 sm:pb-12 w-full font-mono select-none animate-fadeIn">
      {/* Top Banner Navigation */}
      <div className="bg-[#141419] border-2 border-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#ccff00] sm:shadow-[8px_8px_0px_0px_#ccff00] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="px-2 py-0.5 bg-[#00f0ff] text-black text-[9px] sm:text-[10px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000] inline-block truncate max-w-full">
            INSTANT FIAT ON-RAMP & OFF-RAMP
          </span>
          <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight mt-1 truncate">
            BUY & SELL CRYPTOCURRENCY
          </h1>
        </div>

        {/* Mode Switch (BUY vs SELL) */}
        <div className="flex bg-[#0a0a0c] p-1 border-2 border-white shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] w-full sm:w-auto">
          <button
            onClick={() => {
              setMode('buy');
              setOrderStatus(null);
            }}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs font-black uppercase border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'buy'
                ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 stroke-[2.5]" />
            <span>BUY CRYPTO</span>
          </button>

          <button
            onClick={() => {
              setMode('sell');
              setOrderStatus(null);
            }}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs font-black uppercase border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'sell'
                ? 'bg-[#ff007f] text-white border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
            <span>SELL CRYPTO</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left (2/3), Stats & Security Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-2 bg-[#0a0a0c] border-2 border-white p-4 sm:p-8 shadow-[4px_4px_0px_0px_#00f0ff] sm:shadow-[8px_8px_0px_0px_#00f0ff] space-y-6">
          
          {/* Header Step: Select Asset & Amount */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-white/20 pb-2 gap-1.5">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-[#ccff00] text-black rounded-none flex items-center justify-center text-[11px] font-black border border-black">
                  1
                </span>
                <span>SELECT CRYPTO ASSET TO {mode.toUpperCase()}</span>
              </span>

              <span className="text-[10px] sm:text-[11px] text-[#ccff00] font-bold uppercase truncate max-w-full">
                RATE: 1 {selectedAsset.symbol} = ${selectedAsset.priceUsd.toLocaleString()} USD
              </span>
            </div>

            {/* Search Bar & Category Filter Pills */}
            <div className="space-y-3">
              <div className="relative flex items-center bg-[#141419] border-2 border-white focus-within:border-[#ccff00] shadow-[3px_3px_0px_0px_#000]">
                <Search className="w-4 h-4 text-[#ccff00] ml-3 shrink-0 stroke-[2.5]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH COIN BY NAME, TICKER (ETH, SOL...) OR CONTRACT (0X...)"
                  className="w-full bg-transparent px-3 py-2.5 text-xs font-mono font-bold text-white placeholder-slate-400 focus:outline-none uppercase"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 mr-2 text-slate-400 hover:text-white bg-black/40 hover:bg-black border border-white/20 transition-all cursor-pointer"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>

              {/* Category Quick Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'ALL COINS' },
                    { id: 'l1', label: 'LAYER 1' },
                    { id: 'l2', label: 'LAYER 2' },
                    { id: 'stable', label: 'STABLECOINS' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id as any)}
                      className={`px-2.5 py-1 font-black uppercase border transition-all cursor-pointer ${
                        categoryFilter === cat.id
                          ? 'bg-[#ccff00] text-black border-black shadow-[1.5px_1.5px_0px_0px_#000]'
                          : 'bg-[#141419] text-slate-300 border-white/30 hover:border-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  {searchQuery.trim().startsWith('0x') && (
                    <span className="px-2 py-0.5 bg-[#00f0ff] text-black font-black text-[9px] border border-black uppercase flex items-center gap-1">
                      <FileCode className="w-3 h-3" /> CONTRACT ADDRESS DETECTED
                    </span>
                  )}
                  <span>SHOWING {filteredAssets.length} ASSETS</span>
                </div>
              </div>
            </div>

            {/* Asset Grid Selection */}
            {filteredAssets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {filteredAssets.map((asset) => {
                  const isSelected = asset.id === selectedAssetId;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`p-2.5 sm:p-3 border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 min-w-0 ${
                        isSelected
                          ? 'bg-[#141419] border-[#ccff00] shadow-[2px_2px_0px_0px_#ccff00] sm:shadow-[3px_3px_0px_0px_#ccff00]'
                          : 'bg-[#141419] border-white/30 hover:border-white'
                      }`}
                    >
                      <img
                        src={asset.icon}
                        alt={asset.symbol}
                        className="w-6 h-6 sm:w-7 sm:h-7 bg-[#ffe600] p-1 border border-black shadow-[1px_1px_0px_0px_#000] object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="min-w-0 flex-1 truncate">
                        <div className="flex items-center gap-1 justify-between">
                          <span className="font-black text-white text-xs sm:text-sm uppercase truncate">{asset.symbol}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0 hidden xs:inline">{asset.name.split(' ')[0]}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold truncate">
                          ${asset.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        {asset.contractAddress && (
                          <div className="text-[8px] text-[#00f0ff] font-mono truncate opacity-80 mt-0.5">
                            {asset.contractAddress.slice(0, 6)}...{asset.contractAddress.slice(-4)}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#141419] border-2 border-dashed border-white/40 p-6 text-center space-y-3">
                <div className="text-xs text-slate-300 font-bold uppercase">
                  NO ASSETS MATCHING &quot;{searchQuery}&quot;
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Try searching by ticker (e.g. ETH, BTC), full name (e.g. Solana), or exact contract address.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                  className="px-3 py-1.5 bg-[#ccff00] text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33]"
                >
                  RESET SEARCH & FILTERS
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Amount & On-Ramp Fiat Inputs */}
          <div className="space-y-4 pt-4 border-t-2 border-white/20">
            <div className="flex items-center justify-between border-b-2 border-white/20 pb-2">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-[#00f0ff] text-black rounded-none flex items-center justify-center text-[11px] font-black border border-black">
                  2
                </span>
                <span>ENTER {mode === 'buy' ? 'PAYMENT AMOUNT (FIAT)' : 'LIQUIDATION AMOUNT'}</span>
              </span>

              <div className="flex gap-1.5">
                {[100, 250, 500, 1000, 2500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleQuickAmount(preset)}
                    className="px-2 py-0.5 bg-[#141419] text-slate-300 hover:text-white border border-white/40 hover:border-white text-[10px] font-black uppercase cursor-pointer"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Conversion Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#141419] border-2 border-white p-4 shadow-[4px_4px_0px_0px_#000] space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase block">
                  {mode === 'buy' ? 'YOU PAY (USD)' : `YOU SELL (${selectedAsset.symbol})`}
                </label>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="number"
                    value={fiatAmount}
                    onChange={(e) => setFiatAmount(e.target.value)}
                    className="w-full bg-transparent text-2xl font-black text-white focus:outline-none"
                    placeholder="0.00"
                  />
                  <span className="text-sm font-black text-[#ccff00] bg-black px-2 py-1 border border-white">
                    {mode === 'buy' ? 'USD' : selectedAsset.symbol}
                  </span>
                </div>
              </div>

              <div className="bg-[#141419] border-2 border-white p-4 shadow-[4px_4px_0px_0px_#000] space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase block">
                  {mode === 'buy' ? `YOU RECEIVE (${selectedAsset.symbol})` : 'YOU RECEIVE (ESTIMATED USD)'}
                </label>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xl font-black text-[#00f0ff]">
                    {mode === 'buy'
                      ? `${receiveCrypto} ${selectedAsset.symbol}`
                      : `$${(numFiat * selectedAsset.priceUsd).toFixed(2)} USD`}
                  </span>
                  <span className="text-xs font-black text-white bg-black px-2 py-1 border border-white">
                    ESTIMATED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method Selector */}
          <div className="space-y-4 pt-4 border-t-2 border-white/20">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-[#ff007f] text-white rounded-none flex items-center justify-center text-[11px] font-black border border-black">
                3
              </span>
              <span>CHOOSE PAYMENT METHOD</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'card', label: 'CREDIT / DEBIT CARD', icon: CreditCard, sub: 'Instant (Visa/MC)' },
                { id: 'applepay', label: 'APPLE PAY', icon: Globe, sub: '1-Click Touch ID' },
                { id: 'bank', label: 'BANK TRANSFER', icon: Building2, sub: 'SEPA / ACH (0% Fee)' },
                { id: 'moonpay', label: 'MOONPAY DIRECT', icon: Wallet, sub: 'Global On-Ramp' },
              ].map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3 border-2 text-left transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-[#141419] border-[#00f0ff] shadow-[3px_3px_0px_0px_#00f0ff]'
                        : 'bg-[#141419] border-white/30 hover:border-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
                    <span className="text-xs font-black text-white block uppercase">{pm.label}</span>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">{pm.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm Execution Button */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleConfirmOrder}
              disabled={isQuoting || numFiat <= 0}
              className={`w-full py-4 text-sm font-black uppercase border-2 border-black shadow-[5px_5px_0px_0px_#000] cursor-pointer transition-all flex items-center justify-center gap-2 ${
                mode === 'buy'
                  ? 'bg-[#ccff00] text-black hover:bg-[#d8ff33]'
                  : 'bg-[#ff007f] text-white hover:bg-[#ff3399]'
              } ${isQuoting || numFiat <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isQuoting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>EXECUTING ON-CHAIN ORDER...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    EXECUTE {mode.toUpperCase()} ORDER OF ${numFiat.toFixed(2)} USD
                  </span>
                </>
              )}
            </button>

            {orderStatus && (
              <div className="p-4 bg-[#141419] border-2 border-[#ccff00] text-xs text-[#ccff00] font-black space-y-1 shadow-[4px_4px_0px_0px_#ccff00]">
                {orderStatus}
              </div>
            )}
          </div>
        </div>

        {/* Right Info & Order Summary Panel */}
        <div className="space-y-6">
          
          {/* Summary Breakdown Card */}
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-4">
            <h3 className="text-sm font-black text-white uppercase border-b-2 border-white/20 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#ccff00]" />
              <span>ORDER BREAKDOWN SUMMARY</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>ASSET PRICE RATE:</span>
                <span className="text-white font-bold">${selectedAsset.priceUsd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>PAYMENT METHOD:</span>
                <span className="text-[#00f0ff] font-bold uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>PROVIDER ON-RAMP FEE (1.5%):</span>
                <span className="text-white font-bold">${providerFee}</span>
              </div>
              <div className="flex justify-between">
                <span>ESTIMATED NETWORK GAS FEE:</span>
                <span className="text-white font-bold">${networkFee}</span>
              </div>
              <div className="pt-3 border-t-2 border-white/20 flex justify-between text-sm font-black text-white">
                <span>TOTAL COST:</span>
                <span className="text-[#ccff00]">${totalFiatCost} USD</span>
              </div>
            </div>

            <div className="p-3 bg-[#0a0a0c] border border-white/30 text-[10px] text-slate-400 space-y-1">
              <span className="text-white font-bold block uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
                MEV & SLIPPAGE PROTECTED
              </span>
              <span>
                All fiat-to-crypto routes are routed through non-custodial smart contracts and verified on-chain.
              </span>
            </div>
          </div>

          {/* Recent Fiat On-Ramp Transactions Table */}
          <div className="bg-[#0a0a0c] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
              <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                <History className="w-4 h-4 text-[#ff007f]" />
                <span>RECENT FIAT TRANSACTIONS</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {history.map((tx) => (
                <div key={tx.id} className="bg-[#141419] p-3 border border-white/40 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-black">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] border border-black ${
                        tx.type === 'BUY' ? 'bg-[#ccff00] text-black' : 'bg-[#ff007f] text-white'
                      }`}
                    >
                      {tx.type}
                    </span>
                    <span className="text-white">{tx.cryptoAmount}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{tx.fiat} ({tx.provider})</span>
                    <span className="text-[#00f0ff] font-bold">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
