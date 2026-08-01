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
} from 'lucide-react';

export const HistoryTaxView: React.FC = () => {
  const { transactions, getTaxSummary, exportTaxDataCsv } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TxType | 'all'>('all');
  const [taxYear, setTaxYear] = useState<number>(2026);
  const [accountingMethod, setAccountingMethod] = useState<AccountingMethod>('FIFO');
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  const taxSummary = useMemo(() => {
    return getTaxSummary(taxYear, accountingMethod);
  }, [getTaxSummary, taxYear, accountingMethod]);

  const filteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = selectedType === 'all' || tx.type === selectedType;
      const matchesSearch =
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.fromAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.toAsset && tx.toAsset.toLowerCase().includes(searchQuery.toLowerCase()));
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
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'claim':
        return <Gift className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full">
      {/* Top Section: Tax Reporting Dashboard */}
      <div className="bg-[#141419] border-2 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#00f0ff]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6 border-b-2 border-white pb-6">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#00f0ff] stroke-[3]" />
              <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
                TRANSACTION LOG & TAX REPORTING
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-1 max-w-xl">
              AUDIT-READY CRYPTO TRANSACTION LOGS WITH AUTOMATIC COST BASIS MATCHING AND IRS FORM 8949 COMPLIANCE EXPORT.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => exportTaxDataCsv(taxYear, accountingMethod)}
              className="px-4 py-2.5 bg-[#ffe600] text-black border-2 border-black font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] hover:bg-[#fff066] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>EXPORT TAX CSV</span>
            </button>
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-5 py-2.5 bg-[#ccff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 stroke-[3]" />
              <span>GENERATE TAX PDF</span>
            </button>
          </div>
        </div>

        {/* Tax Settings Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#0a0a0c] border-2 border-white mb-6 shadow-[4px_4px_0px_0px_#000] items-start">
          <div className="flex flex-col justify-start">
            <label className="h-5 flex items-center text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider">TAX YEAR</label>
            <CustomSelect
              options={[
                { value: '2026', label: '2026 (CURRENT TAX YEAR)' },
                { value: '2025', label: '2025 TAX YEAR' },
                { value: '2024', label: '2024 TAX YEAR' },
              ]}
              value={taxYear.toString()}
              onChange={(val) => setTaxYear(parseInt(val))}
              variant="yellow"
              className="w-full mt-1"
            />
          </div>

          <div className="flex flex-col justify-start">
            <label className="h-5 flex items-center gap-1 text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider">
              <span>ACCOUNTING METHOD</span>
              <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" title="FIFO = First-In First-Out, HIFO = Highest-In First-Out" />
            </label>
            <CustomSelect
              options={[
                { value: 'FIFO', label: 'FIFO (FIRST-IN, FIRST-OUT)' },
                { value: 'LIFO', label: 'LIFO (LAST-IN, FIRST-OUT)' },
                { value: 'HIFO', label: 'HIFO (HIGHEST-IN, FIRST-OUT)' },
              ]}
              value={accountingMethod}
              onChange={(val) => setAccountingMethod(val as AccountingMethod)}
              variant="cyan"
              className="w-full mt-1"
            />
          </div>

          <div className="flex flex-col justify-start">
            <label className="h-5 flex items-center text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider">CAPITAL GAINS</label>
            <div className="text-lg font-mono font-black text-[#ccff00] mt-1 flex items-center h-[32px]">
              +${taxSummary.totalCapitalGainsUsd.toLocaleString()} USD
            </div>
          </div>

          <div className="flex flex-col justify-start">
            <label className="h-5 flex items-center text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider">NET TAXABLE INCOME</label>
            <div className="text-lg font-mono font-black text-[#ff007f] mt-1 flex items-center h-[32px]">
              ${taxSummary.netTaxableIncomeUsd.toLocaleString()} USD
            </div>
          </div>
        </div>
      </div>

      {/* Transactions History Log Table */}
      <div className="bg-[#141419] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#ff007f] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b-2 border-white pb-3">
          <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">TRANSACTION HISTORY LOG</h3>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                placeholder="SEARCH HASH OR TOKEN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0c] text-white font-mono font-bold placeholder-slate-400 border-2 border-white text-xs focus:outline-none focus:bg-[#181820]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Type Filter */}
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

        {/* Transactions Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b-2 border-white text-[10px] font-black text-slate-300 uppercase tracking-wider">
                <th className="pb-3">TYPE</th>
                <th className="pb-3">TRANSACTION HASH</th>
                <th className="pb-3">NETWORK</th>
                <th className="pb-3 text-right">AMOUNT</th>
                <th className="pb-3 text-right">GAS PAID</th>
                <th className="pb-3 text-right">REALIZED GAIN</th>
                <th className="pb-3 text-right pr-2">DATE (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-white/20 text-xs font-mono">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono font-bold uppercase">
                    NO TRANSACTIONS RECORDED MATCHING FILTERS.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#1a1a24] transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2 font-mono font-black text-white">
                        <div className="p-1.5 border border-white bg-[#0a0a0c]">{getTxIcon(tx.type)}</div>
                        <span className="uppercase">{tx.type}</span>
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-300 font-mono">{tx.hash}</td>

                    <td className="py-3.5 font-mono">
                      <span className="px-2 py-0.5 border border-black text-[10px] font-black uppercase bg-[#ccff00] text-black shadow-[1px_1px_0px_0px_#000]">
                        {tx.network}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-black text-white">
                      {tx.fromAmount} {tx.fromAsset}{' '}
                      {tx.toAmount && <span className="text-[#00f0ff]">→ {tx.toAmount} {tx.toAsset}</span>}
                    </td>

                    <td className="py-3.5 text-right text-slate-300">${tx.gasFeeUsd.toFixed(2)}</td>

                    <td className="py-3.5 text-right font-black">
                      {tx.realizedGainUsd !== undefined ? (
                        <span className={tx.realizedGainUsd >= 0 ? 'text-[#ccff00]' : 'text-[#ff007f]'}>
                          {tx.realizedGainUsd >= 0 ? '+' : ''}${tx.realizedGainUsd.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    <td className="py-3.5 text-right text-slate-300 font-mono text-xs pr-2">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
