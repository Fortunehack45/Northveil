import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CustomSelect } from './CustomSelect';
import { TokenSearchModal } from './TokenSearchModal';
import { Send, QrCode, Copy, Check, ShieldCheck, HardDrive, AlertTriangle, ChevronDown, Search } from 'lucide-react';

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
  const { assets, sendCrypto, receiveCrypto, triggerBiometricAuth, hardwareWallet, activeSubWallet } = useWallet();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAssetId || assets[0]?.id || 'eth-main'
  );
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('0.5');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTokenSearchOpen, setIsTokenSearchOpen] = useState<boolean>(false);

  const asset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const numAmount = parseFloat(amount) || 0;

  const getActiveDisplayAddress = (): string => {
    const net = asset?.network || '';
    if (net === 'solana' || net === 'solana_devnet') {
      return activeSubWallet?.solanaAddress || activeSubWallet?.address || '';
    }
    if (net === 'bitcoin') {
      return activeSubWallet?.bitcoinAddress || activeSubWallet?.address || '';
    }
    return activeSubWallet?.address || hardwareWallet.address || 'No address derived';
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      {/* Token Search Modal */}
      <TokenSearchModal
        isOpen={isTokenSearchOpen}
        onClose={() => setIsTokenSearchOpen(false)}
        selectedAssetId={selectedAssetId}
        onSelectToken={(t) => {
          setSelectedAssetId(t.id);
          setIsTokenSearchOpen(false);
        }}
        title="SELECT ASSET FOR TRANSACTION"
      />

      <div className="bg-[#141419] border-t-4 sm:border-4 border-white p-5 sm:p-8 max-w-md w-full rounded-t-3xl sm:rounded-none shadow-[0px_-8px_20px_rgba(0,0,0,0.9)] sm:shadow-[10px_10px_0px_0px_#ccff00] relative space-y-4 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar font-mono">
        {/* Native Mobile Sheet Pull Handle Bar */}
        <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        <div className="flex items-center justify-between border-b-2 border-white pb-3">
          <h3 className="text-xl font-black text-white font-mono uppercase flex items-center gap-2 tracking-tight">
            {mode === 'send' ? <Send className="w-5 h-5 text-[#ccff00] stroke-[3]" /> : <QrCode className="w-5 h-5 text-[#ccff00] stroke-[3]" />}
            <span>{mode === 'send' ? `SEND ${asset.symbol}` : `RECEIVE ${asset.symbol}`}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 px-3 border-2 border-black bg-[#ff007f] text-white font-black hover:bg-[#ff3399] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Asset Selector Button */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-black text-slate-300 uppercase">SELECT ASSET</label>
          <button
            onClick={() => setIsTokenSearchOpen(true)}
            className="w-full flex items-center justify-between bg-[#0a0a0c] border-2 border-white p-3 hover:border-[#00f0ff] cursor-pointer transition-all shadow-[3px_3px_0px_0px_#000]"
          >
            <div className="flex items-center gap-2.5">
              <img src={asset.icon} alt={asset.symbol} className="w-6 h-6 object-contain" />
              <div className="text-left">
                <div className="text-xs font-black text-white uppercase">{asset.symbol} - {asset.name}</div>
                <div className="text-[10px] text-slate-400 font-bold">BALANCE: {asset.balance} {asset.symbol}</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 stroke-[3]" />
          </button>
        </div>

        {mode === 'send' ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-black text-slate-300 uppercase">RECIPIENT ADDRESS</label>
              <input
                type="text"
                placeholder="PASTE 0X ADDRESS OR ENS..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-black">
                <span className="text-slate-300 uppercase">AMOUNT</span>
                <span className="text-slate-300 uppercase">
                  AVAILABLE: <strong className="text-[#ccff00] font-black">{asset.balance} {asset.symbol}</strong>
                </span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0a0a0c] border-2 border-white p-3 text-lg font-mono font-black text-white focus:outline-none"
              />
            </div>

            <button
              disabled={isSending || !recipientAddress || numAmount <= 0}
              onClick={handleConfirmSend}
              className="w-full py-3.5 bg-[#ccff00] text-black font-mono font-black uppercase tracking-wider text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer disabled:opacity-50 transition-all"
            >
              {isSending ? 'SIGNING TRANSACTION...' : `SEND ${numAmount} ${asset.symbol}`}
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            {/* Generated QR Code placeholder */}
            <div className="bg-white p-4 w-48 h-48 mx-auto flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_#000]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${getActiveDisplayAddress()}`}
                alt="Deposit QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-300 font-black uppercase tracking-wider">YOUR DEPOSIT ADDRESS ({asset.network.toUpperCase()})</span>
              <div className="bg-[#0a0a0c] p-3 border-2 border-white text-xs font-mono text-[#00f0ff] font-bold break-all select-all shadow-[2px_2px_0px_0px_#000]">
                {getActiveDisplayAddress()}
              </div>
            </div>

            <button
              onClick={handleCopyAddress}
              className="w-full py-3.5 bg-[#00f0ff] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#33f3ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
              <span>{copied ? 'COPIED ADDRESS!' : 'COPY DEPOSIT ADDRESS'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
