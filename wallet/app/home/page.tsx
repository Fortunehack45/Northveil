'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  Cpu,
  ShieldCheck,
  Clock,
  ExternalLink,
  Key,
} from 'lucide-react';

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balances, setBalances] = useState<{ chain: string; symbol: string; balance: string; usd: string }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Load enrolled wallet from local session
    const savedWallet = typeof window !== 'undefined' ? localStorage.getItem('nv_enrolled_wallet') : null;
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
  }, []);

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
      id: 'tx_2',
      type: 'Transfer',
      chain: 'Base',
      amount: '0.01 ETH',
      status: 'Confirmed',
      timestamp: '2 hours ago',
      mode: 'Autonomous Signing',
      txHash: '0x3d9e...11a2',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Total Vault Valuation</span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Threshold MPC Active
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl font-bold tracking-tight text-white font-mono">
              {balances.length > 0 ? `$${balances.reduce((acc, b) => acc + (parseFloat(b.usd.replace('$', '')) || 0), 0).toFixed(2)}` : '$0.00'}
            </h2>
            <span className="text-xs text-zinc-400 font-mono">USD Valuation</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">Address:</span>
              <code className="text-xs font-mono text-zinc-300">{walletAddress || '0xYOUR_WALLET_ADDRESS'}</code>
            </div>
            <button
              onClick={copyAddress}
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition flex items-center gap-1 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-zinc-400 uppercase">Agent Grant Mode</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span className="text-lg font-semibold text-white">Always Ask</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Every Claude transfer stages a pending ticket requiring passkey confirmation.
            </p>
          </div>

          <Link
            href="/settings/autonomous"
            className="w-full py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium text-center transition flex items-center justify-center gap-1.5"
          >
            Configure Autonomous Mode
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Asset Balances Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-base">Vault Assets</h3>
          <span className="text-xs text-zinc-500 font-mono">Public Indexer Feeds</span>
        </div>
        <div className="divide-y divide-zinc-800/60">
          {balances.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm font-mono">
              No active balances. Deposit assets to your non-custodial address.
            </div>
          ) : (
            balances.map((b, i) => (
              <div key={i} className="p-4 sm:px-6 flex items-center justify-between hover:bg-zinc-800/20 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-emerald-400 font-mono">
                    {b.symbol}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{b.symbol}</div>
                    <div className="text-xs text-zinc-500">{b.chain} Network</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white font-mono">{b.balance} {b.symbol}</div>
                  <div className="text-xs text-zinc-500 font-mono">{b.usd}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-white text-base">Grant Activity Log</h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Cryptographic Audit Trail</span>
        </div>
        <div className="divide-y divide-zinc-800/60">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm font-mono">
              No recent transactions recorded.
            </div>
          ) : (
            recentActivity.map((tx) => (
              <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-zinc-800/20 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{tx.type} ({tx.amount})</div>
                    <div className="text-xs text-zinc-500">{tx.chain} • {tx.mode}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-emerald-400">{tx.status}</div>
                  <div className="text-xs text-zinc-500 font-mono">{tx.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
