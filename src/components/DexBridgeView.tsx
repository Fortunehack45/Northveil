import React, { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { CustomSelect } from './CustomSelect';
import { TokenSearchModal } from './TokenSearchModal';
import { SUPPORTED_CHAINS } from '../data/initialData';
import { NetworkId, CryptoAsset } from '../types';
import {
  ArrowDown,
  ArrowRight,
  RefreshCw,
  Settings,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  GitCommit,
  ChevronDown,
  Search,
} from 'lucide-react';
import { SwapService, SwapQuoteResult } from '../services/SwapService';

export const DexBridgeView: React.FC = () => {
  const {
    assets,
    executeSwap,
    gasEstimates,
    userSettings,
    updateUserSettings,
    triggerBiometricAuth,
    hardwareWallet,
    t,
  } = useWallet();

  const [mode, setMode] = useState<'swap' | 'bridge'>('swap');
  const [fromAssetId, setFromAssetId] = useState<string>(assets[0]?.id || 'eth-main');
  const [toAssetId, setToAssetId] = useState<string>(assets[1]?.id || 'usdc-eth');
  const [fromAmount, setFromAmount] = useState<string>('1.0');
  const [bridgeTargetNetwork, setBridgeTargetNetwork] = useState<NetworkId>('solana');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [latestTxHash, setLatestTxHash] = useState<string>('');
  const [selectingTokenFor, setSelectingTokenFor] = useState<'from' | 'to' | null>(null);

  const fromAsset = assets.find((a) => a.id === fromAssetId) || assets[0];
  const toAsset = assets.find((a) => a.id === toAssetId) || assets[1];

  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteData, setQuoteData] = useState<SwapQuoteResult | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const numFromAmount = parseFloat(fromAmount) || 0;

  React.useEffect(() => {
    if (numFromAmount <= 0 || !fromAsset || !toAsset) {
      setQuoteData(null);
      setQuoteError(null);
      return;
    }
    
    // Cross-chain bridge not supported by 1inch/Jupiter out of the box in this basic implementation
    if (mode === 'bridge' || fromAsset.network !== toAsset.network) {
      setQuoteError("Cross-chain routing requires Stargate/LayerZero (mocked for now).");
      setQuoteData(null);
      return;
    }

    const fetchQuote = async () => {
      setIsQuoting(true);
      setQuoteError(null);
      try {
        const res = await SwapService.getQuote({
          fromAsset,
          toAsset,
          amount: numFromAmount,
          slippage: userSettings.slippageTolerance
        });
        setQuoteData(res);
      } catch (err: any) {
        setQuoteError(err.message || 'Failed to fetch quote');
        setQuoteData(null);
      } finally {
        setIsQuoting(false);
      }
    };
    
    const timeout = setTimeout(fetchQuote, 500); // debounce
    return () => clearTimeout(timeout);
  }, [numFromAmount, fromAsset, toAsset, mode, userSettings.slippageTolerance]);

  const estimatedToAmount = quoteData ? parseFloat(quoteData.estimatedToAmount) : 0;
  const priceImpact = quoteData ? quoteData.priceImpact : 0;
  const currentGas = quoteData ? quoteData.gasFeeEstimated : 0;

  const exchangeRate = estimatedToAmount > 0 && numFromAmount > 0 ? estimatedToAmount / numFromAmount : 0;

  // Switch direction
  const handleSwitchTokens = () => {
    setFromAssetId(toAssetId);
    setToAssetId(fromAssetId);
  };

  const handleMaxClick = () => {
    if (fromAsset) {
      setFromAmount(fromAsset.balance.toString());
    }
  };

  const handleExecute = () => {
    if (numFromAmount <= 0) return;
    if (numFromAmount > fromAsset.balance) {
      alert('Insufficient token balance for transaction.');
      return;
    }

    const performTransaction = async () => {
      setIsSwapping(true);
      try {
        const txHash = await executeSwap({
          fromAssetId: fromAsset.id,
          toAssetId: toAsset.id,
          fromAmount: numFromAmount,
          toAmount: estimatedToAmount,
          isBridge: mode === 'bridge',
          toNetwork: mode === 'bridge' ? bridgeTargetNetwork : fromAsset.network,
          gasFeeUsd: currentGas,
          quoteData: mode === 'swap' ? quoteData?.routeParams : undefined
        });

        if (txHash) {
          setLatestTxHash(txHash);
          setIsSwapping(false);
          setShowSuccessModal(true);
        } else {
          setIsSwapping(false);
        }
      } catch (err) {
        setIsSwapping(false);
      }
    };

    triggerBiometricAuth(`Authorize ${mode.toUpperCase()} of ${numFromAmount} ${fromAsset.symbol}`, performTransaction);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between bg-[#141419] border-2 border-white p-2 shadow-[6px_6px_0px_0px_#ccff00] gap-2">
        <button
          onClick={() => setMode('swap')}
          className={`flex-1 py-3 border-2 border-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === 'swap'
              ? 'bg-[#ccff00] text-black shadow-[3px_3px_0px_0px_#000]'
              : 'bg-[#181820] text-slate-300 hover:text-white border-transparent'
          }`}
        >
          <Zap className="w-4 h-4 stroke-[3]" />
          <span>DEX INSTANT SWAP</span>
        </button>
        <button
          onClick={() => setMode('bridge')}
          className={`flex-1 py-3 border-2 border-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === 'bridge'
              ? 'bg-[#00f0ff] text-black shadow-[3px_3px_0px_0px_#000]'
              : 'bg-[#181820] text-slate-300 hover:text-white border-transparent'
          }`}
        >
          <GitCommit className="w-4 h-4 stroke-[3]" />
          <span>CROSS-CHAIN BRIDGE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Main Swap / Bridge Card */}
        <div className="lg:col-span-7 bg-[#141419] border-2 border-white p-4 sm:p-8 shadow-[4px_4px_0px_0px_#ff007f] sm:shadow-[8px_8px_0px_0px_#ff007f] relative space-y-6">
          {/* Header Settings */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-white pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-[#ff007f] text-white text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                  AGGREGATOR V4
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white font-mono uppercase tracking-tight">
                  {mode === 'swap' ? 'SWAP TOKENS' : 'CROSS-CHAIN BRIDGE'}
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-mono mt-1">
                {mode === 'swap'
                  ? 'OPTIMAL LIQUIDITY ROUTING ACROSS UNISWAP, CURVE, BALANCER'
                  : 'ATOMIC CROSS-CHAIN BRIDGE POWERED BY STARGATE & LAYERZERO'}
              </p>
            </div>

            {/* Slippage Settings */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-mono font-bold text-slate-300">SLIPPAGE:</span>
              <div className="flex items-center gap-1 bg-[#0a0a0c] p-1 border-2 border-white">
                {[0.1, 0.5, 1.0].map((val) => (
                  <button
                    key={val}
                    onClick={() => updateUserSettings({ slippageTolerance: val })}
                    className={`px-2 py-1 text-xs font-mono font-black transition-colors cursor-pointer ${
                      userSettings.slippageTolerance === val
                        ? 'bg-[#ffe600] text-black border border-black shadow-[1px_1px_0px_0px_#000]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FROM Token Input Box */}
          <div className="bg-[#0a0a0c] p-4.5 border-2 border-white space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span className="text-[#ccff00]">YOU PAY</span>
              <div className="flex items-center gap-1">
                <span>BALANCE:</span>
                <span className="text-white font-mono font-bold">{fromAsset.balance} {fromAsset.symbol}</span>
                <button
                  onClick={handleMaxClick}
                  className="bg-[#ff007f] text-white font-black px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] ml-1 cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl sm:text-3xl font-black text-white font-mono focus:outline-none"
              />

              {/* From Asset Selector Button */}
              <button
                onClick={() => setSelectingTokenFor('from')}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#ccff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer shrink-0 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <img src={fromAsset.icon} alt={fromAsset.symbol} className="w-5 h-5 object-contain" />
                <span>{fromAsset.symbol}</span>
                <span className="text-[9px] bg-black text-[#ccff00] px-1 py-0.2">{fromAsset.network.slice(0, 3)}</span>
                <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              ≈ ${(numFromAmount * fromAsset.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
            </div>
          </div>

          {/* Swap / Switch Arrow Divider */}
          <div className="flex justify-center -my-3.5 relative z-10">
            <button
              onClick={handleSwitchTokens}
              className="p-3 bg-[#ccff00] border-2 border-black text-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              title="Switch direction"
            >
              <ArrowDown className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* TO Token Input Box */}
          <div className="bg-[#0a0a0c] p-4.5 border-2 border-white space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span className="text-[#00f0ff]">YOU RECEIVE (ESTIMATED)</span>
              <span>
                BALANCE: <strong className="text-white font-mono">{toAsset.balance} {toAsset.symbol}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                readOnly
                value={estimatedToAmount.toString()}
                className="w-full bg-transparent text-2xl sm:text-3xl font-black text-[#ccff00] font-mono focus:outline-none"
              />

              {/* To Asset Selector Button */}
              <button
                onClick={() => setSelectingTokenFor('to')}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#00f0ff] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#33f3ff] cursor-pointer shrink-0 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <img src={toAsset.icon} alt={toAsset.symbol} className="w-5 h-5 object-contain" />
                <span>{toAsset.symbol}</span>
                <span className="text-[9px] bg-black text-[#00f0ff] px-1 py-0.2">{toAsset.network.slice(0, 3)}</span>
                <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              ≈ ${(estimatedToAmount * toAsset.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
            </div>
          </div>

          {/* Cross-Chain Bridge Target Network Selector */}
          {mode === 'bridge' && (
            <div className="mt-4 p-4 bg-[#0a0a0c] border-2 border-white space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-black text-[#00f0ff]">
                <span className="flex items-center gap-1.5 uppercase">
                  <GitCommit className="w-4 h-4 text-[#ff007f]" />
                  SELECT DESTINATION BLOCKCHAIN
                </span>
                <span className="text-slate-400">LAYERZERO ACTIVE</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {SUPPORTED_CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setBridgeTargetNetwork(c.id)}
                    className={`p-2.5 text-xs font-mono font-black border-2 flex items-center gap-2 transition-all cursor-pointer ${
                      bridgeTargetNetwork === c.id
                        ? 'bg-[#ffe600] border-black text-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-[#181820] border-white/30 text-slate-300 hover:border-white'
                    }`}
                  >
                    <img src={c.icon} alt={c.name} className="w-5 h-5 object-contain rounded-full border border-white/20 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Details Accordion / Summary */}
          <div className="mt-6 p-4 bg-[#0a0a0c] border-2 border-white space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span>EXCHANGE RATE</span>
              <span className="font-mono text-white font-bold">
                1 {fromAsset.symbol} = {exchangeRate.toFixed(4)} {toAsset.symbol}
              </span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>PRICE IMPACT</span>
              <span
                className={`font-mono font-black ${
                  priceImpact > 1.0 ? 'text-[#ff007f]' : 'text-[#ccff00]'
                }`}
              >
                {priceImpact}%
              </span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>MINIMUM RECEIVED (SLIPPAGE {userSettings.slippageTolerance}%)</span>
              <span className="font-mono text-white font-bold">
                {(estimatedToAmount * (1 - userSettings.slippageTolerance / 100)).toFixed(4)}{' '}
                {toAsset.symbol}
              </span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>ESTIMATED NETWORK FEE</span>
              <span className="font-mono text-[#ccff00] font-bold">${currentGas.toFixed(2)} USD</span>
            </div>

            {hardwareWallet.isConnected && (
              <div className="flex justify-between text-[#00f0ff] font-bold pt-2 border-t-2 border-white">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" /> HARDWARE SIGNATURE REQUIRED
                </span>
                <span>{hardwareWallet.deviceName}</span>
              </div>
            )}
          </div>

          {/* Execute Action Button */}
          <button
            disabled={isSwapping || numFromAmount <= 0}
            onClick={handleExecute}
            className={`w-full mt-6 py-4 border-2 border-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer ${
              isSwapping || numFromAmount <= 0
                ? 'bg-[#202028] text-slate-500 cursor-not-allowed border-black'
                : 'bg-[#ccff00] text-black hover:bg-[#d8ff33] active:translate-x-1 active:translate-y-1 active:shadow-none'
            }`}
          >
            {isSwapping ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-black" />
                <span>ROUTING & SIGNING TRANSACTION...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-black stroke-[3]" />
                <span>
                  CONFIRM {mode === 'swap' ? 'SWAP' : 'BRIDGE'} ({numFromAmount} {fromAsset.symbol})
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Execution Route Visualizer & Order Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Smart Route & Liquidity Pools Visualizer */}
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <h3 className="text-sm font-black text-white font-mono uppercase tracking-tight">
                OPTIMAL ROUTE AGGREGATION
              </h3>
              <span className="px-2 py-0.5 bg-[#00f0ff] text-black text-[10px] font-black border border-black shadow-[1px_1px_0px_0px_#000]">
                MEV PROTECTED
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Route split steps */}
              <div className="bg-[#0a0a0c] p-3 border-2 border-white space-y-2 shadow-[3px_3px_0px_0px_#000]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ccff00]" /> UNISWAP V3 (ETH/USDC 0.05%)
                  </span>
                  <span className="text-[#ccff00] font-black">64.2% ALLOC</span>
                </div>
                <div className="w-full bg-[#181820] h-2 border border-white">
                  <div className="bg-[#ccff00] h-full" style={{ width: '64.2%' }} />
                </div>
              </div>

              <div className="bg-[#0a0a0c] p-3 border-2 border-white space-y-2 shadow-[3px_3px_0px_0px_#000]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" /> CURVE TRICRYPTO2
                  </span>
                  <span className="text-[#00f0ff] font-black">23.8% ALLOC</span>
                </div>
                <div className="w-full bg-[#181820] h-2 border border-white">
                  <div className="bg-[#00f0ff] h-full" style={{ width: '23.8%' }} />
                </div>
              </div>

              <div className="bg-[#0a0a0c] p-3 border-2 border-white space-y-2 shadow-[3px_3px_0px_0px_#000]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ff007f]" /> BALANCER V2 POOL
                  </span>
                  <span className="text-[#ff007f] font-black">12.0% ALLOC</span>
                </div>
                <div className="w-full bg-[#181820] h-2 border border-white">
                  <div className="bg-[#ff007f] h-full" style={{ width: '12.0%' }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#0a0a0c] border border-white/40 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#ccff00] shrink-0 stroke-[3]" />
              <span>Flashbots Private RPC enabled to prevent front-running & sandwich attacks.</span>
            </div>
          </div>

          {/* Security & Hardware Status Card */}
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ffe600] space-y-3 font-mono">
            <h3 className="text-sm font-black text-white uppercase tracking-tight border-b-2 border-white pb-2">
              SECURITY AUDIT STATUS
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>SMART CONTRACT AUDIT:</span>
                <span className="text-[#ccff00] font-black uppercase">VERIFIED BY CERTIK</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>HARDWARE DEVICE:</span>
                <span className={hardwareWallet.isConnected ? 'text-[#00f0ff] font-black' : 'text-slate-400 font-bold'}>
                  {hardwareWallet.isConnected ? hardwareWallet.deviceName : 'NOT CONNECTED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>BIOMETRIC REQUIREMENT:</span>
                <span className={userSettings.biometricsEnabled ? 'text-[#ccff00] font-black' : 'text-slate-500'}>
                  {userSettings.biometricsEnabled ? 'ACTIVE (FACE ID / TOUCH ID)' : 'DISABLED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#141419] border-4 border-white p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#ccff00] text-center space-y-4 relative">
            <div className="w-16 h-16 bg-[#ccff00] border-2 border-black text-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
              <CheckCircle2 className="w-10 h-10 text-black stroke-[3]" />
            </div>

            <h3 className="text-2xl font-black text-white font-mono tracking-tight uppercase">TRANSACTION CONFIRMED!</h3>
            <p className="text-xs font-mono text-slate-300">
              SUCCESSFULLY {mode === 'swap' ? 'SWAPPED' : 'BRIDGED'} {numFromAmount} {fromAsset.symbol}{' '}
              FOR {estimatedToAmount} {toAsset.symbol}.
            </p>

            <div className="bg-[#0a0a0c] p-3 border-2 border-white text-left space-y-1 font-mono text-xs text-slate-300">
              <div className="text-[10px] text-slate-400">TRANSACTION HASH:</div>
              <div className="truncate font-bold text-[#ccff00]">{latestTxHash}</div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 bg-[#ccff00] text-black font-black border-2 border-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] cursor-pointer"
            >
              DONE & VIEW PORTFOLIO
            </button>
          </div>
        </div>
      )}

      {/* Professional Searchable Token Selector Modal */}
      <TokenSearchModal
        isOpen={selectingTokenFor !== null}
        onClose={() => setSelectingTokenFor(null)}
        selectedAssetId={selectingTokenFor === 'from' ? fromAssetId : toAssetId}
        onSelectToken={(asset) => {
          if (selectingTokenFor === 'from') {
            setFromAssetId(asset.id);
          } else if (selectingTokenFor === 'to') {
            setToAssetId(asset.id);
          }
          setSelectingTokenFor(null);
        }}
        title={selectingTokenFor === 'from' ? 'SELECT TOKEN TO PAY' : 'SELECT TOKEN TO RECEIVE'}
      />
    </div>
  );
};
