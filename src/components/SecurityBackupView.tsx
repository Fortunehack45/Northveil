import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CustomSelect } from './CustomSelect';
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  HardDrive,
  KeyRound,
  QrCode,
  Smartphone,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Plus,
  Trash2,
  Edit2,
  ArrowRightLeft,
  Key,
  Database,
} from 'lucide-react';

export const SecurityBackupView: React.FC = () => {
  const {
    userSettings,
    updateUserSettings,
    hardwareWallet,
    connectHardwareWallet,
    disconnectHardwareWallet,
    seedPhrase,
    triggerBiometricAuth,
    restoreWalletFromSeed,
    subWallets,
    activeWalletId,
    activeSubWallet,
    setActiveWalletId,
    createSubWallet,
    renameSubWallet,
    deleteSubWallet,
    transferBetweenSubWallets,
    assets,
  } = useWallet();

  const [isSeedRevealed, setIsSeedRevealed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeQuizStep, setActiveQuizStep] = useState<boolean>(false);
  const [userQuizWord3, setUserQuizWord3] = useState<string>('');
  const [userQuizWord7, setUserQuizWord7] = useState<string>('');
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);

  // Import Seed Phrase State
  const [importWords, setImportWords] = useState<string>('');
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  // Multi-Wallet Manager State
  const [newSubWalletName, setNewSubWalletName] = useState<string>('');
  const [newSubWalletColor, setNewSubWalletColor] = useState<string>('#00f0ff');
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editingWalletName, setEditingWalletName] = useState<string>('');
  const [privKeyRevealedId, setPrivKeyRevealedId] = useState<string | null>(null);

  // Internal Transfer State
  const [transferFromId, setTransferFromId] = useState<string>(subWallets[0]?.id || '');
  const [transferToId, setTransferToId] = useState<string>(subWallets[1]?.id || subWallets[0]?.id || '');
  const [transferAssetSymbol, setTransferAssetSymbol] = useState<string>(assets[0]?.symbol || 'ETH');
  const [transferAmount, setTransferAmount] = useState<string>('0.5');
  const [transferStatus, setTransferStatus] = useState<string | null>(null);

  const handleCreateNewSubAccount = () => {
    const nameToUse = newSubWalletName.trim() || `Sub-Account #${subWallets.length + 1}`;
    const newW = createSubWallet(nameToUse, newSubWalletColor);
    if (newW) {
      setActiveWalletId(newW.id);
    }
    setNewSubWalletName('');
  };

  const handleSaveRename = (id: string) => {
    if (editingWalletName.trim()) {
      renameSubWallet(id, editingWalletName.trim());
    }
    setEditingWalletId(null);
  };

  const handleDeleteWallet = (id: string, name: string) => {
    if (subWallets.length <= 1) {
      alert('Cannot delete master default wallet account.');
      return;
    }
    if (confirm(`Are you sure you want to delete sub-wallet "${name}"?`)) {
      deleteSubWallet(id);
    }
  };

  const handleRevealPrivKey = (id: string) => {
    if (privKeyRevealedId === id) {
      setPrivKeyRevealedId(null);
      return;
    }
    triggerBiometricAuth('Export Encrypted Private Key for Sub-Wallet', () => {
      setPrivKeyRevealedId(id);
    });
  };

  const handleExecuteInternalTransfer = async () => {
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0) return;
    if (transferFromId === transferToId) {
      setTransferStatus('Error: Select distinct source and destination sub-wallets.');
      return;
    }

    setTransferStatus('Processing zero-gas internal HD transfer...');
    const ok = await transferBetweenSubWallets(transferFromId, transferToId, transferAssetSymbol, amt);
    if (ok) {
      setTransferStatus(`✓ Transferred ${amt} ${transferAssetSymbol} internally between sub-wallets!`);
    } else {
      setTransferStatus('Internal transfer failed.');
    }
  };

  const handleRevealSeed = () => {
    if (isSeedRevealed) {
      setIsSeedRevealed(false);
      return;
    }
    triggerBiometricAuth('Reveal Encrypted 12-Word Seed Phrase', () => {
      setIsSeedRevealed(true);
    });
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seedPhrase.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyQuiz = () => {
    const word3Correct = userQuizWord3.toLowerCase().trim() === seedPhrase[2].toLowerCase();
    const word7Correct = userQuizWord7.toLowerCase().trim() === seedPhrase[6].toLowerCase();

    if (word3Correct && word7Correct) {
      setQuizPassed(true);
    } else {
      setQuizPassed(false);
    }
  };

  const handleRestoreAccount = () => {
    const words = importWords.trim().split(/\s+/);
    if (words.length !== 12) {
      setRestoreStatus('Error: Seed phrase must contain exactly 12 words.');
      return;
    }

    triggerBiometricAuth('Authorize Account Restoration from Seed', () => {
      const ok = restoreWalletFromSeed(words);
      if (ok) {
        setRestoreStatus('Success! Wallet and state restored cleanly.');
        setImportWords('');
      } else {
        setRestoreStatus('Invalid seed phrase provided.');
      }
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full">
      {/* Header Banner */}
      <div className="bg-[#141419] border-2 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ff007f]">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-[#ff007f] stroke-[3]" />
          <div>
            <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
              SECURITY VAULT & SEED BACKUP
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              END-TO-END ENCRYPTED KEYS, HARDWARE WALLET AUTHENTICATION, AND EMERGENCY ACCOUNT RECOVERY.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 12-Word Seed Phrase Backup Card */}
        <div className="bg-[#141419] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#ffe600] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 border-b-2 border-white pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#ffe600] stroke-[3]" />
                <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">12-WORD RECOVERY SEED</h3>
              </div>
              <button
                onClick={handleRevealSeed}
                className="px-3.5 py-1.5 bg-[#ffe600] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer hover:bg-[#fff066]"
              >
                {isSeedRevealed ? <EyeOff className="w-3.5 h-3.5 text-black stroke-[3]" /> : <Eye className="w-3.5 h-3.5 text-black stroke-[3]" />}
                <span>{isSeedRevealed ? 'HIDE SEED' : 'REVEAL SEED'}</span>
              </button>
            </div>

            <p className="text-xs text-black font-mono font-black bg-[#ff007f] text-white p-3 border-2 border-black shadow-[3px_3px_0px_0px_#000] mb-4 uppercase">
              ⚠️ WARNING: ANYONE WITH YOUR SEED PHRASE CAN STEAL YOUR FUNDS. NEVER SHARE IT WITH ANYONE!
            </p>

            {/* Seed Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 relative">
              {seedPhrase.map((word, index) => (
                <div
                  key={index}
                  className="bg-[#0a0a0c] p-2.5 border-2 border-white flex items-center gap-2 font-mono text-xs shadow-[2px_2px_0px_0px_#000]"
                >
                  <span className="text-[10px] text-slate-400 w-4 font-black">{index + 1}.</span>
                  <span
                    className={`font-black transition-all ${
                      isSeedRevealed ? 'text-[#ccff00]' : 'text-slate-800 blur-sm select-none'
                    }`}
                  >
                    {isSeedRevealed ? word : '••••••••'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t-2 border-white/20">
            <div className="flex items-center justify-between">
              <button
                onClick={handleCopySeed}
                disabled={!isSeedRevealed}
                className="px-4 py-2 bg-[#00f0ff] disabled:bg-[#202028] disabled:text-slate-600 text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer hover:bg-[#33f3ff]"
              >
                {copied ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
                <span>{copied ? 'COPIED!' : 'COPY SEED PHRASE'}</span>
              </button>

              <button
                onClick={() => setActiveQuizStep(!activeQuizStep)}
                className="text-xs text-[#ccff00] font-mono font-black uppercase hover:underline cursor-pointer"
              >
                {activeQuizStep ? 'CLOSE VERIFICATION' : 'VERIFY BACKUP QUIZ'}
              </button>
            </div>

            {/* Verification Quiz Accordion */}
            {activeQuizStep && (
              <div className="p-4 bg-[#0a0a0c] border-2 border-white space-y-3 shadow-[4px_4px_0px_0px_#ff007f]">
                <h4 className="text-xs font-mono font-black text-white uppercase">BACKUP VERIFICATION QUIZ</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-mono font-black text-slate-300 uppercase">WORD #3</label>
                    <input
                      type="text"
                      placeholder="TYPE 3RD WORD..."
                      value={userQuizWord3}
                      onChange={(e) => setUserQuizWord3(e.target.value)}
                      className="w-full mt-1 bg-[#141419] border-2 border-white p-2 text-xs font-mono font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-black text-slate-300 uppercase">WORD #7</label>
                    <input
                      type="text"
                      placeholder="TYPE 7TH WORD..."
                      value={userQuizWord7}
                      onChange={(e) => setUserQuizWord7(e.target.value)}
                      className="w-full mt-1 bg-[#141419] border-2 border-white p-2 text-xs font-mono font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyQuiz}
                  className="w-full py-2 bg-[#ccff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  VERIFY ANSWERS
                </button>

                {quizPassed === true && (
                  <p className="text-xs text-[#ccff00] font-mono font-black text-center uppercase">
                    ✓ QUIZ PASSED! BACKUP CONFIRMED.
                  </p>
                )}
                {quizPassed === false && (
                  <p className="text-xs text-[#ff007f] font-mono font-black text-center uppercase">
                    ✕ INCORRECT WORDS. CHECK YOUR SEED PHRASE.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hardware Wallet & MFA Manager */}
        <div className="bg-[#141419] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#00f0ff] space-y-6">
          {/* Hardware Wallet Manager */}
          <div>
            <div className="flex items-center gap-2 mb-2 border-b-2 border-white pb-3">
              <HardDrive className="w-5 h-5 text-[#00f0ff] stroke-[3]" />
              <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">HARDWARE WALLET INTEGRATION</h3>
            </div>
            <p className="text-xs text-slate-300 font-mono mb-4">
              SIGN TRANSACTIONS OFFLINE WITH PHYSICAL BUTTON VERIFICATION ON YOUR HARDWARE DEVICE.
            </p>

            <div className="space-y-2">
              {[
                { type: 'ledger', name: 'LEDGER NANO S / X / FLEX', icon: '🔴' },
                { type: 'trezor', name: 'TREZOR MODEL T / SAFE 3', icon: '🟢' },
                { type: 'gridplus', name: 'GRIDPLUS LATTICE1', icon: '⚡' },
              ].map((hw) => {
                const isSelected = hardwareWallet.deviceType === hw.type;
                return (
                  <div
                    key={hw.type}
                    className="p-3.5 bg-[#0a0a0c] border-2 border-white flex items-center justify-between shadow-[3px_3px_0px_0px_#000]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{hw.icon}</span>
                      <div>
                        <div className="font-mono font-black text-xs text-white">{hw.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">WEBUSB / BLUETOOTH ENABLED</div>
                      </div>
                    </div>

                    {isSelected ? (
                      <button
                        onClick={disconnectHardwareWallet}
                        className="px-3 py-1.5 bg-[#ff007f] border-2 border-black text-white text-xs font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                      >
                        DISCONNECT
                      </button>
                    ) : (
                      <button
                        onClick={() => connectHardwareWallet(hw.type as any)}
                        className="px-3 py-1.5 bg-[#ccff00] text-black text-xs font-mono font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                      >
                        PAIR DEVICE
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Biometrics & MFA Toggles */}
          <div className="pt-4 border-t-2 border-white/20 space-y-3">
            <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-wider">AUTHENTICATION CONTROLS</h4>

            <div className="flex items-center justify-between p-3.5 bg-[#0a0a0c] border-2 border-white shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[#ccff00] stroke-[3]" />
                <div>
                  <div className="font-mono font-black text-xs text-white uppercase">BIOMETRIC SECURITY</div>
                  <div className="text-[10px] font-mono text-slate-400">TOUCH ID / FACE ID VERIFICATION</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.biometricsEnabled}
                onChange={(e) => updateUserSettings({ biometricsEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#ccff00] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#0a0a0c] border-2 border-white shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-[#00f0ff] stroke-[3]" />
                <div>
                  <div className="font-mono font-black text-xs text-white uppercase">MULTI-FACTOR AUTH (2FA)</div>
                  <div className="text-[10px] font-mono text-slate-400">AUTHENTICATOR TOTP CODES</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.mfaEnabled}
                onChange={(e) => updateUserSettings({ mfaEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#00f0ff] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Web3 Indexer API Configuration */}
      <div className="bg-[#141419] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#ccff00] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-white pb-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-[#ccff00] stroke-[3]" />
            <div>
              <h3 className="text-xl font-black text-white font-mono uppercase tracking-tight">
                WEB3 OMNICHAIN INDEXER
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                CONNECT A MORALIS API KEY TO FETCH ALL CROSS-CHAIN TOKENS, NFTS, AND HISTORICAL DATA.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-mono font-black text-white uppercase tracking-wider block">
            MORALIS API KEY (REST API)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              type="password"
              placeholder="Paste your Moralis API Key here..."
              value={userSettings.moralisApiKey || ''}
              onChange={(e) => updateUserSettings({ moralisApiKey: e.target.value })}
              className="flex-1 bg-[#0a0a0c] text-white p-3 font-mono text-sm border-2 border-white/50 focus:border-[#ccff00] focus:outline-none placeholder:text-slate-600 transition-colors"
            />
            <button
              onClick={() => {
                alert('Indexer Key Saved! If a wallet is connected, it will now fetch all tokens and NFTs.');
              }}
              className="px-6 py-3 bg-[#ccff00] text-black font-mono font-black text-sm uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              SAVE KEY
            </button>
          </div>
          <p className="text-[10px] font-mono text-slate-400 max-w-2xl">
            Without an API key, Northveil uses standard RPC nodes which can only fetch balances for predefined tokens (ETH, USDC, SOL, etc.). A premium indexer allows scanning the entire blockchain for unknown assets and fetching NFT galleries instantly.
          </p>
        </div>
      </div>

      {/* Multi-Wallet HD Sub-Accounts Management & Internal Transfers */}
      <div className="bg-[#141419] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#00f0ff] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-white pb-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-[#00f0ff] stroke-[3]" />
            <div>
              <h3 className="text-xl font-black text-white font-mono uppercase tracking-tight">
                HD MULTI-WALLET ACCOUNTS (BIP-44)
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                DERIVE MULTIPLE ISOLATED WALLETS UNDER ONE SECURE MASTER SEED PHRASE.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 bg-[#00f0ff] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {subWallets.length} DERIVED WALLETS
          </span>
        </div>

        {/* Create Sub-Wallet Form */}
        <div className="bg-[#0a0a0c] border-2 border-white p-4 space-y-3">
          <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#ccff00]" /> DERIVE NEW SUB-WALLET ACCOUNT
          </h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="WALLET NAME (e.g. Trading Bot / NFT Vault / Staking)"
              value={newSubWalletName}
              onChange={(e) => setNewSubWalletName(e.target.value)}
              className="flex-1 bg-[#181820] border-2 border-white p-2.5 text-xs text-white font-mono focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">TAG COLOR:</span>
              <div className="flex gap-1.5">
                {['#00f0ff', '#ccff00', '#ff007f', '#ffe600', '#9945ff', '#00ff66'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewSubWalletColor(color)}
                    className={`w-6 h-6 border-2 cursor-pointer ${
                      newSubWalletColor === color ? 'border-white scale-110 shadow-[2px_2px_0px_0px_#fff]' : 'border-black'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleCreateNewSubAccount}
              className="px-5 py-2.5 bg-[#ccff00] text-black font-mono font-black border-2 border-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33]"
            >
              + DERIVE ACCOUNT
            </button>
          </div>
        </div>

        {/* Grid of Sub-Wallets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subWallets.map((w) => {
            const isActive = w.id === activeWalletId;
            const isEditing = editingWalletId === w.id;

            return (
              <div
                key={w.id}
                className={`p-4 border-2 transition-all space-y-3 relative ${
                  isActive
                    ? 'bg-[#181824] border-[#00f0ff] shadow-[6px_6px_0px_0px_#00f0ff]'
                    : 'bg-[#0a0a0c] border-white/40 shadow-[4px_4px_0px_0px_#000]'
                }`}
              >
                {/* Active Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]"
                      style={{ backgroundColor: w.colorTag }}
                    />
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase">
                      INDEX #{w.accountIndex}
                    </span>
                  </div>

                  {isActive ? (
                    <span className="px-2 py-0.5 bg-[#00f0ff] text-black font-mono font-black text-[9px] uppercase border border-black">
                      ACTIVE WALLET
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveWalletId(w.id)}
                      className="px-2 py-0.5 bg-[#181820] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black font-mono font-black text-[9px] uppercase border border-[#00f0ff] cursor-pointer"
                    >
                      SWITCH TO THIS
                    </button>
                  )}
                </div>

                {/* Name & Address */}
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingWalletName}
                      onChange={(e) => setEditingWalletName(e.target.value)}
                      className="flex-1 bg-black border border-white p-1 text-xs text-white font-mono"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveRename(w.id)}
                      className="px-2 bg-[#ccff00] text-black text-xs font-black font-mono border border-black"
                    >
                      SAVE
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono font-black text-sm text-white truncate">{w.name}</h4>
                    <button
                      onClick={() => {
                        setEditingWalletId(w.id);
                        setEditingWalletName(w.name);
                      }}
                      className="text-slate-400 hover:text-white"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="bg-[#050507] p-2 border border-white/20 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>DERIVATION:</span>
                    <span className="text-[#ccff00]">{w.derivationPath}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ADDRESS:</span>
                    <span className="text-white truncate max-w-[140px]">{w.address}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>CREATED:</span>
                    <span className="text-slate-300">{w.createdAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono">
                  <button
                    onClick={() => handleRevealPrivKey(w.id)}
                    className="text-[#00f0ff] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Key className="w-3 h-3" />
                    {privKeyRevealedId === w.id ? 'HIDE PRIVKEY' : 'VIEW PRIVKEY'}
                  </button>

                  {!w.isDefault && (
                    <button
                      onClick={() => handleDeleteWallet(w.id, w.name)}
                      className="text-[#ff007f] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Trash2 className="w-3 h-3" /> DELETE
                    </button>
                  )}
                </div>

                {privKeyRevealedId === w.id && (
                  <div className="p-2 bg-[#ff007f]/10 border border-[#ff007f] text-[9px] font-mono break-all text-[#ff007f] font-bold">
                    PRIVKEY: 0x8f7a99c4180231b9942a10e8837194857d902bca481774092b71940
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Zero-Gas Internal Wallet Transfer Suite */}
        <div className="bg-[#0a0a0c] border-2 border-white p-5 space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-white pb-3">
            <ArrowRightLeft className="w-5 h-5 text-[#ccff00]" />
            <h4 className="font-mono font-black text-sm text-white uppercase tracking-tight">
              ZERO-GAS INTERNAL SUB-WALLET TRANSFER ENGINE
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">FROM SUB-WALLET:</label>
              <CustomSelect
                options={(subWallets || []).map((w) => {
                  const addr = w?.address || '';
                  const short = addr.length > 8 ? `${addr.slice(0, 6)}...` : addr;
                  return {
                    value: w?.id || '',
                    label: `${w?.name || 'Wallet'} (${short})`,
                  };
                })}
                value={transferFromId}
                onChange={(val) => setTransferFromId(val)}
                variant="dark"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">TO SUB-WALLET:</label>
              <CustomSelect
                options={(subWallets || []).map((w) => {
                  const addr = w?.address || '';
                  const short = addr.length > 8 ? `${addr.slice(0, 6)}...` : addr;
                  return {
                    value: w?.id || '',
                    label: `${w?.name || 'Wallet'} (${short})`,
                  };
                })}
                value={transferToId}
                onChange={(val) => setTransferToId(val)}
                variant="dark"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">ASSET & AMOUNT:</label>
              <div className="flex gap-1.5">
                <CustomSelect
                  options={assets.map((a) => ({
                    value: a.symbol,
                    label: a.symbol,
                  }))}
                  value={transferAssetSymbol}
                  onChange={(val) => setTransferAssetSymbol(val)}
                  variant="dark"
                />
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-[#181820] border-2 border-white text-white p-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExecuteInternalTransfer}
                className="w-full py-2.5 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:bg-[#33f3ff]"
              >
                TRANSFER NOW
              </button>
            </div>
          </div>

          {transferStatus && (
            <p className="text-xs font-mono font-black text-[#00f0ff] uppercase">{transferStatus}</p>
          )}
        </div>
      </div>

      {/* Account Restoration Tool Card */}
      <div className="bg-[#141419] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#ccff00] space-y-4">
        <h3 className="text-lg font-black text-white font-mono uppercase flex items-center gap-2 tracking-tight border-b-2 border-white pb-3">
          <RefreshCw className="w-5 h-5 text-[#ccff00] stroke-[3]" />
          <span>RESTORE ACCOUNT FROM 12-WORD SEED PHRASE</span>
        </h3>
        <p className="text-xs text-slate-300 font-mono">
          ENTERING A VALID 12-WORD SEED PHRASE WILL DECRYPT AND RECONSTRUCT YOUR WALLET ADDRESS, BALANCES, AND TRANSACTION LOG.
        </p>

        <div className="space-y-3">
          <textarea
            rows={2}
            placeholder="PASTE YOUR 12 WORDS SEPARATED BY SPACES..."
            value={importWords}
            onChange={(e) => setImportWords(e.target.value)}
            className="w-full bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white font-mono focus:outline-none"
          />

          <button
            onClick={handleRestoreAccount}
            className="px-6 py-2.5 bg-[#ccff00] text-black font-mono font-black border-2 border-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] cursor-pointer"
          >
            IMPORT & RESTORE WALLET
          </button>

          {restoreStatus && (
            <p className="text-xs font-mono font-black text-[#ccff00] mt-2 uppercase">{restoreStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
};
