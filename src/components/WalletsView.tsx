import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  Key,
  Trash2,
  Edit3,
  Copy,
  Check,
  Eye,
  EyeOff,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { SubWalletAccount } from '../types';
import { supabase } from '../services/SupabaseService';
import { MpcWalletService } from '../services/MpcWalletService';
import { formatShortAddress, sanitizeToValidAddress } from '../services/addressUtils';
import { ethers } from 'ethers';

export const WalletsView: React.FC = () => {
  const {
    subWallets,
    activeWalletId,
    activeSubWallet,
    setActiveWalletId,
    createSubWallet,
    importSubWallet,
    renameSubWallet,
    deleteSubWallet,
    restoreWalletFromSeed,
    restoreWalletFromPrivateKey,
    getDecryptedPrivateKey,
  } = useWallet();

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Target wallet for modal actions
  const [targetWallet, setTargetWallet] = useState<SubWalletAccount | null>(null);

  // Form states
  const [newWalletName, setNewWalletName] = useState('');
  const [renameInput, setRenameInput] = useState('');
  const [importType, setImportType] = useState<'seed' | 'privateKey'>('privateKey');
  const [importSecret, setImportSecret] = useState('');
  const [importName, setImportName] = useState('');
  const [importError, setImportError] = useState('');

  // Reveal key states
  const [revealedKeyText, setRevealedKeyText] = useState('');
  const [revealPassword, setRevealPassword] = useState('');
  const [revealError, setRevealError] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(id);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  const handleOpenDeposit = (wallet: SubWalletAccount) => {
    setTargetWallet(wallet);
    setShowDepositModal(true);
  };

  const handleOpenReveal = (wallet: SubWalletAccount) => {
    setTargetWallet(wallet);
    setRevealedKeyText('');
    setRevealPassword('');
    setRevealError('');
    setIsKeyVisible(false);
    if (wallet.derivationPath?.includes('turnkey')) {
      setRevealedKeyText('This vault is secured by Turnkey Hardware Nitro TEE Enclaves & Biometric Passkeys. Non-custodial key shares are never stored or exposed as raw text in the browser.');
      setIsKeyVisible(true);
    }
    setShowRevealModal(true);
  };

  const handleExecuteReveal = async () => {
    if (!targetWallet) return;
    try {
      const pKey = await getDecryptedPrivateKey(targetWallet.id, revealPassword);
      if (pKey) {
        setRevealedKeyText(pKey);
        setIsKeyVisible(true);
        setRevealError('');
      } else {
        setRevealError('Invalid password or credentials could not be decrypted.');
      }
    } catch (err: any) {
      setRevealError(err?.message || 'Decryption failed.');
    }
  };

  const handleOpenRename = (wallet: SubWalletAccount) => {
    setTargetWallet(wallet);
    setRenameInput(wallet.name);
    setShowRenameModal(true);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetWallet && renameInput.trim()) {
      const newName = renameInput.trim();
      renameSubWallet(targetWallet.id, newName);
      try {
        await supabase
          .from('wallets')
          .update({ name: newName })
          .eq('address', targetWallet.address.toLowerCase());
      } catch (err) {
        console.warn('Supabase wallet rename notice:', err);
      }
      setShowRenameModal(false);
    }
  };

  const handleOpenDelete = (wallet: SubWalletAccount) => {
    if (subWallets.length <= 1) return;
    setTargetWallet(wallet);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (targetWallet && subWallets.length > 1) {
      deleteSubWallet(targetWallet.id);
      try {
        await supabase
          .from('wallets')
          .delete()
          .eq('address', targetWallet.address.toLowerCase());
      } catch (err) {
        console.warn('Supabase wallet delete notice:', err);
      }
      setShowDeleteModal(false);
    }
  };

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newWalletName.trim() || `Vault Account #${subWallets.length + 1}`;
    createSubWallet(finalName, '#ffffff');
    setNewWalletName('');
    setShowCreateModal(false);
  };

  const handleImportWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    const raw = importSecret.trim();
    if (!raw) {
      setImportError('Please enter a valid seed phrase or private key.');
      return;
    }

    try {
      const chosenName = importName.trim() || `Imported Wallet #${subWallets.length + 1}`;
      const userId = MpcWalletService.getUserId();

      const words = raw.split(/\s+/).map((w) => w.trim().toLowerCase()).filter(Boolean);
      if (words.length >= 12) {
        // Seed phrase
        MpcWalletService.importMpcVault('seed', words.join(' '), chosenName, userId).catch((e) => {
          console.warn('[Turnkey Enclave Import Notice]:', e.message);
        });
        const newWallet = importSubWallet('seed', words.join(' '), chosenName);
        if (newWallet) {
          setShowImportModal(false);
          setImportSecret('');
          setImportName('');
        } else {
          setImportError('Failed to import seed phrase. Please check word count and order.');
        }
      } else {
        // Private key
        const clean = raw.replace(/\s+/g, '');
        const pKey = clean.startsWith('0x') ? clean : `0x${clean}`;
        if (pKey.length !== 66 || !ethers.isHexString(pKey, 32)) {
          setImportError('Invalid format: Must be a 12-24 word seed phrase or a 64-character private key.');
          return;
        }
        MpcWalletService.importMpcVault('privateKey', pKey, chosenName, userId).catch((e) => {
          console.warn('[Turnkey Enclave Import Notice]:', e.message);
        });
        const newWallet = importSubWallet('privateKey', pKey, chosenName);
        if (newWallet) {
          setShowImportModal(false);
          setImportSecret('');
          setImportName('');
        } else {
          setImportError('Invalid private key format.');
        }
      }
    } catch (err: any) {
      setImportError(err?.message || 'Import error occurred.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 mono-animate-in">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-mono font-medium">
              MULTI-ACCOUNT VAULT
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              {subWallets.length} Active Accounts
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
            Wallets & Accounts
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your derived sub-accounts, add funds, reveal credentials, or import existing keys.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs sm:text-sm hover:opacity-85 active:scale-[0.98] transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Account</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-black/[0.05] dark:bg-[#18181c] hover:bg-black/[0.08] dark:hover:bg-[#242429] text-zinc-900 dark:text-white active:scale-[0.98] font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ACTIVE WALLET HERO CARD (Seamless) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black text-white dark:bg-white dark:text-black font-bold shadow-md shrink-0">
                <Wallet className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white whitespace-nowrap truncate">
                    {activeSubWallet?.name}
                  </h2>
                  <button
                    onClick={() => handleOpenRename(activeSubWallet)}
                    className="p-1 rounded text-zinc-500 hover:text-black dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
                    title="Rename"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.1] text-zinc-900 dark:text-white font-semibold whitespace-nowrap shrink-0">
                    PRIMARY
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                  Path: <span className="text-zinc-800 dark:text-zinc-200">{activeSubWallet?.derivationPath}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-3 bg-black/[0.03] dark:bg-black/40 rounded-2xl flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-900 dark:text-zinc-200 font-medium">
                  {sanitizeToValidAddress(activeSubWallet?.address)}
                </span>
                <button
                  onClick={() => handleCopy(sanitizeToValidAddress(activeSubWallet?.address), 'active')}
                  className="p-1.5 rounded-xl bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.12] dark:hover:bg-white/[0.12] text-zinc-900 dark:text-white transition-colors cursor-pointer"
                  title="Copy Full Address"
                >
                  {copiedAddr === 'active' ? (
                    <Check className="w-4 h-4 text-zinc-900 dark:text-white" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Row for Active Wallet */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => handleOpenDeposit(activeSubWallet)}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 active:scale-[0.98] transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2]" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => handleOpenReveal(activeSubWallet)}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-black/[0.05] dark:bg-[#18181c] hover:bg-black/[0.08] dark:hover:bg-[#242429] text-zinc-900 dark:text-white active:scale-[0.98] font-medium text-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Key className="w-4 h-4" />
              <span>Private Key</span>
            </button>
            <button
              onClick={() => handleOpenRename(activeSubWallet)}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.08] active:scale-[0.98] font-medium text-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            {subWallets.length > 1 && (
              <button
                onClick={() => handleOpenDelete(activeSubWallet)}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] text-zinc-500 hover:text-red-500 hover:bg-red-500/10 active:scale-[0.98] font-medium text-xs transition-all cursor-pointer ml-auto whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ALL VAULT WALLETS GRID */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          All Vault Accounts ({subWallets.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subWallets.map((wallet, idx) => {
            const isActive = wallet.id === activeSubWallet?.id;
            return (
              <div
                key={wallet.id}
                className={`rounded-2xl p-5 transition-all space-y-3.5 border ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-[#18181d] border-black/[0.1] dark:border-white/[0.1] shadow-sm'
                    : 'bg-white dark:bg-[#0f0f12] hover:bg-zinc-50 dark:hover:bg-[#141418] border-black/[0.06] dark:border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isActive ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate max-w-[150px]">
                        {wallet.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {wallet.createdAt ? `Created ${wallet.createdAt}` : 'Sub-Account'}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold">
                      ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveWalletId(wallet.id)}
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      Switch
                    </button>
                  )}
                </div>

                <div className="p-2.5 bg-black/[0.03] dark:bg-black/40 rounded-xl flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-800 dark:text-zinc-300 truncate">
                    {sanitizeToValidAddress(wallet.address, wallet.accountIndex || 0)}
                  </span>
                  <button
                    onClick={() => handleCopy(sanitizeToValidAddress(wallet.address, wallet.accountIndex || 0), wallet.id)}
                    className="p-1 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copy Address"
                  >
                    {copiedAddr === wallet.id ? (
                      <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => handleOpenDeposit(wallet)}
                    className="py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Funds
                  </button>
                  <button
                    onClick={() => handleOpenReveal(wallet)}
                    className="py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Key
                  </button>
                  <button
                    onClick={() => handleOpenRename(wallet)}
                    className="py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALS (Rendered with React Portal to Document Body) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Modal 1: Create Wallet */}
      {showCreateModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Create New Sub-Wallet</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-1 text-sm font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateWallet} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Trading Account, Staking Vault"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-semibold hover:opacity-85 transition-colors cursor-pointer shadow-sm"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal 2: Import Wallet */}
      {showImportModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Import Wallet</h3>
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-1 text-sm font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleImportWallet} className="space-y-4">
                <div className="mono-segmented-container w-full flex bg-black/[0.04] dark:bg-black p-1 rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setImportType('privateKey');
                      setImportError('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      importType === 'privateKey'
                        ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Private Key
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportType('seed');
                      setImportError('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      importType === 'seed'
                        ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Seed Phrase
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Imported MetaMask Wallet"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {importType === 'privateKey'
                      ? 'Enter 64-char Hex Private Key'
                      : 'Enter 12 or 24 Word Seed Phrase'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      importType === 'privateKey'
                        ? '0x1234567890abcdef...'
                        : 'apple banana cherry dragon eagle falcon grape harbor island jungle knife lemon'
                    }
                    value={importSecret}
                    onChange={(e) => setImportSecret(e.target.value)}
                    className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white resize-none"
                  />
                </div>

                {importError && (
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 bg-black/[0.05] dark:bg-white/[0.06] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                    {importError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-semibold hover:opacity-85 transition-colors cursor-pointer shadow-sm"
                  >
                    Import
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal 3: Reveal Private Key */}
      {showRevealModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Reveal Security Key</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{targetWallet?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRevealModal(false)}
                  className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-1 text-sm font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {!revealedKeyText ? (
                <div className="space-y-4">
                  <div className="p-3 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-transparent rounded-2xl text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                    <p className="font-semibold text-zinc-900 dark:text-white">Security Notice</p>
                    <p>Never share your private key. Anyone with this key has access to the funds.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Enter Vault Password to Decrypt
                    </label>
                    <input
                      type="password"
                      placeholder="Vault Password"
                      value={revealPassword}
                      onChange={(e) => setRevealPassword(e.target.value)}
                      className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      autoFocus
                    />
                  </div>

                  {revealError && (
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 bg-black/[0.05] dark:bg-white/[0.06] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                      {revealError}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRevealModal(false)}
                      className="flex-1 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteReveal}
                      className="flex-1 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-semibold hover:opacity-85 transition-colors cursor-pointer shadow-sm"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Decrypted Private Key
                    </label>
                    <div className="p-3.5 bg-black/[0.03] dark:bg-black border border-black/[0.06] dark:border-white/[0.08] rounded-2xl font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all flex items-center justify-between gap-2">
                      <span>{isKeyVisible ? revealedKeyText : '•'.repeat(48)}</span>
                      <button
                        onClick={() => setIsKeyVisible(!isKeyVisible)}
                        className="p-1 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white cursor-pointer shrink-0"
                      >
                        {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(revealedKeyText);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="flex-1 py-2.5 rounded-full bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.12] dark:hover:bg-white/[0.12] text-zinc-900 dark:text-white font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedKey ? 'Copied' : 'Copy Key'}
                    </button>
                    <button
                      onClick={() => {
                        setRevealedKeyText('');
                        setShowRevealModal(false);
                      }}
                      className="flex-1 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 transition-colors cursor-pointer shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Modal 4: Deposit Funds */}
      {showDepositModal &&
        targetWallet &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Add Funds</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{targetWallet.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-1 text-sm font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-center space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  Send ETH, SOL, or Stablecoins to this deposit address:
                </p>

                <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl border border-black/[0.08] dark:border-transparent shadow-sm flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${targetWallet.address}`}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-3 bg-black/[0.03] dark:bg-black border border-black/[0.06] dark:border-white/[0.08] rounded-2xl flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate">
                    {targetWallet.address}
                  </span>
                  <button
                    onClick={() => handleCopy(targetWallet.address, 'deposit')}
                    className="p-2 rounded-xl bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.12] dark:hover:bg-white/[0.12] text-zinc-900 dark:text-white transition-colors cursor-pointer shrink-0"
                  >
                    {copiedAddr === 'deposit' ? (
                      <Check className="w-4 h-4 text-zinc-900 dark:text-white" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowDepositModal(false)}
                className="w-full py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-85 transition-colors cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Modal 5: Edit Wallet Name */}
      {showRenameModal &&
        targetWallet &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Edit Wallet Name</h3>
              <form onSubmit={handleSaveRename} className="space-y-4">
                <input
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRenameModal(false)}
                    className="flex-1 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-85 cursor-pointer shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal 6: Delete Wallet Confirmation */}
      {showDeleteModal &&
        targetWallet &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Delete {targetWallet.name}?</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Are you sure you want to remove this account? You can restore it later with your seed phrase.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-85 text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
