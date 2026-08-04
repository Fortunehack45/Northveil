import React, { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { CustomSelect } from './CustomSelect';
import { AccountingMethod, TxType } from '../types';
import {
  FileText,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Layers,
  Gift,
  CheckCircle2,
  Calendar,
  DollarSign,
  Printer,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Transaction } from '../types';

export const HistoryTaxView: React.FC = () => {
  const { transactions, getTaxSummary, exportTaxDataCsv, refreshBalances, activeSubWallet, assets } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TxType | 'all'>('all');
  const [taxYear, setTaxYear] = useState<number>(2026);
  const [accountingMethod, setAccountingMethod] = useState<AccountingMethod>('FIFO');
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const getAssetPriceUsd = (symbol: string): number => {
    const sym = symbol?.toUpperCase() || 'ETH';
    const found = assets?.find(a => a.symbol?.toUpperCase() === sym);
    if (found && found.priceUsd > 0) return found.priceUsd;
    if (sym === 'USDT' || sym === 'USDC' || sym === 'DAI') return 1.0;
    if (sym === 'ETH' || sym === 'WETH') return 3450;
    if (sym === 'BNB') return 580;
    if (sym === 'POL' || sym === 'MATIC') return 0.55;
    if (sym === 'SOL') return 180;
    if (sym === 'BTC' || sym === 'WBTC') return 65000;
    if (sym === 'AVAX') return 30;
    return 10.0;
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const getExplorerUrl = (network: string, hash: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
      case 'eth':
        return `https://etherscan.io/tx/${hash}`;
      case 'base':
        return `https://basescan.org/tx/${hash}`;
      case 'arbitrum':
        return `https://arbiscan.io/tx/${hash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${hash}`;
      case 'bsc':
        return `https://bscscan.com/tx/${hash}`;
      case 'avalanche':
        return `https://snowtrace.io/tx/${hash}`;
      case 'solana':
        return `https://solscan.io/tx/${hash}`;
      case 'bitcoin':
        return `https://mempool.space/tx/${hash}`;
      default:
        return `https://etherscan.io/tx/${hash}`;
    }
  };

  const taxSummary = useMemo(() => {
    return getTaxSummary(taxYear, accountingMethod);
  }, [getTaxSummary, taxYear, accountingMethod]);

  const filteredTxs = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter((tx) => {
      if (!tx) return false;
      const matchesType = selectedType === 'all' || tx.type === selectedType;
      const searchLower = (searchQuery || '').toLowerCase();
      const hashStr = (tx.hash || tx.id || '').toLowerCase();
      const fromAssetStr = (tx.fromAsset || '').toLowerCase();
      const toAssetStr = (tx.toAsset || '').toLowerCase();
      const matchesSearch =
        hashStr.includes(searchLower) ||
        fromAssetStr.includes(searchLower) ||
        toAssetStr.includes(searchLower);
      return matchesType && matchesSearch;
    });
  }, [transactions, selectedType, searchQuery]);

  const getTxIcon = (type: TxType) => {
    switch (type) {
      case 'swap':
        return <ArrowLeftRight className="w-4 h-4 text-emerald-400" />;
      case 'bridge':
        return <ArrowLeftRight className="w-4 h-4 text-indigo-400" />;
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-rose-400" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-cyan-400" />;
      case 'stake':
      case 'unstake':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'claim':
        return <Gift className="w-4 h-4 text-amber-400" />;
      default:
        return <ArrowLeftRight className="w-4 h-4 text-[#ccff00]" />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full font-mono">
      {/* Top Section: Tax Reporting Dashboard Banner */}
      <div className="bg-[#141419] border-4 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#ff007f] text-white text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                IRS FORM 8949 COMPLIANT
              </span>
              <span className="px-2 py-0.5 bg-[#00f0ff] text-black text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                MULTI-CHAIN TAX ENGINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight mt-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#ccff00] stroke-[3]" />
              <span>TAX & ON-CHAIN TRANSACTION HISTORY</span>
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-1 max-w-2xl">
              AUTOMATICALLY DERIVE CAPITAL GAINS, LOSSES, AND COST BASIS ACROSS ETHEREUM, SOLANA, BITCOIN, AND EVM NETWORKS WITH ZERO DATA LEAKS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-4 py-2.5 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#33f3ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 stroke-[3]" />
              <span>GENERATE IRS REPORT</span>
            </button>

            <button
              onClick={() => exportTaxDataCsv(taxYear)}
              className="px-4 py-2.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tax Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141419] border-2 border-white p-4 shadow-[4px_4px_0px_0px_#ccff00] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>REALIZED GAINS</span>
            <DollarSign className="w-4 h-4 text-[#ccff00]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#ccff00] font-mono">
            +${taxSummary.totalCapitalGainsUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">
            {taxYear} TAX YEAR ({accountingMethod})
          </span>
        </div>

        <div className="bg-[#141419] border-2 border-white p-4 shadow-[4px_4px_0px_0px_#ff007f] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>REALIZED LOSSES</span>
            <DollarSign className="w-4 h-4 text-[#ff007f]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#ff007f] font-mono">
            -${taxSummary.totalCapitalLossesUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">DEDUCTIBLE AGAINST INCOME</span>
        </div>

        <div className="bg-[#141419] border-2 border-white p-4 shadow-[4px_4px_0px_0px_#00f0ff] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>NET TAXABLE GAIN</span>
            <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono ${taxSummary.netCapitalGainUsd >= 0 ? 'text-[#ccff00]' : 'text-[#ff007f]'}`}>
            {taxSummary.netCapitalGainUsd >= 0 ? '+' : '-'}${Math.abs(taxSummary.netCapitalGainUsd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">ESTIMATED LIABILITY</span>
        </div>

        <div className="bg-[#141419] border-2 border-white p-4 shadow-[4px_4px_0px_0px_#aa00ff] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>STAKING INCOME</span>
            <Gift className="w-4 h-4 text-[#aa00ff]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            +${taxSummary.stakingRewardsIncomeUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">ORDINARY INCOME TAX</span>
        </div>
      </div>

      {/* Controls & Accounting Settings */}
      <div className="bg-[#141419] border-2 border-white p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ccff00]" />
            <span className="text-xs font-black text-white uppercase">TAX YEAR:</span>
            <CustomSelect
              options={[
                { value: '2026', label: '2026' },
                { value: '2025', label: '2025' },
                { value: '2024', label: '2024' },
              ]}
              value={taxYear.toString()}
              onChange={(val) => setTaxYear(Number(val))}
              variant="yellow"
            />
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-xs font-black text-white uppercase">ACCOUNTING METHOD:</span>
            <CustomSelect
              options={[
                { value: 'FIFO', label: 'FIFO (FIRST IN FIRST OUT)' },
                { value: 'LIFO', label: 'LIFO (LAST IN FIRST OUT)' },
                { value: 'HIFO', label: 'HIFO (HIGHEST IN FIRST OUT)' },
              ]}
              value={accountingMethod}
              onChange={(val) => setAccountingMethod(val as AccountingMethod)}
              variant="yellow"
            />
          </div>
        </div>

        <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#ccff00]" />
          <span>IRS REGULATION 1.1012-1 COMPLIANT</span>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-[#141419] border-2 border-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">TRANSACTION HISTORY LOG</h3>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                placeholder="SEARCH HASH OR TOKEN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0c] text-white font-mono font-bold placeholder-slate-400 border-2 border-white text-xs focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <CustomSelect
              options={[
                { value: 'all', label: 'ALL TYPES' },
                { value: 'swap', label: 'SWAPS' },
                { value: 'bridge', label: 'BRIDGES' },
                { value: 'send', label: 'SENDS' },
                { value: 'receive', label: 'RECEIVES' },
                { value: 'stake', label: 'STAKING' },
                { value: 'claim', label: 'CLAIMS' },
              ]}
              value={selectedType}
              onChange={(val) => setSelectedType(val as any)}
              variant="yellow"
              align="right"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b-2 border-white text-[10px] font-black text-slate-300 uppercase tracking-wider">
                <th className="pb-3">TYPE</th>
                <th className="pb-3">TRANSACTION HASH</th>
                <th className="pb-3">NETWORK</th>
                <th className="pb-3 text-right">AMOUNT</th>
                <th className="pb-3 text-right">DATE (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-white/20 text-xs font-mono">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <button
                      onClick={async () => {
                        setIsSyncing(true);
                        await refreshBalances();
                        setIsSyncing(false);
                      }}
                      className="px-5 py-2.5 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black hover:bg-[#33f3ff] cursor-pointer flex items-center justify-center gap-2 mx-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>SYNC ON-CHAIN DATA</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                  <tr
                    key={tx.id || Math.random().toString()}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-[#1a1a24] cursor-pointer"
                  >
                    <td className="py-3.5">{getTxIcon(tx.type || 'receive')}</td>
                    <td className="py-3.5 text-slate-300">{(tx.hash || '').substring(0, 16)}...</td>
                    <td className="py-3.5 uppercase text-[10px] font-black">{tx.network}</td>
                    <td className="py-3.5 text-right">{tx.fromAmount} {tx.fromAsset}</td>
                    <td className="py-3.5 text-right text-slate-400">{new Date(tx.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Inspector Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#141419] border-4 border-white p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-[10px_10px_0px_0px_#00f0ff] font-mono relative">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 border-2 border-black bg-[#ccff00]">{getTxIcon(selectedTx.type)}</div>
                <div>
                  <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">
                    {selectedTx.type.toUpperCase()} TRANSACTION
                  </h3>
                  <span className="text-[10px] text-[#00f0ff] font-black uppercase">STATUS: COMPLETED</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 px-3 border-2 border-black bg-[#ff007f] text-white font-black hover:bg-[#ff3399]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 bg-[#0a0a0c] p-3 border-2 border-white">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">BLOCKCHAIN NETWORK</span>
                  <span className="text-white font-black uppercase">{selectedTx.network}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">TIMESTAMP (UTC)</span>
                  <span className="text-slate-300 font-bold">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-[#0a0a0c] p-3 border-2 border-white space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">TRANSACTION HASH</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#00f0ff] font-bold break-all text-[11px]">{selectedTx.hash}</span>
                  <button
                    onClick={() => handleCopy(selectedTx.hash, 'hash')}
                    className="p-1.5 bg-[#141419] border border-white text-white hover:bg-[#ccff00] hover:text-black transition-colors cursor-pointer shrink-0"
                    title="Copy Hash"
                  >
                    {copiedField === 'hash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Amounts transferred */}
              <div className="bg-[#0a0a0c] p-3 border-2 border-white space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">ASSET TRANSFER DETAILS</span>
                <div className="flex items-center justify-between text-sm font-black">
                  <span className="text-white">{selectedTx.fromAmount} {selectedTx.fromAsset}</span>
                  {selectedTx.toAsset && (
                    <span className="text-[#00f0ff]">→ {selectedTx.toAmount} {selectedTx.toAsset}</span>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-2 bg-[#0a0a0c] p-3 border-2 border-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">SENDER:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-300 font-bold text-[11px]">{selectedTx.senderAddress}</span>
                    <button
                      onClick={() => handleCopy(selectedTx.senderAddress, 'sender')}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {copiedField === 'sender' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                {selectedTx.recipientAddress && (
                  <div className="flex items-center justify-between border-t border-white/10 pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">RECIPIENT / CONTRACT:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-300 font-bold text-[11px]">{selectedTx.recipientAddress}</span>
                      <button
                        onClick={() => handleCopy(selectedTx.recipientAddress!, 'recipient')}
                        className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {copiedField === 'recipient' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-[#0a0a0c] p-3 border-2 border-white text-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">GAS FEE</span>
                  <span className="text-white font-black">${selectedTx.gasFeeUsd.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">COST BASIS</span>
                  <span className="text-white font-black">${selectedTx.costBasisUsd ? selectedTx.costBasisUsd.toFixed(2) : '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">REALIZED GAIN</span>
                  <span className={`font-black ${selectedTx.realizedGainUsd !== undefined && selectedTx.realizedGainUsd >= 0 ? 'text-[#ccff00]' : 'text-[#ff007f]'}`}>
                    {selectedTx.realizedGainUsd !== undefined ? `${selectedTx.realizedGainUsd >= 0 ? '+' : ''}$${selectedTx.realizedGainUsd.toFixed(2)}` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Block Explorer Action Link */}
            <div className="pt-2">
              <a
                href={getExplorerUrl(selectedTx.network, selectedTx.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] flex items-center justify-center gap-2 cursor-pointer transition-all no-underline"
              >
                <ExternalLink className="w-4 h-4 stroke-[3]" />
                <span>VIEW ON BLOCK EXPLORER ({selectedTx.network.toUpperCase()})</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* PDF Tax Report Preview Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#141419] border-4 border-white p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-[10px_10px_0px_0px_#ccff00]">
            <div className="flex items-center justify-between border-b-2 border-white pb-4">
              <div>
                <h3 className="text-xl font-black text-white font-mono uppercase flex items-center gap-2 tracking-tight">
                  <FileText className="w-5 h-5 text-[#ccff00] stroke-[3]" />
                  CRYPTFAST OFFICIAL TAX SUMMARY REPORT
                </h3>
                <p className="text-xs font-mono text-slate-300">IRS FORM 8949 COMPLIANT OUTPUT</p>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="p-1 px-3 border-2 border-black bg-[#ff007f] text-white font-black hover:bg-[#ff3399]"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0a0a0c] p-6 border-2 border-white font-mono space-y-4 text-xs shadow-[4px_4px_0px_0px_#000]">
              <div className="flex justify-between border-b-2 border-white/20 pb-2 text-slate-300 font-bold">
                <span>TAX YEAR: {taxYear}</span>
                <span>ACCOUNTING METHOD: {accountingMethod}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>TOTAL CAPITAL GAINS:</span>
                  <span className="text-[#ccff00] font-black">+${taxSummary.totalCapitalGainsUsd}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>TOTAL CAPITAL LOSSES:</span>
                  <span className="text-[#ff007f] font-black">-${taxSummary.totalCapitalLossesUsd}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>STAKING INCOME (ORDINARY):</span>
                  <span className="text-[#00f0ff] font-black">+${taxSummary.stakingRewardsIncomeUsd}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>TOTAL NETWORK GAS FEES PAID:</span>
                  <span className="text-slate-400">${taxSummary.totalGasFeesPaidUsd}</span>
                </div>
                <div className="flex justify-between border-t-2 border-white/20 pt-2 text-sm font-black text-white">
                  <span>NET TAXABLE GAIN/LOSS:</span>
                  <span className="text-[#ccff00]">${taxSummary.netTaxableIncomeUsd} USD</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 bg-[#ccff00] text-black font-mono font-black border-2 border-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              >
                PRINT / SAVE PDF DOCUMENT
              </button>
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-5 py-2.5 bg-[#ff007f] text-white font-mono font-black border-2 border-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
