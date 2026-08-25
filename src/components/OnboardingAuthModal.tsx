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
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { WalletService } from '../services/WalletService';

interface OnboardingAuthModalProps {
  onClose?: () => void;
  isFullscreen?: boolean;
}

export const OnboardingAuthModal: React.FC<OnboardingAuthModalProps> = ({
  onClose,
  isFullscreen = false,
}) => {
  const {
    seedPhrase,
    setSeedPhrase,
    restoreWalletFromSeed,
    restoreWalletFromPrivateKey,
    setupVault,
  } = useWallet();

  const [step, setStep] = useState<
    'welcome' | 'createName' | 'createSeed' | 'createVerify' | 'createVault' | 'importWallet' | 'importPassword' | 'processing'
  >('welcome');

  const [walletNameInput, setWalletNameInput] = useState('My Northveil Vault');
  const [vaultPassword, setVaultPassword] = useState('');
  const [confirmVaultPassword, setConfirmVaultPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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

  const [quizWord3, setQuizWord3] = useState('');
  const [quizWord7, setQuizWord7] = useState('');
  const [quizVerified, setQuizVerified] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');

  const handleCopySeed = () => {
    if (seedPhrase.length > 0) {
      navigator.clipboard.writeText(seedPhrase.join(' '));
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    }
  };

  const handleCreateWallet = async () => {
    setStep('processing');
    setProcessingMsg('Generating BIP-39 Mnemonic...');
    await new Promise((r) => setTimeout(r, 400));

    try {
      const newSeed = WalletService.generateSeedPhrase();
      if (!newSeed || newSeed.length < 12) {
        alert('Generated seed is invalid.');
        setStep('createName');
        return;
      }
      setSeedPhrase(newSeed);
      setStep('createSeed');
    } catch (e: any) {
      alert('Seed generation error: ' + e.message);
      setStep('createName');
    }
  };

  const handleVerifySeed = () => {
    setQuizError('');
    if (quizWord3.toLowerCase().trim() !== (seedPhrase[2] || '').toLowerCase()) {
      setQuizError('Word #3 is incorrect.');
      return;
    }
    if (quizWord7.toLowerCase().trim() !== (seedPhrase[6] || '').toLowerCase()) {
      setQuizError('Word #7 is incorrect.');
      return;
    }
    setQuizVerified(true);
  };

  const handleFinalizeCreatedVault = async () => {
    setPasswordError('');
    if (vaultPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (vaultPassword !== confirmVaultPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setStep('processing');
    setProcessingMsg('Encrypting Vault Keychain...');
    await new Promise((r) => setTimeout(r, 400));

    await setupVault(vaultPassword, seedPhrase, walletNameInput);
    if (onClose) onClose();
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
    setProcessingMsg('Encrypting Imported Keychain...');
    await new Promise((r) => setTimeout(r, 400));

    const chosenName = importWalletName.trim() || 'Primary Vault';

    try {
      if (importType === 'seed' && parsedImportWords.length >= 12) {
        await setupVault(importPassword, parsedImportWords);
        const success = restoreWalletFromSeed(parsedImportWords, chosenName);
        if (success) {
          if (onClose) onClose();
        } else {
          setImportPasswordError('Could not restore from this seed phrase.');
          setStep('importPassword');
        }
      } else if (importType === 'privateKey' && parsedImportKey) {
        await setupVault(importPassword, [parsedImportKey]);
        const success = restoreWalletFromPrivateKey(parsedImportKey, chosenName);
        if (success) {
          if (onClose) onClose();
        } else {
          setImportPasswordError('Could not restore from this private key.');
          setStep('importPassword');
        }
      }
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
              AUTHENTICATION & VAULT GATEWAY
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight pt-1">
              Welcome to Northveil
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
              Secure multi-chain DeFi vault with real on-chain execution and MCP integration.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setStep('createName')}
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
            >
              Create New Vault <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStep('importWallet')}
              className="w-full py-3 bg-black/[0.04] dark:bg-white/[0.04] text-zinc-900 dark:text-white font-medium text-xs rounded-full border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] cursor-pointer transition-all"
            >
              Import Existing Wallet
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
            <span className="text-[10px] font-mono text-zinc-500">STEP 1 OF 3</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Name Your Vault</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Choose a label for this account container.</p>
          </div>

          <input
            type="text"
            value={walletNameInput}
            onChange={(e) => setWalletNameInput(e.target.value)}
            placeholder="e.g. Primary Vault"
            className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            autoFocus
          />

          <button
            onClick={handleCreateWallet}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md"
          >
            Generate Seed Phrase
          </button>
        </div>
      )}

      {/* Step: Seed Display */}
      {step === 'createSeed' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('createName')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">STEP 2 OF 3</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Write Down Your Recovery Phrase</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              These 12 words are the ONLY way to recover your vault.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3.5 bg-black/[0.02] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-2xl">
            {seedPhrase.map((w, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] text-xs font-mono flex items-center justify-between text-zinc-900 dark:text-zinc-200"
              >
                <span className="text-zinc-500 text-[10px]">{idx + 1}.</span>
                <span className="font-semibold">{w}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleCopySeed}
            className="w-full py-2 bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-white text-xs font-medium rounded-full flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedSeed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSeed ? 'Copied Phrase' : 'Copy All 12 Words'}
          </button>

          <button
            onClick={() => setStep('createVerify')}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md"
          >
            I Have Saved My Phrase
          </button>
        </div>
      )}

      {/* Step: Verify Seed Phrase */}
      {step === 'createVerify' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('createSeed')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">VERIFICATION</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Confirm Secret Phrase</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Verify word #3 and word #7 from your saved list.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Word #3</label>
              <input
                type="text"
                value={quizWord3}
                onChange={(e) => setQuizWord3(e.target.value)}
                className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Word #7</label>
              <input
                type="text"
                value={quizWord7}
                onChange={(e) => setQuizWord7(e.target.value)}
                className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            {quizError && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                {quizError}
              </p>
            )}
          </div>

          {!quizVerified ? (
            <button
              onClick={handleVerifySeed}
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md"
            >
              Verify Words
            </button>
          ) : (
            <button
              onClick={() => setStep('createVault')}
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md"
            >
              Continue to Password Setup
            </button>
          )}
        </div>
      )}

      {/* Step: Password Protection for Creation */}
      {step === 'createVault' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">SET VAULT PASSWORD</span>
            <span className="text-[10px] font-mono text-zinc-500">FINAL STEP</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Choose Your Vault Password</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              This password locally encrypts your credentials using AES-256-GCM.
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={vaultPassword}
                onChange={(e) => setVaultPassword(e.target.value)}
                placeholder="Vault Password (min. 6 characters)"
                className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmVaultPassword}
                onChange={(e) => setConfirmVaultPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            {passwordError && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                {passwordError}
              </p>
            )}
          </div>

          <button
            onClick={handleFinalizeCreatedVault}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Complete Setup & Open Vault
          </button>
        </div>
      )}

      {/* Step: Import Existing Wallet (Step 1: Enter Secret) */}
      {step === 'importWallet' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('welcome')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">IMPORT (1/2)</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Import Existing Wallet</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Enter your 12–24 word seed phrase or 64-char private key.</p>
          </div>

          <div className="mono-segmented-container w-full flex">
            <button
              type="button"
              onClick={() => setImportType('seed')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                importType === 'seed' ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Seed Phrase
            </button>
            <button
              type="button"
              onClick={() => setImportType('privateKey')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                importType === 'privateKey' ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Private Key
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Vault Name / Label (Optional)
              </label>
              <input
                type="text"
                value={importWalletName}
                onChange={(e) => setImportWalletName(e.target.value)}
                placeholder="e.g. Primary Vault"
                className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {importType === 'seed' ? 'Recovery Seed Phrase' : 'Private Key (Hex)'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  importType === 'seed'
                    ? 'apple banana cherry dragon eagle falcon grape harbor island jungle knife lemon'
                    : '0x1234567890abcdef...'
                }
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white resize-none"
              />
            </div>
          </div>

          {importError && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
              {importError}
            </p>
          )}

          <button
            onClick={handleProceedToImportPassword}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            Continue to Password Setup <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step: Import Existing Wallet (Step 2: Choose Password) */}
      {step === 'importPassword' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('importWallet')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">IMPORT (2/2)</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Choose Your Vault Password</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Create a secure password to encrypt your imported credentials on this device.
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showImportPassword ? 'text' : 'password'}
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
                placeholder="Vault Password (min. 6 characters)"
                className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowImportPassword(!showImportPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white cursor-pointer"
              >
                {showImportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showImportPassword ? 'text' : 'password'}
                value={confirmImportPassword}
                onChange={(e) => setConfirmImportPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            {importPasswordError && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                {importPasswordError}
              </p>
            )}
          </div>

          <button
            onClick={handleFinalizeImportedVault}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Encrypt Vault & Open Wallet
          </button>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <div className="text-center space-y-4 py-8">
          <Loader2 className="w-8 h-8 text-zinc-900 dark:text-white animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{processingMsg}</p>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] dark:bg-black flex items-center justify-center p-4 sm:p-6 mono-animate-in">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
      {cardContent}
    </div>
  );
};
