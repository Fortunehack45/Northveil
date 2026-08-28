import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../context/WalletContext';
import { TokenSearchModal } from './TokenSearchModal';
import { Send, QrCode, Copy, Check, ChevronDown } from 'lucide-react';
import { sanitizeToValidAddress } from '../services/addressUtils';

interface SendReceiveModalProps {
  mode: 'send' | 'receive';
  initialAssetId?: string;
  onClose: () => void;
}

export const SendReceiveModal: React.FC<SendReceiveModalProps> = ({
  mode,
  initialAssetId,
  onClose,
}) => {
  const { assets, sendCrypto, triggerBiometricAuth, hardwareWallet, activeSubWallet } = useWallet();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAssetId || assets[0]?.id || 'eth-main'
  );
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('0.05');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTokenSearchOpen, setIsTokenSearchOpen] = useState<boolean>(false);

  const asset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const numAmount = parseFloat(amount) || 0;

  const getActiveDisplayAddress = (): string => {
    const net = asset?.network || '';
    if (net === 'solana' || net === 'solana_devnet') {
      return activeSubWallet?.solanaAddress || sanitizeToValidAddress(activeSubWallet?.address, activeSubWallet?.accountIndex || 0);
    }
    if (net === 'bitcoin') {
      return activeSubWallet?.bitcoinAddress || sanitizeToValidAddress(activeSubWallet?.address, activeSubWallet?.accountIndex || 0);
    }
    return sanitizeToValidAddress(activeSubWallet?.address || hardwareWallet.address, activeSubWallet?.accountIndex || 0);
  };

  const handleCopyAddress = () => {
    const addr = getActiveDisplayAddress();
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmSend = () => {
    if (!recipientAddress || numAmount <= 0) return;

    triggerBiometricAuth(`Authorize Send of ${numAmount} ${asset.symbol}`, async () => {
      setIsSending(true);
      try {
        await sendCrypto({
          assetId: asset.id,
          amount: numAmount,
          recipientAddress,
          gasFeeUsd: 2.50,
        });
      } catch (e: any) {
        console.error('Send crypto error:', e);
      } finally {
        setIsSending(false);
        onClose();
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 sm:p-6 mono-animate-in">
      {/* Token Search Modal */}
      <TokenSearchModal
        isOpen={isTokenSearchOpen}
        onClose={() => setIsTokenSearchOpen(false)}
        selectedAssetId={selectedAssetId}
        onSelectToken={(t) => {
          setSelectedAssetId(t.id);
          setIsTokenSearchOpen(false);
        }}
        title="Select Token"
      />

      <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl max-w-md w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Fixed Header (Never Cut Off) */}
        <div className="p-6 pb-3 flex items-center justify-between shrink-0 bg-white dark:bg-[#121215]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
              {mode === 'send' ? <Send className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                {mode === 'send' ? `Send ${asset.symbol}` : `Receive ${asset.symbol}`}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {mode === 'send' ? 'Instant On-Chain Transfer' : 'Direct Multi-Chain Vault Deposit'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-2 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-sm font-medium cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Body */}
        {mode === 'send' ? (
          <div className="p-6 pt-2 overflow-y-auto no-scrollbar space-y-4 flex-1">
            {/* Token Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Asset</label>
              <button
                type="button"
                onClick={() => setIsTokenSearchOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-black/[0.04] dark:bg-black border border-black/[0.06] dark:border-transparent rounded-xl text-xs hover:bg-black/[0.07] dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={asset.icon}
                    alt={asset.symbol}
                    className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 object-cover"
                  />
                  <div className="text-left">
                    <span className="font-semibold text-zinc-900 dark:text-white block">{asset.name} ({asset.symbol})</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Balance: {asset.balance.toLocaleString()} {asset.symbol}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>

            {/* Recipient Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Recipient Address
              </label>
              <input
                type="text"
                placeholder={asset.network === 'solana' ? 'Solana base58 address...' : '0x...'}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Amount</label>
                <button
                  type="button"
                  onClick={() => setAmount(asset.balance.toString())}
                  className="text-[11px] text-zinc-900 dark:text-white font-semibold hover:underline font-mono cursor-pointer"
                >
                  MAX ({asset.balance.toLocaleString()} {asset.symbol})
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-sm text-zinc-900 dark:text-white font-mono font-medium focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            {/* Transaction Review Breakdown */}
            <div className="p-3.5 bg-black/[0.03] dark:bg-black/50 border border-black/[0.04] dark:border-transparent rounded-xl space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Estimated Network Gas:</span>
                <span className="text-zinc-900 dark:text-white font-medium">$2.50 USD</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Total Outflow:</span>
                <span className="text-zinc-900 dark:text-white font-semibold">
                  {numAmount} {asset.symbol} (~${(numAmount * asset.priceUsd).toFixed(2)})
                </span>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleConfirmSend}
              disabled={isSending || !recipientAddress || numAmount <= 0}
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full text-xs hover:opacity-85 active:scale-[0.98] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {isSending ? 'Signing & Broadcasting...' : `Confirm & Send ${asset.symbol}`}
            </button>
          </div>
        ) : (
          <div className="p-6 pt-2 overflow-y-auto no-scrollbar space-y-4 flex-1 text-center">
            {/* Token Selector for Receiving */}
            <div>
              <button
                type="button"
                onClick={() => setIsTokenSearchOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-black/[0.04] dark:bg-black border border-black/[0.06] dark:border-transparent rounded-xl text-xs hover:bg-black/[0.07] dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={asset.icon}
                    alt={asset.symbol}
                    className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 object-cover"
                  />
                  <div className="text-left">
                    <span className="font-semibold text-zinc-900 dark:text-white block">{asset.name} ({asset.symbol})</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono capitalize">{asset.network}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>

            {/* QR Display */}
            <div className="mx-auto w-48 h-48 bg-white p-3 rounded-2xl border border-black/[0.08] shadow-md flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${getActiveDisplayAddress()}`}
                alt="Deposit Address QR"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Address copy */}
            <div className="p-3 bg-black/[0.04] dark:bg-black border border-black/[0.06] dark:border-transparent rounded-xl flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-zinc-900 dark:text-zinc-200 truncate">
                {getActiveDisplayAddress()}
              </span>
              <button
                onClick={handleCopyAddress}
                className="p-1.5 rounded-lg bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.12] dark:hover:bg-white/[0.16] text-zinc-900 dark:text-white cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-zinc-900 dark:text-white" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full text-xs hover:opacity-85 active:scale-[0.98] cursor-pointer transition-all shadow-md"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
