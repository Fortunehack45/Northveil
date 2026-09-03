'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, CheckCircle2, ShieldAlert, ArrowRight, Loader2, Copy, Check } from 'lucide-react';

export default function WalletOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<{ address: string; mpcWalletId: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const createMpcWallet = async () => {
    setLoading(true);
    try {
      // Simulate/call MPC enclave partition creation
      const mockAddress = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockMpcId = 'mpc_part_' + Math.random().toString(36).slice(2, 12);
      
      setWallet({
        address: mockAddress,
        mpcWalletId: mockMpcId,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full w-fit">
          <Wallet className="w-3.5 h-3.5" />
          <span>Step 2 of 2: Threshold Vault Creation</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Your MPC Wallet</h1>
          <p className="text-sm text-zinc-400">
            Northveil provisions an isolated enclave partition. No private key or seed phrase ever exists on the server.
          </p>
        </div>

        {!wallet ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-zinc-800/40 border border-zinc-800 rounded-xl text-xs text-zinc-300 space-y-2">
              <div className="font-semibold text-white">How Northveil MPC Works:</div>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Key shares are distributed across isolated, hardware-attested TEE enclaves.</li>
                <li>Your enrolled passkey gates all outgoing state changes.</li>
                <li>Claude and autonomous agents only receive derived transaction receipts.</li>
              </ul>
            </div>

            <button
              onClick={createMpcWallet}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/20 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Enclave Partition...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Provision MPC Wallet
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-medium">YOUR PUBLIC VAULT ADDRESS</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-black/40 border border-emerald-500/20 rounded-lg">
                <code className="text-xs font-mono text-zinc-200 break-all">{wallet.address}</code>
                <button
                  onClick={copyAddress}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition shrink-0"
                  title="Copy address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/connect-claude')}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition"
              >
                Connect Claude
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/home')}
                className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
              >
                Skip to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
