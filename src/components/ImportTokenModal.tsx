import React, { useState } from 'react';
import { X, Search, Loader2, CheckCircle2, AlertTriangle, Coins } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { TokenService } from '../services/TokenService';
import { SUPPORTED_CHAINS } from '../data/initialData';
import { NetworkId, CryptoAsset } from '../types';

interface ImportTokenModalProps {
  onClose: () => void;
}

export const ImportTokenModal: React.FC<ImportTokenModalProps> = ({ onClose }) => {
  const { activeChain, addCustomToken, assets } = useWallet();
  const [contractAddress, setContractAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>(activeChain || 'ethereum');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedToken, setResolvedToken] = useState<CryptoAsset | null>(null);
  const [error, setError] = useState('');

  const evmChains = SUPPORTED_CHAINS.filter(c => c.id !== 'solana' && c.id !== 'bitcoin');

  const handleResolve = async () => {
    if (!contractAddress || contractAddress.length < 30) {
      setError('Please enter a valid contract address.');
      return;
    }
    setIsResolving(true);
    setError('');
    setResolvedToken(null);

    // Check if token already exists
    const alreadyExists = assets.find(
      a => a.contractAddress?.toLowerCase() === contractAddress.toLowerCase() && a.network === selectedNetwork
    );
    if (alreadyExists) {
      setError(`Token "${alreadyExists.symbol}" is already tracked in your wallet.`);
      setIsResolving(false);
      return;
    }

    const token = await TokenService.resolveCustomToken(
      contractAddress,
      selectedNetwork,
      '' // wallet address not needed for metadata resolution, but for balance we'd need it
    );

    setIsResolving(false);
    if (token) {
      setResolvedToken(token);
    } else {
      setError('Could not resolve token. Make sure the contract address is correct and the selected network matches.');
    }
  };

  const handleImport = () => {
    if (!resolvedToken) return;
    addCustomToken(resolvedToken);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#141419] border-4 border-white p-6 sm:p-8 max-w-lg w-full shadow-[12px_12px_0px_0px_#00f0ff] relative space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-white pb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#00f0ff]" />
            <span className="text-white font-black text-sm uppercase">IMPORT CUSTOM TOKEN</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Network Selector */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-300 uppercase">SELECT NETWORK</label>
          <div className="grid grid-cols-3 gap-2">
            {evmChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  setSelectedNetwork(chain.id);
                  setResolvedToken(null);
                  setError('');
                }}
                className={`flex items-center gap-1.5 p-2 border-2 text-[10px] font-black uppercase cursor-pointer transition-all ${
                  selectedNetwork === chain.id
                    ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]'
                    : 'border-white/20 bg-[#0a0a0c] text-white/60 hover:border-white/40'
                }`}
              >
                <img src={chain.icon} alt={chain.name} className="w-4 h-4 object-contain" />
                <span className="truncate">{chain.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contract Address Input */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-300 uppercase">CONTRACT ADDRESS</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => {
                setContractAddress(e.target.value);
                setResolvedToken(null);
                setError('');
              }}
              className="flex-1 bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white font-mono focus:outline-none focus:border-[#00f0ff]"
            />
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="px-4 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#33f3ff] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-[#ff007f]/10 border-2 border-[#ff007f]">
            <AlertTriangle className="w-4 h-4 text-[#ff007f] flex-shrink-0" />
            <p className="text-xs text-[#ff007f] font-bold">{error}</p>
          </div>
        )}

        {/* Resolved Token Preview */}
        {resolvedToken && (
          <div className="space-y-4">
            <div className="p-4 bg-[#0a0a0c] border-2 border-[#ccff00] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-black text-white">{resolvedToken.symbol}</p>
                  <p className="text-xs text-slate-400">{resolvedToken.name}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-[#ccff00]" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#141419] p-2 border border-white/10">
                  <span className="text-slate-500">NETWORK</span>
                  <p className="text-white font-bold mt-0.5">{selectedNetwork.toUpperCase()}</p>
                </div>
                <div className="bg-[#141419] p-2 border border-white/10">
                  <span className="text-slate-500">PRICE</span>
                  <p className="text-white font-bold mt-0.5">
                    {resolvedToken.priceUsd > 0 ? `$${resolvedToken.priceUsd.toFixed(6)}` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 break-all font-mono">
                {contractAddress}
              </div>
            </div>

            <button
              onClick={handleImport}
              className="w-full py-3.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer transition-all"
            >
              IMPORT TOKEN TO WALLET
            </button>
          </div>
        )}

        {/* Loading state */}
        {isResolving && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-8 h-8 text-[#00f0ff] animate-spin" />
            <p className="text-xs text-slate-300 font-mono animate-pulse">QUERYING BLOCKCHAIN FOR TOKEN METADATA...</p>
          </div>
        )}
      </div>
    </div>
  );
};
