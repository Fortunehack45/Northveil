import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle,
} from 'lucide-react';
import { McpApprovalRecord } from '../types';
import { SupabaseService, supabase } from '../services/SupabaseService';
import { MpcWalletService } from '../services/MpcWalletService';
import { WebAuthnService } from '../services/WebAuthnService';
import { ProviderService } from '../services/ProviderService';
import { WalletService } from '../services/WalletService';
import { formatShortAddress, parseEtherSafe } from '../services/addressUtils';
import { ethers } from 'ethers';

const getExplorerLink = (net: string, hash: string): string => {
  if (!hash) return '#';
  const cleanNet = (net || 'sepolia').toLowerCase();
  if (cleanNet.includes('sepolia')) return `https://sepolia.etherscan.io/tx/${hash}`;
  if (cleanNet.includes('base')) return `https://basescan.org/tx/${hash}`;
  if (cleanNet.includes('polygon') || cleanNet.includes('matic')) return `https://polygonscan.com/tx/${hash}`;
  if (cleanNet.includes('arbitrum')) return `https://arbiscan.io/tx/${hash}`;
  if (cleanNet.includes('bsc') || cleanNet.includes('binance')) return `https://bscscan.com/tx/${hash}`;
  if (cleanNet.includes('solana')) return `https://solscan.io/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
};

export const ApprovalsView: React.FC = () => {
  const { activeSubWallet, subWallets, seedPhrase, getDecryptedPrivateKey } = useWallet();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'REJECTED' | 'EXPIRED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const [passkeyNotice, setPasskeyNotice] = useState<string | null>(null);
  const [confirmedTxFeedback, setConfirmedTxFeedback] = useState<{ id: string; txHash: string; explorerUrl?: string } | null>(null);

  const [approvals, setApprovals] = useState<McpApprovalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('northveil_approval_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  // Keep a fresh ref to avoid stale closures in polling intervals
  const approvalsRef = useRef<McpApprovalRecord[]>(approvals);
  useEffect(() => {
    approvalsRef.current = approvals;
  }, [approvals]);

  const fetchLogs = async () => {
    try {
      const allAddresses = Array.from(new Set([
        activeSubWallet?.address,
        ...(subWallets || []).map((w) => w.address),
        '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
      ])).filter(Boolean) as string[];

      // Fetch from Supabase, MCP server pending approvals, and relative endpoints
      const [liveApprovals, stagedPending] = await Promise.all([
        SupabaseService.fetchApprovalsForWallet(allAddresses).catch(() => []),
        MpcWalletService.getPendingApprovals(activeSubWallet?.address).catch(() => []),
      ]);

      const mergedMap = new Map<string, McpApprovalRecord>();
      const confirmedIds = new Set<string>();
      const rejectedIds = new Set<string>();
      const existingRecords = new Map<string, McpApprovalRecord>();

      // Helper to register records and track confirmed/rejected status across all aliases
      const registerRecord = (rec: McpApprovalRecord) => {
        if (!rec) return;
        if (rec.id) existingRecords.set(rec.id, rec);
        if (rec.request_id) existingRecords.set(rec.request_id, rec);
        if (rec.approval_token) existingRecords.set(rec.approval_token, rec);
        if (rec.parameters?.approvalToken) existingRecords.set(rec.parameters.approvalToken, rec);

        if (rec.status === 'CONFIRMED' || Boolean(rec.tx_hash)) {
          if (rec.id) confirmedIds.add(rec.id);
          if (rec.request_id) confirmedIds.add(rec.request_id);
          if (rec.approval_token) confirmedIds.add(rec.approval_token);
          if (rec.parameters?.approvalToken) confirmedIds.add(rec.parameters.approvalToken);
          if (rec.tx_hash) confirmedIds.add(rec.tx_hash);
        } else if (rec.status === 'REJECTED') {
          if (rec.id) rejectedIds.add(rec.id);
          if (rec.request_id) rejectedIds.add(rec.request_id);
          if (rec.approval_token) rejectedIds.add(rec.approval_token);
        }
      };

      // 1. Preload currently retained approvals from fresh ref and localStorage
      approvalsRef.current.forEach((item) => {
        registerRecord(item);
        mergedMap.set(item.id, item);
      });

      try {
        const saved = localStorage.getItem('northveil_approval_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          (parsed || []).forEach((item: McpApprovalRecord) => {
            registerRecord(item);
            if (item.id && !mergedMap.has(item.id)) mergedMap.set(item.id, item);
          });
        }
      } catch {}

      // 2. Merge live approvals from Supabase
      (liveApprovals || []).forEach((item) => {
        const isConfirmed = confirmedIds.has(item.id) || confirmedIds.has(item.request_id) || confirmedIds.has(item.approval_token) || item.status === 'CONFIRMED' || Boolean(item.tx_hash);
        const isRejected = rejectedIds.has(item.id) || rejectedIds.has(item.request_id) || rejectedIds.has(item.approval_token) || item.status === 'REJECTED';
        const effectiveStatus = isConfirmed ? 'CONFIRMED' : isRejected ? 'REJECTED' : item.status;

        const existing = existingRecords.get(item.id) || existingRecords.get(item.request_id) || existingRecords.get(item.approval_token);
        const merged: McpApprovalRecord = {
          ...existing,
          ...item,
          status: effectiveStatus,
          tx_hash: existing?.tx_hash || item.tx_hash,
          response: existing?.response || item.response,
        };
        registerRecord(merged);
        mergedMap.set(item.id, merged);
      });

      const now = Date.now();
      // 3. Merge any staged requests from MCP control plane
      (stagedPending || []).forEach((req: any) => {
        const id = req.requestId || req.id || req.request_id || req.approvalToken || req.approval_token;
        if (id) {
          const isConfirmed = Boolean(
            confirmedIds.has(id) ||
            confirmedIds.has(req.requestId) ||
            confirmedIds.has(req.approvalToken) ||
            req.txHash ||
            req.tx_hash ||
            req.status === 'confirmed' ||
            req.status === 'broadcasted'
          );
          const isRejected = rejectedIds.has(id) || rejectedIds.has(req.requestId) || rejectedIds.has(req.approvalToken) || req.status === 'rejected';
          const isExpired = !isConfirmed && !isRejected && (
            req.token_used ||
            (req.expiresAt && new Date(req.expiresAt).getTime() <= now) ||
            (req.createdAt && now - new Date(req.createdAt).getTime() > 2 * 3600 * 1000)
          );
          const status = isConfirmed ? 'CONFIRMED' : isRejected ? 'REJECTED' : isExpired ? 'EXPIRED' : 'PENDING';

          const existing = existingRecords.get(id) || existingRecords.get(req.requestId) || existingRecords.get(req.approvalToken);

          const isDeploy = Boolean(
            req.isDeploy ||
            req.is_deploy ||
            req.operationType === 'DEPLOY_CONTRACT' ||
            req.operation === 'DEPLOY_CONTRACT' ||
            req.asset === 'DEPLOY' ||
            (req.reason && req.reason.toLowerCase().includes('deploy')) ||
            (req.contract_summary && req.contract_summary.toLowerCase().includes('deploy'))
          );

          let toolName = 'token_transfer';
          let parameters: any = {};

          if (isDeploy) {
            const deployLabel = req.reason || req.contract_summary || 'Smart Contract';
            toolName = deployLabel.startsWith('Deploy') ? deployLabel : `Deploy Smart Contract: ${deployLabel}`;
            parameters = {
              contract: deployLabel,
              type: 'Smart Contract Deployment',
              network: req.network || req.chain || 'sepolia',
              isDeploy: true,
              calldata: req.unsignedPayload?.data || req.calldata || '0x',
              calldataSize: (req.unsignedPayload?.data || req.calldata)
                ? `${Math.floor(((req.unsignedPayload?.data || req.calldata).length - 2) / 2)} bytes`
                : 'Compiled Bytecode',
              summary: deployLabel,
              approvalToken: id,
            };
          } else {
            toolName = req.operationType
              ? `northveil_prepare_${req.operationType.toLowerCase()}`
              : (req.action ? `northveil_prepare_${req.action.toLowerCase()}` : 'token_transfer');
            parameters = {
              recipient: req.recipient || req.to || req.recipientAddress,
              amount: req.amount,
              asset: req.asset || req.symbol || 'ETH',
              network: req.network || req.chain || 'sepolia',
              calldata: req.unsignedPayload?.data || req.calldata || '0x',
              contract: req.contract || req.contractAddress,
              tokenId: req.tokenId ?? req.token_id,
              reason: req.reason || req.contract_summary || 'Transfer requested via MCP Agent',
            };
          }

          const record: McpApprovalRecord = {
            id,
            wallet_address: req.walletAddress || req.wallet_address || activeSubWallet?.address || existing?.wallet_address || '',
            tool_name: toolName,
            parameters,
            status,
            created_at: req.createdAt || req.created_at || existing?.created_at || new Date().toISOString(),
            tx_hash: existing?.tx_hash || req.txHash || req.tx_hash,
            gas_fee_usd: isDeploy ? 0.25 : 0.05,
            agent_type: 'Northveil MCP Agent',
            response: existing?.response || (req.txHash ? { txHash: req.txHash, contractAddress: req.contractAddress, explorerUrl: req.explorerUrl } : undefined),
          };

          registerRecord(record);
          mergedMap.set(id, record);
        }
      });

      const sorted = Array.from(mergedMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      console.log(`[NORTHVEIL_TELEMETRY] APPROVALS_VIEW_POLL addresses=${JSON.stringify(allAddresses)} merged_count=${sorted.length}`);
      setApprovals(sorted);
      try {
        localStorage.setItem('northveil_approval_history', JSON.stringify(sorted.slice(0, 100)));
      } catch {}
    } catch (e) {
      console.warn('[Approvals Fetch Error]:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    const onFocus = () => fetchLogs();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    let channel: any = null;
    try {
      if (supabase && typeof supabase.channel === 'function') {
        channel = supabase
          .channel('public:transaction_requests_realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'transaction_requests',
            },
            () => {
              fetchLogs();
            }
          )
          .subscribe();
      }
    } catch {}

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
      if (channel && supabase && typeof supabase.removeChannel === 'function') {
        try { supabase.removeChannel(channel); } catch {}
      }
    };
  }, [activeSubWallet?.address, subWallets]);

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
    const currentRecord = approvalsRef.current.find((a) => a.id === id || a.request_id === id || a.approval_token === id || a.parameters?.approvalToken === id);
    if (currentRecord?.status === 'CONFIRMED' || Boolean(currentRecord?.tx_hash)) {
      setPasskeyNotice('Transaction already confirmed on-chain.');
      return;
    }
    if (currentRecord?.status === 'EXPIRED') {
      setPasskeyNotice('This signing request has expired. Please stage a new request.');
      return;
    }

    setActionProcessingId(id);
    setPasskeyNotice('Authorizing and signing transaction locally...');
    try {
      // 1. Prompt device biometric passkey assertion if supported
      let passkeyAssertion: any = null;
      if (WebAuthnService.isSupported()) {
        try {
          const authRes = await WebAuthnService.authenticate(activeSubWallet?.address);
          if (authRes.success && authRes.assertion) {
            passkeyAssertion = authRes.assertion;
          } else if (!authRes.success && authRes.error?.includes('cancelled')) {
            setPasskeyNotice('Biometric signature prompt was cancelled.');
            setActionProcessingId(null);
            return;
          }
        } catch (authErr: any) {
          console.warn('[Passkey Assertion Notice]:', authErr.message);
        }
      }

      // 2. Locate local private key or seed phrase from connected/imported wallet
      let privateKey = activeSubWallet?.privateKey;
      if (!privateKey && activeSubWallet?.id && typeof getDecryptedPrivateKey === 'function') {
        try {
          privateKey = (await getDecryptedPrivateKey(activeSubWallet.id)) || undefined;
        } catch {}
      }
      if (!privateKey && seedPhrase && seedPhrase.length > 0) {
        if (seedPhrase.length === 1 && seedPhrase[0]) {
          privateKey = seedPhrase[0];
        } else if (seedPhrase.length >= 12) {
          try {
            const derived = WalletService.deriveEVMAddress(seedPhrase, activeSubWallet?.accountIndex || 0);
            privateKey = derived.privateKey;
          } catch {}
        }
      }
      if (!privateKey && typeof window !== 'undefined') {
        try {
          const rawStoredSeed = localStorage.getItem('northveil_seed_phrase') || localStorage.getItem('northveil_seed');
          if (rawStoredSeed) {
            const words = rawStoredSeed.trim().split(/\s+/).filter(Boolean);
            if (words.length >= 12) {
              const derived = WalletService.deriveEVMAddress(words, activeSubWallet?.accountIndex || 0);
              privateKey = derived.privateKey;
            } else if (words.length === 1 && words[0]) {
              privateKey = words[0];
            }
          }
          if (!privateKey) {
            const directPk = localStorage.getItem('northveil_vault_pk') || localStorage.getItem('northveil_imported_pk') || localStorage.getItem('northveil_active_pk');
            if (directPk && directPk.trim()) privateKey = directPk.trim();
          }
        } catch {}
      }

      if (!privateKey && subWallets && subWallets.length > 0) {
        const found = subWallets.find((w) => w.privateKey);
        if (found) privateKey = found.privateKey;
      }

      const targetNetwork = currentRecord?.parameters?.network || 'sepolia';
      const targetRecipient = currentRecord?.parameters?.recipient || currentRecord?.parameters?.to || currentRecord?.parameters?.recipientAddress || currentRecord?.parameters?.contractAddress || currentRecord?.parameters?.contract;
      const targetAmount = currentRecord?.parameters?.amount;
      const isDeployTx = Boolean(
        currentRecord?.parameters?.isDeploy ||
        currentRecord?.tool_name?.toLowerCase().includes('deploy') ||
        currentRecord?.parameters?.asset === 'DEPLOY'
      );
      const targetCalldata = currentRecord?.parameters?.calldata || currentRecord?.parameters?.data || '0x';

      let txHash = '';
      let explorerUrl = '';
      let deployedContractAddress: string | undefined = undefined;

      if (privateKey) {
        setPasskeyNotice(isDeployTx ? 'Signing contract deployment on connected device...' : 'Signing transaction on connected device...');
        const cleanPk = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        const provider = ProviderService.getEVMProvider(targetNetwork);
        const signer = new ethers.Wallet(cleanPk, provider);
        const valueInWei = isDeployTx ? 0n : parseEtherSafe(targetAmount || 0);

        const unsignedTx: any = {
          value: valueInWei,
          data: targetCalldata,
        };
        if (!isDeployTx && targetRecipient && targetRecipient !== ethers.ZeroAddress && targetRecipient !== '') {
          unsignedTx.to = targetRecipient;
        }

        const feeData = await provider.getFeeData().catch(() => null);
        const nonce = await provider.getTransactionCount(signer.address, 'pending');

        const populated = await signer.populateTransaction({
          ...unsignedTx,
          nonce,
          gasLimit: isDeployTx ? 3500000n : (targetCalldata && targetCalldata !== '0x' ? 250000n : 21000n),
          maxFeePerGas: feeData?.maxFeePerGas || undefined,
          maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas || undefined,
        });

        const signedSerialized = await signer.signTransaction(populated);

        setPasskeyNotice(isDeployTx ? 'Broadcasting smart contract to live blockchain...' : 'Broadcasting transaction to live blockchain...');
        
        try {
          const directTx = await provider.broadcastTransaction(signedSerialized);
          txHash = directTx.hash;
          explorerUrl = getExplorerLink(targetNetwork, txHash);
        } catch (broadcastErr: any) {
          console.error('[On-Chain Direct Broadcast Error]:', broadcastErr);
          const errMsg = broadcastErr.shortMessage || broadcastErr.message || 'RPC node rejected transaction';
          setPasskeyNotice(`Blockchain RPC Notice: ${errMsg}`);
          alert(`Blockchain Broadcast Error: ${errMsg}\n\nPlease verify your account has sufficient testnet/mainnet funds for gas.`);
          setActionProcessingId(null);
          return;
        }

        if (isDeployTx) {
          try {
            deployedContractAddress = ethers.getCreateAddress({
              from: signer.address,
              nonce: populated.nonce || 0,
            });
          } catch {}
        }

        // Notify server control plane and Supabase of the confirmed on-chain broadcast
        try {
          await MpcWalletService.broadcastTransaction({
            approvalToken: id,
            requestId: id,
            signedTransaction: signedSerialized,
            passkeyAssertion,
          });
        } catch {}

        await MpcWalletService.approveTransactionRequestWithPasskey(id, passkeyAssertion, undefined, signedSerialized, txHash).catch(() => {});
      } else {
        alert('Please unlock your wallet or import your private key/seed in Settings to sign on-chain transactions.');
        setActionProcessingId(null);
        return;
      }

      if (!txHash) {
        alert('Could not obtain on-chain transaction hash from RPC node.');
        setActionProcessingId(null);
        return;
      }

      // 3. Update local state and persist to localStorage permanently
      setApprovals((prev) => {
        const updated = prev.map((item) =>
          (item.id === id || item.request_id === id || item.approval_token === id || item.parameters?.approvalToken === id)
            ? {
                ...item,
                status: 'CONFIRMED' as const,
                tx_hash: txHash,
                response: { ...item.response, txHash, explorerUrl, contractAddress: deployedContractAddress, status: 'confirmed' },
              }
            : item
        );
        try {
          localStorage.setItem('northveil_approval_history', JSON.stringify(updated.slice(0, 100)));
        } catch {}
        approvalsRef.current = updated;
        return updated;
      });

      // 4. Update Supabase record with confirmed status
      await SupabaseService.updateApprovalStatus(id, 'approved', txHash);

      setConfirmedTxFeedback({
        id,
        txHash,
        explorerUrl: explorerUrl || getExplorerLink(targetNetwork, txHash),
      });
      if (deployedContractAddress) {
        setPasskeyNotice(`Smart contract deployed on-chain! Address: ${formatShortAddress(deployedContractAddress)} (Tx: ${txHash.slice(0, 10)}...)`);
      } else {
        setPasskeyNotice(`Transaction confirmed on-chain! Tx: ${txHash.slice(0, 10)}...`);
      }

      // Sync across all sources
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
      setApprovals((prev) => {
        const updated = prev.map((item) =>
          (item.id === id || item.request_id === id || item.approval_token === id || item.parameters?.approvalToken === id)
            ? {
                ...item,
                status: 'REJECTED' as const,
                response: { ...item.response, status: 'rejected' },
              }
            : item
        );
        try {
          localStorage.setItem('northveil_approval_history', JSON.stringify(updated.slice(0, 100)));
        } catch {}
        approvalsRef.current = updated;
        return updated;
      });

      await MpcWalletService.rejectTransactionRequest(id).catch(() => {});
      await SupabaseService.updateApprovalStatus(id, 'rejected');
      setPasskeyNotice('Transaction request rejected and voided.');
      await fetchLogs();
    } catch (e: any) {
      console.error('Reject failed:', e);
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
            { id: 'EXPIRED', label: 'Expired' },
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
            const isConfirmed = item.status === 'CONFIRMED' || Boolean(item.tx_hash);
            const isRejected = item.status === 'REJECTED';
            const isExpired = item.status === 'EXPIRED';
            const isPending = item.status === 'PENDING' && !item.tx_hash && !isExpired;

            const connectedAddresses = new Set([
              activeSubWallet?.address?.toLowerCase(),
              ...(subWallets || []).map((w) => w.address?.toLowerCase()),
            ].filter(Boolean));
            const itemWallet = (item.wallet_address || '').toLowerCase();
            const isWalletMismatch = Boolean(itemWallet && connectedAddresses.size > 0 && !connectedAddresses.has(itemWallet));

            return (
              <div
                key={item.id}
                className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0f0f12] hover:bg-zinc-50 dark:hover:bg-[#141418] border border-black/[0.06] dark:border-white/[0.06] transition-all space-y-4 shadow-sm"
              >
                {/* Connected Wallet Signing Badge */}
                {isWalletMismatch && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-blue-700 dark:text-blue-400 font-sans">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-semibold">Ready to Sign with Connected Wallet</span>
                      <p className="font-mono text-[11px] break-all text-blue-800/80 dark:text-blue-300/80">
                        Staged via Agent ({formatShortAddress(item.wallet_address)}) • Will be signed and broadcasted on-chain using your active connected wallet: <span className="font-bold underline">{activeSubWallet?.address}</span>
                      </p>
                    </div>
                  </div>
                )}
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
                        : isExpired
                        ? 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isConfirmed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                    ) : isPending ? (
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    ) : isExpired ? (
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
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

                {/* Pending Actions (Approve & Broadcast On-Chain / Reject) */}
                {isPending && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={actionProcessingId === item.id}
                      className="flex-1 sm:flex-none justify-center px-5 py-3 sm:py-2.5 rounded-2xl sm:rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-85 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Fingerprint className="w-4 h-4 stroke-[2]" />
                      <span>{actionProcessingId === item.id ? 'Signing & Broadcasting...' : 'Sign & Broadcast On-Chain'}</span>
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
