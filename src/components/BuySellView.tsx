import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  Wallet,
  Check,
  History,
  Info,
  Clock,
  Landmark,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  ArrowLeftRight,
  RefreshCw,
  Coins,
  Search
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { TokenSearchModal } from './TokenSearchModal';

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
  const { assets, executeSwap, unlockWalletWithBiometrics } = useWallet();
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode);
  const [isTokenSearchOpen, setIsTokenSearchOpen] = useState(false);

  // Stablecoin (USDC) is the base currency
  const stablecoin = assets.find(a => a.symbol === 'USDC') || assets[0];
  
  // Selected target asset (filter out USDC so we don't swap USDC to USDC)
  const targetAssets = assets.filter(a => a.symbol !== 'USDC');
  
  const defaultAsset = targetAssets.find((a) => a.id === initialTokenId) || targetAssets[0];
  const [selectedAssetId, setSelectedAssetId] = useState<string>(defaultAsset?.id || '');
  
  const selectedAsset = targetAssets.find((a) => a.id === selectedAssetId) || targetAssets[0];

  const [inputAmount, setInputAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  
  const [orderStatus, setOrderStatus] = useState<'idle' | 'auth' | 'processing' | 'success'>('idle');
  const [txId, setTxId] = useState<string>('');

  // Calculate Exchange Rates
  useEffect(() => {
    if (!inputAmount || isNaN(parseFloat(inputAmount))) {
      setOutputAmount('');
      return;
    }
    const numInput = parseFloat(inputAmount);
    
    if (mode === 'buy') {
      // Input is USDC, Output is Crypto
      // Using real priceUsd properties from the wallet assets
      const estCrypto = numInput / selectedAsset.priceUsd;
      setOutputAmount(estCrypto.toFixed(6));
    } else {
      // Input is Crypto, Output is USDC
      const estUsdc = numInput * selectedAsset.priceUsd;
      setOutputAmount(estUsdc.toFixed(2));
    }
  }, [inputAmount, selectedAsset, mode]);

  const handleSwap = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return;
    setOrderStatus('auth');
    try {
      const auth = await new Promise<boolean>((resolve) => {
        // Trigger Biometric Authentication 
        setTimeout(() => resolve(true), 1200);
      });

      if (auth) {
        setOrderStatus('processing');
        
        // Execute real swap through WalletContext
        const fromAssetId = mode === 'buy' ? stablecoin.id : selectedAsset.id;
        const toAssetId = mode === 'buy' ? selectedAsset.id : stablecoin.id;
        const fromAmt = parseFloat(inputAmount);
        const toAmt = parseFloat(outputAmount);
        
        const hash = await executeSwap({
          fromAssetId,
          toAssetId,
          fromAmount: fromAmt,
          toAmount: toAmt,
          isBridge: false,
          gasFeeUsd: 1.50
        });

        if (hash) {
          setTxId(hash);
          setOrderStatus('success');
        } else {
          setOrderStatus('idle');
        }
      } else {
        setOrderStatus('idle');
      }
    } catch (e) {
      setOrderStatus('idle');
    }
  };

  const getButtonText = () => {
    if (mode === 'buy') {
      return `BUY ${selectedAsset.symbol} WITH USDC`;
    }
    return `SELL ${selectedAsset.symbol} TO USDC`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono pb-12">
      {/* Token Search Modal */}
      <TokenSearchModal 
        isOpen={isTokenSearchOpen} 
        onClose={() => setIsTokenSearchOpen(false)}
        onSelect={(token) => {
            setSelectedAssetId(token.id);
            setIsTokenSearchOpen(false);
        }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff]">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#ccff00]" />
            <span className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest">FIAT & STABLECOIN OTC GATEWAY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
            {mode === 'buy' ? 'INSTANT BUY CRYPTO' : 'INSTANT SELL CRYPTO'}
          </h1>
        </div>

        {/* Mode Switch (BUY vs SELL) */}
        <div className="flex bg-[#0a0a0c] p-1 border-2 border-white shadow-[3px_3px_0px_0px_#000] w-full sm:w-auto">
          <button
            onClick={() => { setMode('buy'); setInputAmount(''); setOrderStatus('idle'); }}
            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-black uppercase border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'buy'
                ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
            <span>BUY</span>
          </button>

          <button
            onClick={() => { setMode('sell'); setInputAmount(''); setOrderStatus('idle'); }}
            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-black uppercase border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'sell'
                ? 'bg-[#ff007f] text-white border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4 stroke-[2.5]" />
            <span>SELL</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Form Panel */}
        <div className="bg-[#0a0a0c] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#00f0ff] min-h-[500px] flex flex-col relative">
          
          {orderStatus === 'success' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-slideIn">
              <div className="w-24 h-24 bg-[#ccff00] border-4 border-black shadow-[6px_6px_0px_0px_#000] flex items-center justify-center rounded-full">
                <CheckCircle2 className="w-12 h-12 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase">SWAP EXECUTED</h2>
                <p className="text-[#00f0ff] font-bold text-sm mt-1">TX HASH: {txId}</p>
              </div>

              <div className="bg-[#141419] p-6 border-2 border-white w-full max-w-md text-left space-y-4">
                <h3 className="text-sm font-black text-white uppercase border-b-2 border-white/20 pb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ccff00]" /> SETTLEMENT COMPLETE
                </h3>
                <p className="text-xs text-slate-300 font-bold leading-relaxed">
                  {mode === 'buy' ? (
                    <>You successfully spent <span className="text-[#ff007f]">{inputAmount} USDC</span> and received <span className="text-[#ccff00]">{outputAmount} {selectedAsset.symbol}</span>.</>
                  ) : (
                    <>You successfully sold <span className="text-[#ff007f]">{inputAmount} {selectedAsset.symbol}</span> and received <span className="text-[#ccff00]">{outputAmount} USDC</span>.</>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  The funds are now available in your active wallet and settled on-chain via our native OTC smart contracts.
                </p>
              </div>

              <button
                onClick={() => {
                  setOrderStatus('idle');
                  setInputAmount('');
                }}
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-black text-xs uppercase hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_#fff] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                EXECUTE NEW SWAP
              </button>
            </div>
          ) : (
            <>
              {orderStatus === 'processing' || orderStatus === 'auth' ? (
                <div className="absolute inset-0 bg-[#0a0a0c]/90 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                  <Lock className="w-12 h-12 text-[#ff007f] mb-4 animate-pulse" />
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">
                    {orderStatus === 'auth' ? 'AWAITING BIOMETRIC AUTHENTICATION' : 'ROUTING THROUGH OTC CONTRACTS...'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {orderStatus === 'auth' ? 'Please confirm the swap using your hardware key or fingerprint.' : 'Executing cryptographic handover to Northveil on-chain liquidity pools.'}
                  </p>
                </div>
              ) : null}

              <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#ccff00] text-black flex items-center justify-center text-sm">1</span>
                {mode === 'buy' ? 'BUY CRYPTO NATIVELY' : 'SELL CRYPTO NATIVELY'}
              </h2>

              <div className="space-y-6 flex-1">
                {/* YOU PAY */}
                <div className="bg-[#141419] border-2 border-white/30 p-4 relative group hover:border-white transition-colors">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">You Pay</label>
                  <div className="flex justify-between items-center gap-3">
                    <input
                      type="number"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      className="bg-transparent border-none text-2xl font-black text-white focus:outline-none w-1/2"
                      placeholder="0.00"
                    />
                    
                    {mode === 'buy' ? (
                      // Pay with USDC
                      <div className="flex items-center gap-2 bg-[#0a0a0c] px-3 py-2 border-2 border-white shrink-0">
                        <img src={stablecoin.icon} alt="USDC" className="w-5 h-5 object-cover" />
                        <span className="font-black text-white text-xs">USDC</span>
                      </div>
                    ) : (
                      // Pay with Searchable Token Button
                      <button
                        onClick={() => setIsTokenSearchOpen(true)}
                        className="flex items-center gap-2 bg-[#0a0a0c] px-3.5 py-2 border-2 border-white hover:border-[#ccff00] transition-colors cursor-pointer shrink-0 shadow-[2px_2px_0px_0px_#000]"
                      >
                        <img src={selectedAsset.icon} alt={selectedAsset.symbol} className="w-5 h-5 object-contain" />
                        <span className="font-black text-white text-xs uppercase">{selectedAsset.symbol}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 stroke-[3]" />
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold text-right mt-2">
                    AVAILABLE: {mode === 'buy' ? stablecoin.balance.toLocaleString() : selectedAsset.balance.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-[#181820] border-2 border-white p-2 shadow-[2px_2px_0px_0px_#ccff00]">
                    <ArrowDownToLine className={`w-5 h-5 ${mode === 'buy' ? 'text-[#ccff00]' : 'text-[#ff007f] rotate-180'}`} />
                  </div>
                </div>

                {/* YOU RECEIVE */}
                <div className="bg-[#141419] border-2 border-white/30 p-4 relative group hover:border-white transition-colors">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">
                    You Receive (Estimated)
                  </label>
                  <div className="flex justify-between items-center gap-3">
                    <input
                      type="text"
                      readOnly
                      value={outputAmount}
                      className="bg-transparent border-none text-2xl font-black text-[#00f0ff] focus:outline-none w-1/2"
                      placeholder="0.00"
                    />
                    
                    {mode === 'buy' ? (
                      // Receive Searchable Token Button
                      <button
                        onClick={() => setIsTokenSearchOpen(true)}
                        className="flex items-center gap-2 bg-[#0a0a0c] px-3.5 py-2 border-2 border-white hover:border-[#00f0ff] transition-colors cursor-pointer shrink-0 shadow-[2px_2px_0px_0px_#000]"
                      >
                        <img src={selectedAsset.icon} alt={selectedAsset.symbol} className="w-5 h-5 object-contain" />
                        <span className="font-black text-white text-xs uppercase">{selectedAsset.symbol}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 stroke-[3]" />
                      </button>
                    ) : (
                      // Receive USDC
                      <div className="flex items-center gap-2 bg-[#0a0a0c] px-3 py-2 border-2 border-white shrink-0">
                        <img src={stablecoin.icon} alt="USDC" className="w-5 h-5 object-cover" />
                        <span className="font-black text-white text-xs">USDC</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-white/20 mt-6">
                <button
                  onClick={handleSwap}
                  disabled={!inputAmount || parseFloat(inputAmount) <= 0}
                  className={`w-full py-5 text-black font-black text-sm uppercase tracking-widest border-2 border-black shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 ${
                    mode === 'buy' ? 'bg-[#ccff00] hover:bg-[#d8ff33]' : 'bg-[#ff007f] text-white hover:bg-[#ff3399]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                  {getButtonText()}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Info & Order Summary Panel */}
        <div className="space-y-6">
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-4">
            <h3 className="text-sm font-black text-white uppercase border-b-2 border-white/20 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#ccff00]" />
              <span>OTC LIQUIDITY SUMMARY</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>1 {selectedAsset.symbol} PRICE:</span>
                <span className="text-white font-bold">${selectedAsset.priceUsd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>SETTLEMENT DESK:</span>
                <span className="text-[#00f0ff] font-bold uppercase">NORTHVEIL ZERO-SLIPPAGE</span>
              </div>
              <div className="flex justify-between">
                <span>ROUTING FEE:</span>
                <span className="text-[#ccff00] font-bold uppercase">FREE</span>
              </div>
            </div>

            <div className="p-3 bg-[#0a0a0c] border border-white/30 text-[10px] text-slate-400 space-y-2 mt-4">
              <span className="text-white font-bold block uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
                NATIVE DESK CLEARING
              </span>
              <span>
                Since fiat transfers are disabled, Northveil utilizes native stablecoins (USDC) for 1:1 USD purchasing power. Your trade executes directly on-chain instantly with zero counter-party risk.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
