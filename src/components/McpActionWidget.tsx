import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  QrCode,
  FileCode,
  ImageIcon,
  Layers,
  Fuel,
  RefreshCw,
  Send,
  Lock,
} from 'lucide-react';

export interface McpWidgetPayload {
  type: 'transfer' | 'receipt' | 'request' | 'contract_metadata' | 'swap' | 'contract_deploy';
  title?: string;
  sender?: string;
  recipient?: string;
  amount?: string | number;
  symbol?: string;
  network?: string;
  gasFeeUsd?: string | number;
  txHash?: string;
  blockNumber?: number;
  status?: string;
  contractAddress?: string;
  name?: string;
  decimals?: number;
  totalSupply?: string;
  imageUrl?: string;
  tokenType?: 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'SPL';
  qrData?: string;
  fromSymbol?: string;
  fromAmount?: string | number;
  toSymbol?: string;
  toAmount?: string | number;
}

interface McpActionWidgetProps {
  payload: McpWidgetPayload;
  onExecute?: () => void;
  onCancel?: () => void;
}

export const McpActionWidget: React.FC<McpActionWidgetProps> = ({ payload, onExecute, onCancel }) => {
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [executedTxHash, setExecutedTxHash] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteClick = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsDone(true);
      const randomHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setExecutedTxHash(randomHash);
      if (onExecute) onExecute();
    }, 1200);
  };

  // 1. TRANSFER ACTION CARD
  if (payload.type === 'transfer') {
    return (
      <div className="bg-[#141419] border-3 border-white p-5 shadow-[6px_6px_0px_0px_#ccff00] font-mono space-y-4 my-3 text-left">
        <div className="flex items-center justify-between border-b-2 border-white pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ccff00] animate-ping" />
            <span className="font-black text-white text-xs uppercase tracking-wider">MCP AI TRANSFER INTENT</span>
          </div>
          <span className="px-2 py-0.5 bg-[#ccff00] text-black font-black text-[9px] uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
            EIP-1193 ACTION
          </span>
        </div>

        <div className="bg-[#0a0a0c] border-2 border-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase">TRANSFER AMOUNT:</span>
            <span className="text-xl font-black text-[#ccff00]">
              {payload.amount} {payload.symbol || 'ETH'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-white/20 pt-2">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">FROM SENDER:</span>
              <span className="text-white font-bold font-mono">
                {payload.sender ? `${payload.sender.slice(0, 8)}...${payload.sender.slice(-6)}` : '0x71C8...C8'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">TO RECIPIENT:</span>
              <span className="text-[#00f0ff] font-bold font-mono">
                {payload.recipient ? `${payload.recipient.slice(0, 8)}...${payload.recipient.slice(-6)}` : '0x742d...44e'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-white/10">
            <span>NETWORK: {payload.network || 'Ethereum Mainnet'}</span>
            <span className="text-[#ccff00] font-bold">GAS EST: ${payload.gasFeeUsd || '0.45'} USD</span>
          </div>
        </div>

        {isDone ? (
          <div className="bg-[#00f0ff] text-black border-2 border-black p-3 font-black text-xs uppercase flex items-center justify-between shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>ON-CHAIN BROADCASTED!</span>
            </div>
            <code className="text-[10px] bg-black text-[#00f0ff] px-2 py-0.5 border border-black">
              {executedTxHash ? `${executedTxHash.slice(0, 10)}...` : 'SUCCESS'}
            </code>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteClick}
              disabled={isExecuting}
              className="flex-1 py-2.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
            >
              <Send className={`w-3.5 h-3.5 stroke-[3] ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'BROADCASTING...' : 'CONFIRM & EXECUTE ON-CHAIN'}</span>
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2.5 bg-[#0a0a0c] text-white font-bold text-xs uppercase border-2 border-white hover:bg-white/10 cursor-pointer"
              >
                REJECT
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. RECEIPT CARD
  if (payload.type === 'receipt') {
    return (
      <div className="bg-[#141419] border-3 border-white p-5 shadow-[6px_6px_0px_0px_#00f0ff] font-mono space-y-4 my-3 text-left">
        <div className="flex items-center justify-between border-b-2 border-white pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00f0ff] stroke-[3]" />
            <span className="font-black text-white text-xs uppercase tracking-wider">CRYPTOGRAPHIC TRANSACTION RECEIPT</span>
          </div>
          <span className="px-2 py-0.5 bg-[#00f0ff] text-black font-black text-[9px] uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
            CONFIRMED
          </span>
        </div>

        <div className="bg-[#0a0a0c] border-2 border-white p-4 space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">TRANSACTION HASH:</span>
            <div className="flex items-center justify-between gap-2 bg-[#141419] p-2 border border-white/30">
              <code className="text-xs font-bold text-[#ccff00] truncate">
                {payload.txHash || '0x4f82a17b09c82415d8a94b772c1092e411fa34c19a8e'}
              </code>
              <button
                onClick={() => handleCopy(payload.txHash || '0x4f82a17b09c82415d8a94b772c1092e411fa34c19a8e')}
                className="p-1 text-slate-300 hover:text-white shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#ccff00]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/20 pt-2">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">BLOCK NUMBER:</span>
              <span className="text-white font-bold">{payload.blockNumber || 19842104}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">STATUS:</span>
              <span className="text-[#00f0ff] font-bold">100% FINALIZED</span>
            </div>
          </div>
        </div>

        <a
          href={`https://etherscan.io/tx/${payload.txHash || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 bg-[#0a0a0c] text-[#00f0ff] font-black text-xs uppercase border-2 border-white hover:bg-white/10 flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000]"
        >
          <span>VERIFY ON BLOCK EXPLORER</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
        </a>
      </div>
    );
  }

  // 3. PAYMENT REQUEST CARD
  if (payload.type === 'request') {
    return (
      <div className="bg-[#141419] border-3 border-white p-5 shadow-[6px_6px_0px_0px_#ff007f] font-mono space-y-4 my-3 text-left">
        <div className="flex items-center justify-between border-b-2 border-white pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#ff007f] stroke-[3]" />
            <span className="font-black text-white text-xs uppercase tracking-wider">MCP PAYMENT REQUEST</span>
          </div>
          <span className="px-2 py-0.5 bg-[#ff007f] text-white font-black text-[9px] uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
            PAYMENT REQUIRED
          </span>
        </div>

        <div className="bg-[#0a0a0c] border-2 border-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase">REQUESTED AMOUNT:</span>
            <div className="text-2xl font-black text-[#ff007f]">
              {payload.amount || '50.00'} {payload.symbol || 'USDC'}
            </div>
            <p className="text-[10px] text-slate-400">
              Recipient: {payload.recipient ? `${payload.recipient.slice(0, 6)}...${payload.recipient.slice(-4)}` : '0x742d...44e'}
            </p>
          </div>

          <div className="w-24 h-24 bg-white p-2 border-2 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#ff007f]">
            {/* Visual QR Container */}
            <div className="w-full h-full border border-black bg-[#0a0a0c] flex items-center justify-center text-[8px] text-[#ccff00] font-black text-center leading-none p-1">
              QR PAY CODE
            </div>
          </div>
        </div>

        <button
          onClick={handleExecuteClick}
          disabled={isExecuting}
          className="w-full py-2.5 bg-[#ff007f] text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#ff3399] cursor-pointer flex items-center justify-center gap-2"
        >
          <Lock className="w-3.5 h-3.5 stroke-[3]" />
          <span>PAY {payload.amount || '50.00'} {payload.symbol || 'USDC'} NOW</span>
        </button>
      </div>
    );
  }

  // 4. SMART CONTRACT & NFT METADATA INSPECTOR CARD
  if (payload.type === 'contract_metadata') {
    const isIpfs = payload.imageUrl?.startsWith('ipfs://');
    const resolvedImage = isIpfs
      ? payload.imageUrl?.replace('ipfs://', 'https://ipfs.io/ipfs/')
      : payload.imageUrl || 'https://iili.io/CgBPBHv.jpg';

    return (
      <div className="bg-[#141419] border-3 border-white p-5 shadow-[6px_6px_0px_0px_#ffe600] font-mono space-y-4 my-3 text-left">
        <div className="flex items-center justify-between border-b-2 border-white pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#ffe600] stroke-[3]" />
            <span className="font-black text-white text-xs uppercase tracking-wider">ON-CHAIN CONTRACT & METADATA INSPECTOR</span>
          </div>
          <span className="px-2 py-0.5 bg-[#ffe600] text-black font-black text-[9px] uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
            {payload.tokenType || 'ERC-20'}
          </span>
        </div>

        <div className="bg-[#0a0a0c] border-2 border-white p-4 flex flex-col sm:flex-row items-start gap-4">
          {/* NFT / Token Image Preview */}
          <div className="w-20 h-20 bg-black border-2 border-white shrink-0 overflow-hidden relative shadow-[3px_3px_0px_0px_#ffe600]">
            <img
              src={resolvedImage}
              alt={payload.name || 'Token Metadata Image'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as any).src = 'https://iili.io/CgBPBHv.jpg';
              }}
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-black text-white uppercase truncate">{payload.name || 'NORTHVEIL TOKEN'}</h4>
              <span className="text-xs font-black text-[#ffe600] bg-[#141419] px-2 py-0.5 border border-white/30">
                ${payload.symbol || 'NV'}
              </span>
            </div>

            <div className="text-[10px] text-slate-300 font-mono space-y-0.5">
              <div className="truncate">
                Address: <code className="text-[#00f0ff]">{payload.contractAddress || '0xdac17f958d2ee523a2206206994597c13d831ec7'}</code>
              </div>
              <div>Decimals: {payload.decimals ?? 18} • Standard: {payload.tokenType || 'ERC-20'}</div>
              <div>Total Supply: {payload.totalSupply || '1,000,000,000'}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(payload.contractAddress || '0xdac17f958d2ee523a2206206994597c13d831ec7')}
            className="flex-1 py-2 bg-[#0a0a0c] text-white font-black text-xs uppercase border-2 border-white hover:bg-white/10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#ccff00]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED ADDRESS' : 'COPY CONTRACT ADDRESS'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. SMART CONTRACT DEPLOYMENT CARD
  if (payload.type === 'contract_deploy') {
    const resolvedImage = payload.imageUrl || 'https://iili.io/CgBPBHv.jpg';
    return (
      <div className="bg-[#141419] border-3 border-white p-5 shadow-[6px_6px_0px_0px_#00f0ff] font-mono space-y-4 my-3 text-left">
        <div className="flex items-center justify-between border-b-2 border-white pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#00f0ff] stroke-[3]" />
            <span className="font-black text-white text-xs uppercase tracking-wider">
              {payload.title || 'SMART CONTRACT DEPLOYMENT'}
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#00f0ff] text-black font-black text-[9px] uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
            {payload.tokenType || 'ERC-20'} ON-CHAIN
          </span>
        </div>

        <div className="bg-[#0a0a0c] border-2 border-white p-4 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-20 h-20 bg-black border-2 border-white shrink-0 overflow-hidden relative shadow-[3px_3px_0px_0px_#00f0ff]">
            <img
              src={resolvedImage}
              alt={payload.name || 'Contract Logo'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as any).src = 'https://iili.io/CgBPBHv.jpg';
              }}
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-black text-white uppercase truncate">{payload.name || 'DEPLOYED TOKEN'}</h4>
              <span className="text-xs font-black text-[#00f0ff] bg-[#141419] px-2 py-0.5 border border-white/30">
                ${payload.symbol || 'NRD'}
              </span>
            </div>

            <div className="text-[10px] text-slate-300 font-mono space-y-0.5">
              <div className="truncate">
                Address: <code className="text-[#ccff00]">{payload.contractAddress || '0x56F0...5417'}</code>
              </div>
              <div>Network: {payload.network || 'Sepolia Testnet'}</div>
              <div>Supply Cap: {payload.totalSupply || '100,000,000'}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(payload.contractAddress || '0x56F0...5417')}
            className="flex-1 py-2 bg-[#0a0a0c] text-white font-black text-xs uppercase border-2 border-white hover:bg-white/10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#ccff00]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED ADDRESS' : 'COPY CONTRACT ADDRESS'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. DEX SWAP ROUTE CARD
  return (
    <div className="bg-[#141419] border-3 border-white p-5 shadow-[6px_6px_0px_0px_#ccff00] font-mono space-y-4 my-3 text-left">
      <div className="flex items-center justify-between border-b-2 border-white pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#ccff00] stroke-[3]" />
          <span className="font-black text-white text-xs uppercase tracking-wider">AI DEX SWAP ROUTE</span>
        </div>
        <span className="px-2 py-0.5 bg-[#ccff00] text-black font-black text-[9px] uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
          1INCH / UNISWAP
        </span>
      </div>

      <div className="bg-[#0a0a0c] border-2 border-white p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-bold">SWAP:</span>
          <span className="font-black text-white">
            {payload.fromAmount || '1.0'} {payload.fromSymbol || 'ETH'} ➔ {payload.toAmount || '3,450.00'} {payload.toSymbol || 'USDC'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-white/20 pt-2">
          <span>SLIPPAGE: 0.5%</span>
          <span className="text-[#ccff00] font-bold">ESTIMATED ROUTE: OPTIMAL</span>
        </div>
      </div>

      <button
        onClick={handleExecuteClick}
        disabled={isExecuting}
        className="w-full py-2.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer flex items-center justify-center gap-2"
      >
        <Zap className="w-3.5 h-3.5 stroke-[3]" />
        <span>CONFIRM DEX SWAP</span>
      </button>
    </div>
  );
};
