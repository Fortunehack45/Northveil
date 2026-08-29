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
  Fingerprint,
} from 'lucide-react';
import { McpApprovalRecord } from '../types';
import { SupabaseService } from '../services/SupabaseService';
import { MpcWalletService } from '../services/MpcWalletService';
import { WebAuthnService } from '../services/WebAuthnService';
import { ProviderService } from '../services/ProviderService';
import { WalletService } from '../services/WalletService';
import { formatShortAddress } from '../services/addressUtils';
import { ethers } from 'ethers';

export const ApprovalsView: React.FC = () => {
  const { activeSubWallet, seedPhrase, getDecryptedPrivateKey } = useWallet();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const [passkeyNotice, setPasskeyNotice] = useState<string | null>(null);
  const [confirmedTxFeedback, setConfirmedTxFeedback] = useState<{ id: string; txHash: string; explorerUrl?: string } | null>(null);

  const [approvals, setApprovals] = useState<McpApprovalRecord[]>([]);
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  const fetchLogs = async () => {
    try {
      // Fetch from Supabase and in-memory pending approvals endpoint
      const [liveApprovals, stagedPending] = await Promise.all([
        SupabaseService.fetchApprovalsForWallet(activeSubWallet?.address).catch(() => []),
        MpcWalletService.getPendingApprovals().catch(() => []),
      ]);

      const mergedMap = new Map<string, McpApprovalRecord>();
      (liveApprovals || []).forEach((item) => mergedMap.set(item.id, item));

      // Merge any pending staged requests from MCP control plane
      (stagedPending || []).forEach((req: any) => {
        const id = req.requestId || req.id || req.request_id || req.approvalToken || req.approval_token;
        if (id) {
          mergedMap.set(id, {
            id,
            wallet_address: req.walletAddress || req.wallet_address || activeSubWallet?.address || '',
            tool_name: req.operationType ? `northveil_prepare_${req.operationType.toLowerCase()}` : (req.action ? `northveil_prepare_${req.action.toLowerCase()}` : 'token_transfer'),
            parameters: {
              recipient: req.recipient || req.to,
              amount: req.amount,
              asset: req.asset || req.symbol || 'ETH',
              network: req.network || req.chain || 'sepolia',
              reason: req.reason || req.contract_summary || 'Transfer requested via MCP Agent',
            },
            status: req.status === 'confirmed' || req.status === 'broadcasted' ? 'CONFIRMED' : req.status === 'rejected' ? 'REJECTED' : 'PENDING',
            created_at: req.createdAt || req.created_at || new Date().toISOString(),
            tx_hash: req.txHash || req.tx_hash,
            gas_fee_usd: 0.05,
            agent_type: 'Northveil MCP Agent',
          });
        }
      });

      setApprovals(Array.from(mergedMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e) {
      console.warn('[Approvals Fetch Error]:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
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
    setPasskeyNotice('Preparing transaction signature...');
    try {
      // 1. Fetch approval details and preparation
      const prepResult = await MpcWalletService.approveTransactionRequestWithPasskey(id);
      
      let txHash = prepResult.txHash;
      let explorerUrl = prepResult.explorerUrl;

      // 2. If signature required on client device
      if (!txHash) {
        setPasskeyNotice('Prompting device biometric signature (Touch ID / Face ID / Windows Hello)...');
        let passkeyAssertion: any = null;
        if (WebAuthnService.isSupported()) {
          const authRes = await WebAuthnService.authenticate(activeSubWallet?.address);
          if (authRes.success && authRes.assertion) {
            passkeyAssertion = authRes.assertion;
          } else if (!authRes.success && authRes.error?.includes('cancelled')) {
            setPasskeyNotice('Biometric signature prompt was cancelled.');
            setActionProcessingId(null);
            return;
          }
        }

        // Look up staged request parameters from local state or server response
        const currentRecord = approvals.find((a) => a.id === id);
        const targetNetwork = prepResult.network || currentRecord?.parameters?.network || 'sepolia';
        const targetRecipient = prepResult.recipient || currentRecord?.parameters?.recipient;
        const targetAmount = prepResult.amount || currentRecord?.parameters?.amount;

        // Check if local private key is available
        let privateKey = activeSubWallet?.privateKey;
        if (!privateKey && activeSubWallet?.id) {
          privateKey = (await getDecryptedPrivateKey(activeSubWallet.id)) || undefined;
        }
        if (!privateKey && seedPhrase && seedPhrase.length > 0) {
          if (seedPhrase.length === 1) {
            privateKey = seedPhrase[0];
          } else if (seedPhrase.length >= 12) {
            const derived = WalletService.deriveEVMAddress(seedPhrase, activeSubWallet?.accountIndex || 0);
            privateKey = derived.privateKey;
          }
        }

        if (privateKey && targetRecipient) {
          setPasskeyNotice('Cryptographically signing transaction on user device...');
          const cleanPk = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
          const provider = ProviderService.getEVMProvider(targetNetwork);
          const signer = new ethers.Wallet(cleanPk, provider);

          const cleanAmount = typeof targetAmount === 'number'
            ? targetAmount
            : parseFloat(String(targetAmount || '0').replace(/[^0-9.]/g, '')) || 0;

          let unsignedTx: any = prepResult.unsignedTransaction;
          if (!unsignedTx) {
            unsignedTx = {
              to: targetRecipient,
              value: cleanAmount > 0 ? ethers.parseEther(cleanAmount.toString()) : 0n,
              data: prepResult.calldata || '0x',
            };
          } else {
            if (typeof unsignedTx.value === 'string' && !unsignedTx.value.startsWith('0x')) {
              unsignedTx.value = BigInt(unsignedTx.value);
            }
          }

          const feeData = await provider.getFeeData().catch(() => null);
          const populated = await signer.populateTransaction({
            ...unsignedTx,
            maxFeePerGas: feeData?.maxFeePerGas || undefined,
            maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas || undefined,
          });

          const signedSerialized = await signer.signTransaction(populated);

          setPasskeyNotice('Broadcasting signed transaction to network...');
          const broadcastRes = await MpcWalletService.broadcastTransaction({
            approvalToken: id,
            requestId: id,
            signedTransaction: signedSerialized,
            passkeyAssertion,
          });

          txHash = broadcastRes.txHash || broadcastRes.tx_hash;
          explorerUrl = broadcastRes.explorerUrl || broadcastRes.explorer_url;
        } else {
          // Fallback to passkey execution route
          const execRes = await MpcWalletService.approveTransactionRequestWithPasskey(id, passkeyAssertion);
          txHash = execRes.txHash;
          explorerUrl = execRes.explorerUrl;
        }
      }

      // 3. Update Supabase record
      await SupabaseService.updateApprovalStatus(id, 'approved', txHash);

      if (txHash) {
        setConfirmedTxFeedback({
          id,
          txHash,
          explorerUrl: explorerUrl || `https://sepolia.etherscan.io/tx/${txHash}`,
        });
        setPasskeyNotice(`Transaction confirmed on-chain! Tx: ${txHash.slice(0, 10)}...`);
      } else {
        setPasskeyNotice('Transaction approved successfully.');
      }

      await fetchLogs();
    } catch (e: any) {
      console.error('Approval failed:', e);
      setPasskeyNotice(`Approval error: ${e.message || 'Execution failed'}`);
    } finally {
      setActionProcessingId(null);
      setTimeout(() => setPasskeyNotice(null), 4000);
    }
  };

  const handleReject = async (id: string) => {
    setActionProcessingId(id);
    try {
      await MpcWalletService.rejectTransactionRequest(id).catch(() => {});
      await SupabaseService.updateApprovalStatus(id, 'rejected');
      setPasskeyNotice('Approval token burned and voided immediately.');
      await fetchLogs();
    } catch (e) {
      console.error('Rejection failed:', e);
    } finally {
      setActionProcessingId(null);
      setTimeout(() => setPasskeyNotice(null), 3000);
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

  return (
    <div className="space-y-6 sm:space-y-8 mono-animate-in">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-mono font-medium flex items-center gap-1.5 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5" />
              ON-CHAIN AUDIT
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">
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
            className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-85 active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isCreatingTest ? 'Submitting...' : '+ Test Request'}</span>
          </button>
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            title="Refresh Logs from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-zinc-900 dark:text-white' : ''}`} />
          </button>
          <span className="px-3 py-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-medium whitespace-nowrap">
            {approvals.filter((a) => a.status === 'CONFIRMED').length} Confirmed
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">
            {approvals.filter((a) => a.status === 'PENDING').length} Pending
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEARCH BAR & STATUS TABS (Seamless) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="mono-segmented-container flex flex-wrap">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'REJECTED', label: 'Failed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Biometric Passkey Action Notification */}
      {passkeyNotice && (
        <div className="p-4 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] text-xs font-mono text-zinc-900 dark:text-white flex items-center justify-between gap-3 shadow-sm mono-animate-in">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{passkeyNotice}</span>
          </div>
          {confirmedTxFeedback && (
            <a
              href={confirmedTxFeedback.explorerUrl || `https://sepolia.etherscan.io/tx/${confirmedTxFeedback.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-[11px] flex items-center gap-1 hover:opacity-85"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

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

                {/* Pending Actions (Approve via Passkey / Reject) */}
                {isPending && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={actionProcessingId === item.id}
                      className="flex-1 sm:flex-none justify-center px-5 py-3 sm:py-2.5 rounded-2xl sm:rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-85 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Fingerprint className="w-4 h-4 stroke-[2]" />
                      <span>{actionProcessingId === item.id ? 'Authorizing Passkey...' : 'Approve with Passkey'}</span>
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={actionProcessingId === item.id}
                      className="flex-1 sm:flex-none justify-center px-4 py-3 sm:py-2.5 rounded-2xl sm:rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-red-500/10 hover:text-red-500 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Reject</span>
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
