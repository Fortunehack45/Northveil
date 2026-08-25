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

  const evmChains = SUPPORTED_CHAINS.filter((c) => c.id !== 'solana' && c.id !== 'bitcoin');

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
      (a) => a.contractAddress?.toLowerCase() === contractAddress.toLowerCase() && a.network === selectedNetwork
    );
    if (alreadyExists) {
      setError(`Token "${alreadyExists.symbol}" is already tracked in your wallet.`);
      setIsResolving(false);
      return;
    }

    const token = await TokenService.resolveCustomToken(
      contractAddress,
      selectedNetwork,
      ''
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 sm:p-6 mono-animate-in">
      <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-7 relative space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Import Custom Token</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Track any ERC-20 token in your vault.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-2 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-sm font-medium cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Network Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Select Network</label>
          <div className="grid grid-cols-3 gap-2">
            {evmChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  setSelectedNetwork(chain.id);
                  setResolvedToken(null);
                  setError('');
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  selectedNetwork === chain.id
                    ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                    : 'bg-black/[0.02] dark:bg-black/40 border-black/[0.06] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-zinc-900'
                }`}
              >
                <img src={chain.icon} alt={chain.name} className="w-4 h-4 object-contain rounded-full" />
                <span className="truncate">{chain.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contract Address Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Contract Address</label>
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
              className="flex-1 bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
            />
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl hover:opacity-85 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center"
            >
              {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-xl">
            <AlertTriangle className="w-4 h-4 text-zinc-900 dark:text-white flex-shrink-0" />
            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">{error}</p>
          </div>
        )}

        {/* Resolved Token Preview */}
        {resolvedToken && (
          <div className="space-y-4">
            <div className="p-4 bg-black/[0.02] dark:bg-black/40 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-zinc-900 dark:text-white">{resolvedToken.symbol}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{resolvedToken.name}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-zinc-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/[0.04] dark:bg-black p-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-zinc-500 text-[11px] block">NETWORK</span>
                  <p className="text-zinc-900 dark:text-white font-semibold mt-0.5">{selectedNetwork.toUpperCase()}</p>
                </div>
                <div className="bg-black/[0.04] dark:bg-black p-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-zinc-500 text-[11px] block">PRICE</span>
                  <p className="text-zinc-900 dark:text-white font-semibold mt-0.5">
                    {resolvedToken.priceUsd > 0 ? `$${resolvedToken.priceUsd.toFixed(4)}` : '$0.00'}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 break-all font-mono">
                {contractAddress}
              </div>
            </div>

            <button
              onClick={handleImport}
              className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-sm"
            >
              Import Token to Vault
            </button>
          </div>
        )}

        {/* Loading state */}
        {isResolving && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-7 h-7 text-zinc-900 dark:text-white animate-spin" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono animate-pulse">Querying blockchain for token metadata...</p>
          </div>
        )}
      </div>
    </div>
  );
};
