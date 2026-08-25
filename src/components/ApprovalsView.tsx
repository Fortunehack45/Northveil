import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Search,
  Copy,
  Check,
  Code2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { McpApprovalRecord } from '../types';
import { SupabaseService } from '../services/SupabaseService';

export const ApprovalsView: React.FC = () => {
  const { activeSubWallet } = useWallet();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);

  const [approvals, setApprovals] = useState<McpApprovalRecord[]>([]);

  const [isCreatingTest, setIsCreatingTest] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const liveApprovals = await SupabaseService.fetchApprovalsForWallet(activeSubWallet?.address);
      setApprovals(liveApprovals || []);
    } catch (e) {
      console.warn('[Approvals Fetch Error]:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeSubWallet?.address]);

  const handleCreateTestRequest = async () => {
    if (!activeSubWallet?.address) return;
    setIsCreatingTest(true);
    try {
      await SupabaseService.createPendingApprovalRequest(activeSubWallet.address, 'token_transfer');
      await fetchLogs();
    } catch (e) {
      console.error('Failed to create test request:', e);
    } finally {
      setIsCreatingTest(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionProcessingId(id);
    try {
      await SupabaseService.updateApprovalStatus(id, 'approved');
      await fetchLogs();
    } catch (e) {
      console.error('Approval failed:', e);
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionProcessingId(id);
    try {
      await SupabaseService.updateApprovalStatus(id, 'rejected');
      await fetchLogs();
    } catch (e) {
      console.error('Rejection failed:', e);
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredApprovals = approvals.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTool = item.tool_name.toLowerCase().includes(q);
      const matchHash = (item.tx_hash || '').toLowerCase().includes(q);
      const matchAgent = (item.agent_type || '').toLowerCase().includes(q);
      return matchTool || matchHash || matchAgent;
    }
    return true;
  });

  const formatShortAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 mono-animate-in">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-mono font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              LIVE SUPABASE ON-CHAIN AUDIT
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              {approvals.length} Live Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
            Action Approvals
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time audit history of tool executions, smart contract calls, and pending MCP agent authorization requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={handleCreateTestRequest}
            disabled={isCreatingTest}
            className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-85 active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isCreatingTest ? 'Submitting...' : '+ New Test Request'}</span>
          </button>
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            title="Refresh Logs from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-zinc-900 dark:text-white' : ''}`} />
          </button>
          <span className="px-3 py-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-medium">
            {approvals.filter((a) => a.status === 'CONFIRMED').length} Confirmed
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
            {approvals.filter((a) => a.status === 'PENDING').length} Pending
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEARCH BAR & STATUS TABS (Seamless) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="mono-segmented-container">
          {[
            { id: 'ALL', label: 'All History' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'REJECTED', label: 'Failed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by tool or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#131317] hover:bg-zinc-50 dark:hover:bg-[#18181d] border border-black/[0.08] dark:border-transparent rounded-full pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* APPROVALS LIST (Seamless) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {filteredApprovals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] space-y-3 shadow-sm">
          <ShieldCheck className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">No Records Found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No transactions match your search filter.'
              : 'Actions triggered by connected AI agents will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredApprovals.map((item) => {
            const isConfirmed = item.status === 'CONFIRMED';
            const isPending = item.status === 'PENDING';

            return (
              <div
                key={item.id}
                className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0f0f12] hover:bg-zinc-50 dark:hover:bg-[#141418] border border-black/[0.06] dark:border-white/[0.06] transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                      <Code2 className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">
                          {item.tool_name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300">
                          {item.agent_type || 'MCP AI Agent'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-center text-xs font-mono font-medium px-3 py-0.5 rounded-full flex items-center gap-1.5 ${
                      isConfirmed
                        ? 'bg-black/[0.06] dark:bg-white/[0.1] text-zinc-900 dark:text-white'
                        : isPending
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isConfirmed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                    ) : isPending ? (
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    {item.status}
                  </span>
                </div>

                <div className="p-3.5 bg-black/[0.03] dark:bg-black/40 rounded-2xl space-y-1.5 font-mono text-xs">
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">
                    Execution Parameters
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {Object.entries(item.parameters).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-xl bg-white dark:bg-black/50 border border-black/[0.04] dark:border-transparent">
                        <span className="block text-[10px] text-zinc-500">{k}:</span>
                        <span className="text-zinc-900 dark:text-zinc-200 font-medium break-all text-xs">
                          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Actions (Approve / Reject) */}
                {isPending && (
                  <div className="flex items-center gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={actionProcessingId === item.id}
                      className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-85 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {actionProcessingId === item.id ? 'Approving...' : 'Approve & Execute'}
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={actionProcessingId === item.id}
                      className="px-4 py-2 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-red-500/10 hover:text-red-500 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono pt-1">
                  {item.tx_hash ? (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">Tx:</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${item.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-900 dark:text-white underline font-medium flex items-center gap-1"
                      >
                        {formatShortAddress(item.tx_hash)} <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => handleCopy(item.tx_hash!, item.id)}
                        className="p-1 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                        title="Copy Hash"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-zinc-500">Database Record</span>
                  )}

                  {item.gas_fee_usd !== undefined && (
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Fee: <span className="text-zinc-900 dark:text-white font-medium">${item.gas_fee_usd.toFixed(2)} USD</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
