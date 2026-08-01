import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Smartphone,
  CheckCircle2,
  Copy,
  ArrowRight,
  HardDrive,
  RefreshCw,
  QrCode,
  Globe,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface OnboardingAuthModalProps {
  onClose: () => void;
}

export const OnboardingAuthModal: React.FC<OnboardingAuthModalProps> = ({ onClose }) => {
  const { seedPhrase, restoreWalletFromSeed } = useWallet();
  const [step, setStep] = useState<
    'splash' | 'welcome' | 'createName' | 'createSeed' | 'createVerify' | 'importWallet' | 'login'
  >('splash');

  const [walletNameInput, setWalletNameInput] = useState('My Brutalist Vault');
  const [importType, setImportType] = useState<'seed' | 'privateKey' | 'keystore' | 'walletConnect'>('seed');
  const [importText, setImportText] = useState('');
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const [quizWord3, setQuizWord3] = useState('');
  const [quizVerified, setQuizVerified] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#141419] border-4 border-white p-6 sm:p-8 max-w-xl w-full shadow-[12px_12px_0px_0px_#ccff00] relative space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar font-mono">
        {/* Header with Exit button */}
        <div className="flex items-center justify-between border-b-2 border-white pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#ff007f] text-white text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
              ONBOARDING & AUTH SIMULATOR
            </span>
            <span className="text-white font-black text-xs uppercase">{step.toUpperCase()} STEP</span>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 bg-[#ff007f] text-white font-black border-2 border-black cursor-pointer hover:bg-[#ff3399]"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* 1. Splash Screen */}
        {step === 'splash' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-[#ccff00] border-4 border-black text-black text-4xl font-black flex items-center justify-center mx-auto shadow-[6px_6px_0px_0px_#000]">
              ⚡
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">NORTHVEIL</h2>
              <p className="text-xs text-slate-300 mt-2">SECURE EIP-1193 MULTICHAIN HARDWARE & BIOMETRIC VAULT</p>
            </div>

            <div className="p-3 bg-[#0a0a0c] border-2 border-white text-xs text-[#ccff00]">
              NETWORK STATUS: MAINNET ONLINE (LATENCY 14ms) • EIP-712 VERIFIED
            </div>

            <button
              onClick={() => setStep('welcome')}
              className="w-full py-4 bg-[#ccff00] text-black font-black text-sm uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer"
            >
              LAUNCH WELCOME SCREEN →
            </button>
          </div>
        )}

        {/* 2. Welcome Screen */}
        {step === 'welcome' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-white uppercase">WELCOME TO NORTHVEIL</h3>
              <p className="text-xs text-slate-300">SELECT AN ONBOARDING METHOD TO INITIALIZE YOUR CRYPTO VAULT.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setStep('createName')}
                className="w-full p-4 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer flex items-center justify-between"
              >
                <span>CREATE NEW WALLET</span>
                <span>→</span>
              </button>

              <button
                onClick={() => setStep('importWallet')}
                className="w-full p-4 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#33f3ff] cursor-pointer flex items-center justify-between"
              >
                <span>IMPORT EXISTING WALLET (SEED / KEY / CONNECT)</span>
                <span>→</span>
              </button>

              <button
                onClick={() => setStep('login')}
                className="w-full p-4 bg-[#ff007f] text-white font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#ff3399] cursor-pointer flex items-center justify-between"
              >
                <span>BIOMETRIC / PASSWORD LOGIN</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Create Wallet - Name */}
        {step === 'createName' && (
          <div className="space-y-5">
            <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2">STEP 1: CHOOSE WALLET NAME</h3>
            <div>
              <label className="text-xs text-slate-300">WALLETS IDENTIFIER LABEL:</label>
              <input
                type="text"
                value={walletNameInput}
                onChange={(e) => setWalletNameInput(e.target.value)}
                className="w-full mt-2 bg-[#0a0a0c] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none"
              />
            </div>

            <button
              onClick={() => setStep('createSeed')}
              className="w-full py-3.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer"
            >
              GENERATE RECOVERY SEED PHRASE →
            </button>
          </div>
        )}

        {/* 4. Create Wallet - Seed Display */}
        {step === 'createSeed' && (
          <div className="space-y-5">
            <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2">STEP 2: 12-WORD SEED PHRASE</h3>
            <p className="text-xs text-[#ff007f] font-black uppercase">⚠️ WRITE DOWN THESE 12 WORDS IN PHYSICAL ORDER ON PAPER!</p>

            <div className="grid grid-cols-3 gap-2">
              {seedPhrase.map((word, idx) => (
                <div key={idx} className="bg-[#0a0a0c] p-2 border border-white text-xs text-[#ccff00] font-black">
                  {idx + 1}. {word}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('createVerify')}
              className="w-full py-3.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer"
            >
              I HAVE SAVED IT. VERIFY SEED →
            </button>
          </div>
        )}

        {/* 5. Create Wallet - Verify */}
        {step === 'createVerify' && (
          <div className="space-y-5">
            <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2">STEP 3: SEED VERIFICATION</h3>
            <div>
              <label className="text-xs text-slate-300">ENTER WORD #3 FROM YOUR PHRASE:</label>
              <input
                type="text"
                placeholder="TYPE 3RD WORD..."
                value={quizWord3}
                onChange={(e) => setQuizWord3(e.target.value)}
                className="w-full mt-2 bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                if (quizWord3.toLowerCase().trim() === seedPhrase[2].toLowerCase()) {
                  setQuizVerified(true);
                } else {
                  alert('Incorrect 3rd word! Try again.');
                }
              }}
              className="w-full py-3.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer"
            >
              VERIFY WORD
            </button>

            {quizVerified && (
              <div className="p-4 bg-[#0a0a0c] border-2 border-[#ccff00] text-xs text-[#ccff00] font-black text-center space-y-3">
                <div>✓ WALLET CREATION COMPLETED SUCCESSFULLY!</div>
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-[#ccff00] text-black border-2 border-black font-black text-xs uppercase cursor-pointer"
                >
                  ENTER DASHBOARD NOW
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. Import Wallet */}
        {step === 'importWallet' && (
          <div className="space-y-5">
            <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2">IMPORT EXISTING WALLET</h3>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'seed', label: 'SEED PHRASE' },
                { id: 'privateKey', label: 'PRIVATE KEY' },
                { id: 'keystore', label: 'KEYSTORE FILE' },
                { id: 'walletConnect', label: 'WALLETCONNECT' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setImportType(t.id as any)}
                  className={`px-3 py-1.5 text-xs font-black uppercase border-2 ${
                    importType === t.id ? 'bg-[#00f0ff] text-black border-black' : 'bg-[#0a0a0c] text-white border-white/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              placeholder={`ENTER YOUR 12-WORD SEED / PRIVATE KEY / METADATA...`}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white focus:outline-none"
            />

            <button
              onClick={() => {
                setImportSuccess('Wallet credentials validated & encrypted in Local SecureEnclave!');
                setTimeout(() => onClose(), 1200);
              }}
              className="w-full py-3.5 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer"
            >
              CONFIRM & IMPORT
            </button>

            {importSuccess && <div className="p-3 bg-[#0a0a0c] border border-white text-xs text-[#ccff00] font-black">{importSuccess}</div>}
          </div>
        )}

        {/* 7. Login */}
        {step === 'login' && (
          <div className="space-y-5 text-center">
            <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2">AUTHENTICATION LOGIN</h3>
            <p className="text-xs text-slate-300">TOUCH FINGERPRINT OR ENTER PIN FOR AUTHENTICATION.</p>

            <button
              onClick={() => {
                alert('Biometric scanner activated. Authentication success!');
                onClose();
              }}
              className="w-full py-4 bg-[#ff007f] text-white font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#ff3399] cursor-pointer"
            >
              AUTHENTICATE WITH TOUCH ID / FACE ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
