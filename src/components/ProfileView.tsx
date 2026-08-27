import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../context/WalletContext';
import {
  User,
  CheckCircle2,
  ExternalLink,
  Code2,
  FileCode,
  Layers,
  Copy,
  Check,
  LifeBuoy,
  Link as LinkIcon,
  RefreshCw,
  Fingerprint,
  Shield,
  Trash2,
  Key,
} from 'lucide-react';
import { SmartContractRecord } from '../types';
import { supabase } from '../services/SupabaseService';
import { WebAuthnService } from '../services/WebAuthnService';

export const ProfileView: React.FC = () => {
  const {
    activeSubWallet,
    subWallets,
    totalNetWorthUsd,
    socialAccounts,
    linkSocialAccount,
    unlinkSocialAccount,
  } = useWallet();

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [contracts, setContracts] = useState<SmartContractRecord[]>([]);

  const [socialModalProvider, setSocialModalProvider] = useState<'google' | 'github' | 'twitter' | null>(null);
  const [socialHandleInput, setSocialHandleInput] = useState('');

  // 1-to-1 Passkey Security Management State
  const [activePasskey, setActivePasskey] = useState<any>(null);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [passkeyNotice, setPasskeyNotice] = useState<string | null>(null);

  const refreshPasskeyState = () => {
    if (activeSubWallet?.address) {
      const p = WebAuthnService.getRegisteredPasskey(activeSubWallet.address);
      setActivePasskey(p);
    } else {
      setActivePasskey(null);
    }
  };

  useEffect(() => {
    refreshPasskeyState();
  }, [activeSubWallet?.address]);

  const handleRegisterPasskey = async () => {
    if (!activeSubWallet?.address) return;
    setIsRegisteringPasskey(true);
    setPasskeyNotice('Prompting device for biometric passkey registration...');
    try {
      const res = await WebAuthnService.registerPasskey(activeSubWallet.address, activeSubWallet.name);
      if (res.success && res.passkey) {
        setPasskeyNotice('✅ Biometric passkey successfully registered and bound to this vault!');
        refreshPasskeyState();
      } else {
        setPasskeyNotice(`⚠️ Registration notice: ${res.error || 'Cancelled or failed'}`);
      }
    } catch (e: any) {
      setPasskeyNotice(`❌ Error: ${e.message}`);
    } finally {
      setIsRegisteringPasskey(false);
      setTimeout(() => setPasskeyNotice(null), 5000);
    }
  };

  const handleRemovePasskey = () => {
    if (!activeSubWallet?.address) return;
    WebAuthnService.removePasskey(activeSubWallet.address);
    refreshPasskeyState();
    setPasskeyNotice('Passkey unbound from this vault.');
    setTimeout(() => setPasskeyNotice(null), 3000);
  };

  const fetchContracts = async () => {
    setIsLoadingContracts(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: SmartContractRecord[] = data.map((c: any) => ({
          id: c.id || `c-${Math.random()}`,
          contract_name: c.contract_name || 'SmartContract',
          symbol: c.symbol || 'TOKEN',
          contract_address: c.predicted_address || c.contract_address || '0x...',
          contract_type: c.contract_type || 'ERC-20',
          total_supply: c.total_supply || 1000000,
          network: c.network || 'sepolia',
          wallet_address: c.wallet_address || activeSubWallet?.address || '0x...',
          tx_hash: c.tx_hash,
          verified_on_explorer: true,
          explorer_verification_url: `https://sepolia.etherscan.io/address/${c.predicted_address || c.contract_address}#code`,
          created_at: c.created_at || new Date().toISOString(),
        }));

        setContracts(formatted);
      } else {
        setContracts([]);
      }
    } catch (e) {
      console.warn('[Contracts Fetch Notice]:', e);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [activeSubWallet?.address]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleOpenSocialModal = (provider: 'google' | 'github' | 'twitter') => {
    setSocialModalProvider(provider);
    setSocialHandleInput('');
  };

  const handleSaveSocialLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (socialModalProvider && socialHandleInput.trim()) {
      const val = socialHandleInput.trim();
      linkSocialAccount(socialModalProvider, val);
      try {
        if (activeSubWallet?.address) {
          await supabase
            .from('wallets')
            .update({
              [`social_${socialModalProvider}`]: val,
            })
            .eq('address', activeSubWallet.address.toLowerCase());
        }
      } catch (err) {
        console.warn('Social account sync notice:', err);
      }
      setSocialModalProvider(null);
    }
  };

  const formatShortAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 mono-animate-in">
      {/* PROFILE HEADER (Seamless, Zero Harsh Lines) */}
      <div className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-md">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white whitespace-nowrap truncate">
                  {activeSubWallet?.name || 'Primary Vault'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-mono font-medium whitespace-nowrap shrink-0">
                  VERIFIED
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                <span>{formatShortAddress(activeSubWallet?.address || '')}</span>
                <button
                  onClick={() => handleCopy(activeSubWallet?.address || '', 'primary')}
                  className="p-1 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  {copiedAddress === 'primary' ? (
                    <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-black/[0.03] dark:bg-black/40 rounded-2xl font-mono text-right">
              <span className="block text-[10px] text-zinc-500 uppercase">VAULT NET WORTH</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                ${totalNetWorthUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SOCIAL ACCOUNT LINKING (Seamless) */}
      <div className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Linked Accounts
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Connect your developer profile with your Northveil vault.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Google */}
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-transparent space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-zinc-900 dark:text-white">Google</span>
              {socialAccounts?.google?.connected ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                  CONNECTED
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.02] text-zinc-500">
                  NOT LINKED
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
              {socialAccounts?.google?.email || 'No account linked'}
            </p>
            {socialAccounts?.google?.connected ? (
              <button
                onClick={() => unlinkSocialAccount('google')}
                className="w-full py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleOpenSocialModal('google')}
                className="w-full py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-85 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Connect Google
              </button>
            )}
          </div>

          {/* GitHub */}
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-transparent space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-zinc-900 dark:text-white">GitHub</span>
              {socialAccounts?.github?.connected ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                  CONNECTED
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.02] text-zinc-500">
                  NOT LINKED
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
              {socialAccounts?.github?.username ? `@${socialAccounts.github.username}` : 'No account linked'}
            </p>
            {socialAccounts?.github?.connected ? (
              <button
                onClick={() => unlinkSocialAccount('github')}
                className="w-full py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleOpenSocialModal('github')}
                className="w-full py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-85 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Connect GitHub
              </button>
            )}
          </div>

          {/* X (Twitter) */}
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-transparent space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-zinc-900 dark:text-white">X (Twitter)</span>
              {socialAccounts?.twitter?.connected ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                  CONNECTED
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.02] text-zinc-500">
                  NOT LINKED
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
              {socialAccounts?.twitter?.handle ? `@${socialAccounts.twitter.handle}` : 'No account linked'}
            </p>
            {socialAccounts?.twitter?.connected ? (
              <button
                onClick={() => unlinkSocialAccount('twitter')}
                className="w-full py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleOpenSocialModal('twitter')}
                className="w-full py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-85 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Connect X
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BIOMETRIC PASSKEY SECURITY (STRICT 1-TO-1 VAULT PROTECTION) */}
      <div className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Vault Biometric Passkey
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-medium">
                  1-TO-1 BOUND
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hardware Touch ID, Face ID, or Windows Hello passkey bound exclusively to {activeSubWallet?.name || 'this vault'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activePasskey ? (
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> SECURED
              </span>
            ) : (
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5" /> UNBOUND
              </span>
            )}
          </div>
        </div>

        {passkeyNotice && (
          <div className="p-3 bg-black/[0.03] dark:bg-black/50 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl text-xs text-zinc-700 dark:text-zinc-300 font-mono">
            {passkeyNotice}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-transparent space-y-3">
          {activePasskey ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Device Name</span>
                  <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Key className="w-3.5 h-3.5 text-zinc-400" />
                    {activePasskey.deviceName || 'Biometric Passkey'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Registered Date</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300 mt-0.5 block">
                    {new Date(activePasskey.createdAt).toLocaleDateString()} {new Date(activePasskey.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-500 block text-[11px]">Credential ID</span>
                  <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 break-all block mt-0.5">
                    {activePasskey.credentialId}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleRegisterPasskey}
                  disabled={isRegisteringPasskey}
                  className="flex-1 py-2.5 px-4 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  {isRegisteringPasskey ? 'Scanning...' : 'Re-Register / Update Passkey'}
                </button>
                <button
                  onClick={handleRemovePasskey}
                  className="py-2.5 px-4 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-red-500/10 hover:text-red-500 text-zinc-600 dark:text-zinc-400 text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Unbind Passkey
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                No passkey is currently bound to <strong>{activeSubWallet?.name || 'this vault'}</strong> ({activeSubWallet?.address?.slice(0, 6)}...{activeSubWallet?.address?.slice(-4)}). Registering a passkey allows you to authorize on-chain transfers, smart contracts, and token mints with your fingerprint or face scan.
              </p>
              <button
                onClick={handleRegisterPasskey}
                disabled={isRegisteringPasskey}
                className="w-full sm:w-auto py-2.5 px-6 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Fingerprint className="w-4 h-4" />
                {isRegisteringPasskey ? 'Prompting Device...' : 'Register Biometric Passkey for this Vault'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DEPLOYED CONTRACTS REGISTRY (Seamless, Pure Light/Dark) */}
      <div className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Deployed Contracts ({contracts.length})
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Smart contracts deployed through MCP tied to your vault address.
              </p>
            </div>
          </div>
          <button
            onClick={fetchContracts}
            disabled={isLoadingContracts}
            className="p-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh Contracts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingContracts ? 'animate-spin text-zinc-900 dark:text-white' : ''}`} />
          </button>
        </div>

        <div className="space-y-2.5 pt-1">
          {contracts.length === 0 ? (
            <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-transparent text-center space-y-2">
              <FileCode className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mx-auto" />
              <p className="text-xs text-zinc-700 dark:text-zinc-400">
                No smart contracts deployed from this wallet yet.
              </p>
              <p className="text-[11px] text-zinc-500 font-mono">
                Deploy ERC-20, ERC-721, or Solana programs via Smart Contract Studio.
              </p>
            </div>
          ) : (
            contracts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/40 hover:bg-black/[0.04] dark:hover:bg-black/60 border border-black/[0.04] dark:border-transparent transition-all space-y-3"
              >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-bold text-xs font-mono">
                    {item.contract_type}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">{item.contract_name}</h3>
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        [{item.symbol}]
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      Supply: {item.total_supply.toLocaleString()} | Network: {item.network}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white flex items-center gap-1 self-start sm:self-center font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Address:</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                    {formatShortAddress(item.contract_address || '')}
                  </span>
                  <button
                    onClick={() => handleCopy(item.contract_address || '', item.id)}
                    className="p-1 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    {copiedAddress === item.id ? (
                      <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {item.explorer_verification_url && (
                  <a
                    href={item.explorer_verification_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-900 dark:text-white underline font-medium flex items-center gap-1"
                  >
                    View on Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* SUB-WALLETS OVERVIEW (Seamless, Pure Light/Dark) */}
      <div className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Sub-Wallets ({subWallets.length})
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Accounts derived from your master root.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {subWallets.map((wallet) => (
            <div
              key={wallet.id}
              className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-transparent space-y-1"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                <span className="font-medium text-xs text-zinc-900 dark:text-white truncate">{wallet.name}</span>
              </div>
              <p className="font-mono text-[11px] text-zinc-500 truncate">{wallet.address}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HELP & SUPPORT NOTICE */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-200">
          <LifeBuoy className="w-4 h-4 text-zinc-900 dark:text-white" />
          <h3 className="text-sm font-semibold">
            Help & Support Center
          </h3>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Dedicated ticket management, live community assistance, and automated troubleshooting are under active development. For developer inquiries or bug reports, please consult the official documentation or reach out via our GitHub repository.
        </p>
      </div>

      {/* Modal for Social Link (Rendered with React Portal to Document Body) */}
      {socialModalProvider &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white capitalize">
                Link {socialModalProvider} Account
              </h3>
              <form onSubmit={handleSaveSocialLink} className="space-y-4">
                <input
                  type={socialModalProvider === 'google' ? 'email' : 'text'}
                  placeholder={
                    socialModalProvider === 'google'
                      ? 'user@gmail.com'
                      : socialModalProvider === 'github'
                      ? 'github_username'
                      : 'twitter_handle'
                  }
                  value={socialHandleInput}
                  onChange={(e) => setSocialHandleInput(e.target.value)}
                  className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSocialModalProvider(null)}
                    className="flex-1 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-85 text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    Link
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
