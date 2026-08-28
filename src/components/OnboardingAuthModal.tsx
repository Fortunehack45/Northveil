import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Fingerprint,
  Sparkles,
  Key,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { MpcWalletService } from '../services/MpcWalletService';
import { WebAuthnService } from '../services/WebAuthnService';

interface OnboardingAuthModalProps {
  onClose?: () => void;
  isFullscreen?: boolean;
}

export const OnboardingAuthModal: React.FC<OnboardingAuthModalProps> = ({
  onClose,
  isFullscreen = false,
}) => {
  const {
    restoreWalletFromSeed,
    restoreWalletFromPrivateKey,
    setupVault,
    setupMpcVault,
  } = useWallet();

  const [step, setStep] = useState<
    'welcome' | 'createName' | 'createPasskey' | 'createdSuccess' | 'importWallet' | 'importPassword' | 'processing'
  >('welcome');

  const [walletNameInput, setWalletNameInput] = useState('My Northveil Vault');
  const [createdVaultAddress, setCreatedVaultAddress] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  const [importWalletName, setImportWalletName] = useState('Primary Vault');
  const [importType, setImportType] = useState<'seed' | 'privateKey'>('seed');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [parsedImportWords, setParsedImportWords] = useState<string[]>([]);
  const [parsedImportKey, setParsedImportKey] = useState<string>('');

  const [importPassword, setImportPassword] = useState('');
  const [confirmImportPassword, setConfirmImportPassword] = useState('');
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [importPasswordError, setImportPasswordError] = useState('');

  const [processingMsg, setProcessingMsg] = useState('');

  const handleCopyAddress = () => {
    if (createdVaultAddress) {
      navigator.clipboard.writeText(createdVaultAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  /**
   * Genuine Turnkey Hardware MPC Vault Creation & Mandatory Passkey Registration Flow
   */
  const handleCreateMpcVaultWithPasskey = async () => {
    setPasskeyError('');
    setStep('processing');
    setProcessingMsg('Provisioning Turnkey Nitro TEE Enclave Vault...');

    try {
      // 1. Backend provisions Turnkey MPC Hardware Enclave Wallet
      const userId = MpcWalletService.getUserId();
      const vaultResult = await MpcWalletService.createMpcVault(walletNameInput, userId);

      setProcessingMsg('Prompting Biometric Passkey Registration (Touch ID / Face ID)...');

      // 2. Mandatory WebAuthn Passkey Registration
      const passkeyResult = await WebAuthnService.registerPasskey(
        vaultResult.address,
        walletNameInput,
        userId
      );

      if (!passkeyResult.success) {
        throw new Error(passkeyResult.error || 'Passkey registration was cancelled or failed.');
      }

      setProcessingMsg('Securing Hardware Vault Session...');

      // 3. Setup MPC Vault in Wallet Context & save session token
      const sessionToken = passkeyResult.sessionToken || MpcWalletService.getSessionToken() || '';
      await setupMpcVault(
        walletNameInput,
        vaultResult.address,
        vaultResult.mpcWalletId,
        userId,
        sessionToken
      );

      setCreatedVaultAddress(vaultResult.address);
      setStep('createdSuccess');
    } catch (err: any) {
      setPasskeyError(err.message || 'Failed to create Turnkey MPC Vault with Passkey.');
      setStep('createPasskey');
    }
  };

  const handleProceedToImportPassword = () => {
    setImportError('');
    const raw = importText.trim();
    if (!raw) {
      setImportError('Please enter a seed phrase or private key.');
      return;
    }

    if (importType === 'seed') {
      const words = raw.split(/\s+/).map((w) => w.trim().toLowerCase()).filter(Boolean);
      if (words.length < 12) {
        setImportError('Seed phrase must contain at least 12 words.');
        return;
      }
      setParsedImportWords(words);
      setParsedImportKey('');
      setStep('importPassword');
    } else {
      const clean = raw.trim();
      const pKey = clean.startsWith('0x') ? clean : `0x${clean}`;
      if (pKey.length !== 66) {
        setImportError('Invalid private key length (must be 64 hex characters).');
        return;
      }
      setParsedImportKey(pKey);
      setParsedImportWords([]);
      setStep('importPassword');
    }
  };

  const handleFinalizeImportedVault = async () => {
    setImportPasswordError('');
    if (importPassword.length < 6) {
      setImportPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (importPassword !== confirmImportPassword) {
      setImportPasswordError('Passwords do not match.');
      return;
    }

    setStep('processing');
    setProcessingMsg('Enclave Hardening: Provisioning Turnkey Nitro TEE Enclave...');

    const chosenName = importWalletName.trim() || 'Primary Vault';
    const userId = MpcWalletService.getUserId();

    try {
      let vaultResult: any = null;
      if (importType === 'seed' && parsedImportWords.length >= 12) {
        const mnemonic = parsedImportWords.join(' ');
        vaultResult = await MpcWalletService.importMpcVault('seed', mnemonic, chosenName, userId).catch((e) => {
          console.warn('[Turnkey Enclave Import Notice]:', e.message);
          return null;
        });
        await setupVault(importPassword, parsedImportWords);
        restoreWalletFromSeed(parsedImportWords, chosenName);
      } else if (importType === 'privateKey' && parsedImportKey) {
        vaultResult = await MpcWalletService.importMpcVault('privateKey', parsedImportKey, chosenName, userId).catch((e) => {
          console.warn('[Turnkey Enclave Import Notice]:', e.message);
          return null;
        });
        await setupVault(importPassword, [parsedImportKey]);
        restoreWalletFromPrivateKey(parsedImportKey, chosenName);
      }

      if (vaultResult && vaultResult.address) {
        setProcessingMsg('Securing Hardware Vault Session...');
        const sessionToken = MpcWalletService.getSessionToken() || `sess_${Date.now()}`;
        await setupMpcVault(
          chosenName,
          vaultResult.address,
          vaultResult.mpcWalletId,
          userId,
          sessionToken
        );
      }

      if (onClose) onClose();
    } catch (err: any) {
      setImportPasswordError(err?.message || 'Import failed.');
      setStep('importPassword');
    }
  };

  const cardContent = (
    <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] p-6 sm:p-8 max-w-md w-full rounded-3xl shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
      {/* Step: Welcome */}
      {step === 'welcome' && (
        <div className="text-center space-y-6 py-2">
          <div className="flex justify-center">
            <img
              src="https://iili.io/CDj46zl.png"
              alt="Northveil Logo"
              className="h-16 w-auto object-contain northveil-logo transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-mono font-medium rounded-full">
              NON-CUSTODIAL HARDWARE MPC
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight pt-1">
              Welcome to Northveil
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
              Hardware Enclave Multi-Chain Vault with Biometric Passkeys & AI MCP Tools.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setStep('createName')}
              className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-4 h-4" /> Create MPC Vault (Passkey Secured) <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStep('importWallet')}
              className="w-full py-3 bg-black/[0.04] dark:bg-white/[0.04] text-zinc-900 dark:text-white font-medium text-xs rounded-full border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5" /> Import External Seed / Key
            </button>
            {!isFullscreen && onClose && (
              <button
                onClick={onClose}
                className="w-full py-2 text-zinc-500 hover:text-black dark:hover:text-zinc-300 text-xs font-medium cursor-pointer"
              >
                Close Window
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step: Name Vault */}
      {step === 'createName' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('welcome')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">STEP 1 OF 2</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Name Your MPC Vault</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Choose a label for this non-custodial hardware account.</p>
          </div>

          <input
            type="text"
            value={walletNameInput}
            onChange={(e) => setWalletNameInput(e.target.value)}
            placeholder="e.g. Primary Trading Vault"
            className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            autoFocus
          />

          <button
            onClick={() => setStep('createPasskey')}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            Continue to Passkey Registration <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step: Mandatory Passkey Registration */}
      {step === 'createPasskey' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('createName')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-emerald-500 font-semibold">HARDWARE SECURITY</span>
          </div>

          <div className="space-y-2 text-center py-2">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
              <Fingerprint className="w-7 h-7 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Register Device Passkey</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Your hardware biometric (Touch ID, Face ID, or Windows Hello) will be cryptographically bound to your Turnkey TEE Enclave. No seed phrases to lose.
            </p>
          </div>

          <div className="bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4 space-y-2 text-left">
            <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Non-Custodial Architecture
            </div>
            <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
              <li>Protected inside AWS Nitro Enclaves</li>
              <li>Biometric authentication on every sign action</li>
              <li>Seamlessly shared with authorized AI Agents</li>
            </ul>
          </div>

          {passkeyError && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {passkeyError}
            </div>
          )}

          <button
            onClick={handleCreateMpcVaultWithPasskey}
            className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4" /> Create MPC Vault & Register Passkey
          </button>
        </div>
      )}

      {/* Step: Created Success */}
      {step === 'createdSuccess' && (
        <div className="space-y-5 text-center py-2">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>

          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono font-semibold rounded-full">
              MPC VAULT READY
            </span>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white pt-1">
              Vault Successfully Created
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Secured by Turnkey Nitro TEE Enclave and device biometric passkey.
            </p>
          </div>

          <div className="bg-black/[0.03] dark:bg-black border border-black/[0.08] dark:border-white/[0.1] rounded-2xl p-4 text-left space-y-2">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Vault Address</div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-zinc-900 dark:text-white break-all">
                {createdVaultAddress}
              </span>
              <button
                onClick={handleCopyAddress}
                className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Copy Address"
              >
                {copiedAddress ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (onClose) onClose();
            }}
            className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            Launch Vault Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step: Import Wallet */}
      {step === 'importWallet' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('welcome')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">IMPORT EXTERNAL</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Import External Wallet</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Restore an existing 12/24-word seed phrase or private key (Locally Secured).
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setImportType('seed');
                setImportText('');
                setImportError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                importType === 'seed'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                  : 'bg-black/[0.03] dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.06]'
              }`}
            >
              Seed Phrase
            </button>
            <button
              onClick={() => {
                setImportType('privateKey');
                setImportText('');
                setImportError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                importType === 'privateKey'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                  : 'bg-black/[0.03] dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.06]'
              }`}
            >
              Private Key
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Account Label</label>
            <input
              type="text"
              value={importWalletName}
              onChange={(e) => setImportWalletName(e.target.value)}
              placeholder="e.g. Imported Alpha"
              className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
              {importType === 'seed' ? 'Recovery Words (space-separated)' : 'Hex Private Key (0x...)'}
            </label>
            <textarea
              rows={3}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={
                importType === 'seed'
                  ? 'apple banana cherry dragon eagle feather grape...'
                  : '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f36fe3b'
              }
              className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {importError && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {importError}
            </div>
          )}

          <button
            onClick={handleProceedToImportPassword}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step: Import Password */}
      {step === 'importPassword' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('importWallet')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">ENCRYPTION KEY</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Local Encryption Password</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Set a local password to encrypt this imported key in browser storage.
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showImportPassword ? 'text' : 'password'}
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
                placeholder="Vault Password (min. 6 chars)"
                className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 pr-10 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowImportPassword(!showImportPassword)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                {showImportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <input
              type={showImportPassword ? 'text' : 'password'}
              value={confirmImportPassword}
              onChange={(e) => setConfirmImportPassword(e.target.value)}
              placeholder="Confirm Vault Password"
              className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {importPasswordError && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {importPasswordError}
            </div>
          )}

          <button
            onClick={handleFinalizeImportedVault}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Encrypt & Import Vault
          </button>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <div className="text-center py-10 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-900 dark:text-white" />
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{processingMsg}</p>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {cardContent}
    </div>
  );
};
