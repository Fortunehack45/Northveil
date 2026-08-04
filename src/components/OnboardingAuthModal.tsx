import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  Copy,
  ArrowRight,
  AlertTriangle,
  Zap,
  Shield,
  Wallet,
  ArrowLeft,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { WalletService } from '../services/WalletService';
import { SUPPORTED_CHAINS } from '../data/initialData';
import { NetworkId } from '../types';

interface OnboardingAuthModalProps {
  onClose: () => void;
}

/* ═══════════════════════════════════════════════
   Motion Variants — Cinematic Transition Presets
   ═══════════════════════════════════════════════ */
const backdropVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariant = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300, mass: 0.8 },
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
};

const stepVariant = {
  initial: { opacity: 0, x: 60, filter: 'blur(4px)' },
  animate: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { type: 'spring', damping: 28, stiffness: 320, mass: 0.7 },
  },
  exit: {
    opacity: 0, x: -60, filter: 'blur(4px)',
    transition: { duration: 0.2 },
  },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const staggerChild = {
  initial: { opacity: 0, y: 14, scale: 0.95 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
};

const floatAnimation = {
  y: [0, -8, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

const pulseGlow = {
  boxShadow: [
    '0 0 0 0 rgba(204,255,0,0.4)',
    '0 0 24px 8px rgba(204,255,0,0.15)',
    '0 0 0 0 rgba(204,255,0,0.4)',
  ],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

/* ═══════════════════════════════════════════
   Particle Field Component
   ═══════════════════════════════════════════ */
const ParticleField: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: Math.random() * 4 + 1,
          height: Math.random() * 4 + 1,
          background: ['#ccff00', '#00f0ff', '#ff007f', '#9d00ff'][i % 4],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -(Math.random() * 80 + 30)],
          x: [0, (Math.random() - 0.5) * 40],
          opacity: [0, 0.8, 0],
          scale: [0.5, 1, 0.3],
        }}
        transition={{
          duration: Math.random() * 4 + 3,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: 'easeOut',
        }}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════
   Rotating Ring Component
   ═══════════════════════════════════════════ */
const RotatingRing: React.FC<{ size?: number; color?: string }> = ({ size = 96, color = '#ccff00' }) => (
  <motion.div
    className="absolute"
    style={{ width: size, height: size }}
    animate={{ rotate: 360 }}
    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
  >
    <div
      className="w-full h-full rounded-full border-2 border-dashed"
      style={{ borderColor: `${color}40` }}
    />
  </motion.div>
);

export const OnboardingAuthModal: React.FC<OnboardingAuthModalProps> = ({ onClose }) => {
  const { seedPhrase, setSeedPhrase, restoreWalletFromSeed, createSubWallet, renameSubWallet, setActiveChain, setupVault } = useWallet();
  const [selectedChain, setSelectedChain] = useState<NetworkId>('ethereum');
  const [step, setStep] = useState<
    'splash' | 'welcome' | 'createName' | 'createSeed' | 'createVerify' | 'createVault' | 'importWallet' | 'login' | 'processing'
  >('splash');
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const [walletNameInput, setWalletNameInput] = useState('My Northveil Vault');
  const [vaultPassword, setVaultPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [importType, setImportType] = useState<'seed' | 'privateKey' | 'keystore' | 'walletConnect'>('seed');
  const [importText, setImportText] = useState('');
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const [quizWord3, setQuizWord3] = useState('');
  const [quizWord7, setQuizWord7] = useState('');
  const [quizVerified, setQuizVerified] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  const goForward = (newStep: typeof step) => { setDirection(1); setStep(newStep); };
  const goBack = (newStep: typeof step) => { setDirection(-1); setStep(newStep); };

  const handleCopySeed = () => {
    if (seedPhrase.length > 0) {
      navigator.clipboard.writeText(seedPhrase.join(' '));
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    }
  };

  const handleCreateWallet = async () => {
    goForward('processing');
    setProcessingProgress(0);
    setProcessingMsg('GENERATING BIP-39 MNEMONIC...');

    await new Promise(r => setTimeout(r, 600));
    setProcessingProgress(25);
    try {
      const newSeed = WalletService.generateSeedPhrase();
      if (!newSeed || newSeed.length < 12) {
        alert('Generated seed is invalid!');
        goBack('createName');
        return;
      }
      setProcessingMsg('DERIVING HD KEY PATHS...');
      setProcessingProgress(50);
      await new Promise(r => setTimeout(r, 500));

      setProcessingMsg('INITIALIZING VAULT KEYCHAIN...');
      setProcessingProgress(80);
      await new Promise(r => setTimeout(r, 400));

      setProcessingProgress(100);
      setSeedPhrase(newSeed);
      await new Promise(r => setTimeout(r, 200));
      goForward('createSeed');
    } catch (e: any) {
      alert('SEED GEN ERROR: ' + e.message);
      goBack('createName');
    }
  };

  const handleVerifySeed = () => {
    setQuizError('');
    if (quizWord3.toLowerCase().trim() !== seedPhrase[2]) {
      setQuizError(`Word #3 is incorrect.`);
      return;
    }
    if (quizWord7.toLowerCase().trim() !== seedPhrase[6]) {
      setQuizError(`Word #7 is incorrect.`);
      return;
    }
    setQuizVerified(true);
  };

  const handleFinalizeVault = async () => {
    if (vaultPassword.length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }
    goForward('processing');
    setProcessingProgress(0);
    setProcessingMsg('ENCRYPTING SEED WITH AES-256-GCM...');
    await new Promise(r => setTimeout(r, 600));
    setProcessingProgress(20);

    const success = setupVault(seedPhrase, vaultPassword);
    if (!success) { alert('Vault setup failed!'); goBack('createVault'); return; }

    setProcessingMsg('DERIVING MULTI-CHAIN ADDRESSES...');
    setProcessingProgress(45);
    await new Promise(r => setTimeout(r, 500));

    setProcessingMsg('INITIALIZING ON-CHAIN INDEXERS...');
    setProcessingProgress(70);
    await new Promise(r => setTimeout(r, 400));

    const restored = restoreWalletFromSeed(seedPhrase);
    if (restored) {
      renameSubWallet('acc-0', walletNameInput);
      setActiveChain(selectedChain);
      setProcessingMsg('VAULT SECURED — ENTERING DASHBOARD...');
      setProcessingProgress(100);
      await new Promise(r => setTimeout(r, 600));
      onClose();
    } else {
      alert('Wallet restoration failed!');
      goBack('createVault');
    }
  };

  const handleImportWallet = () => {
    if (importType === 'seed') {
      const words = importText.trim().split(/[\s,]+/).filter(w => w.length > 0).map(w => w.toLowerCase());
      if (words.length >= 12) {
        const isValid = WalletService.validateSeedPhrase(words);
        if (!isValid) { alert('Invalid BIP-39 Seed Phrase! Checksum validation failed.'); return; }
        setSeedPhrase(words);
        goForward('createVault');
      } else {
        alert('Must be at least 12 words.');
      }
    } else {
      alert('Only Seed Phrase import is supported in v1.');
    }
  };

  const stepProgress: Record<string, number> = {
    splash: 0, welcome: 10, createName: 25, createSeed: 45, createVerify: 60, createVault: 80, importWallet: 40, login: 90, processing: 95,
  };

  const dynamicStepVariant = {
    initial: { opacity: 0, x: direction * 60, filter: 'blur(4px)' },
    animate: {
      opacity: 1, x: 0, filter: 'blur(0px)',
      transition: { type: 'spring', damping: 28, stiffness: 320, mass: 0.7 },
    },
    exit: {
      opacity: 0, x: direction * -60, filter: 'blur(4px)',
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
        variants={backdropVariant}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <ParticleField />

        <motion.div
          className="bg-[#141419] border-4 border-white max-w-xl w-full shadow-[12px_12px_0px_0px_#ccff00] relative max-h-[90vh] overflow-y-auto no-scrollbar font-mono z-10"
          variants={modalVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Animated Progress Bar */}
          <div className="h-1.5 bg-[#0a0a0c] w-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ccff00] via-[#00f0ff] to-[#ff007f]"
              animate={{ width: `${stepProgress[step] || 0}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className="p-6 sm:p-8">
            {/* Header */}
            <motion.div
              className="flex items-center justify-between border-b-2 border-white pb-3 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                {step !== 'splash' && step !== 'welcome' && step !== 'processing' && (
                  <motion.button
                    onClick={() => {
                      if (step === 'createName' || step === 'importWallet' || step === 'login') goBack('welcome');
                      else if (step === 'createSeed') goBack('createName');
                      else if (step === 'createVerify') goBack('createSeed');
                      else if (step === 'createVault') goBack('createVerify');
                    }}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.button>
                )}
                <span className="px-2 py-0.5 bg-[#ff007f] text-white text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                  {step === 'splash' ? 'NORTHVEIL' : step === 'processing' ? 'PROCESSING' : 'ONBOARDING'}
                </span>
              </div>
              <motion.button
                onClick={onClose}
                className="px-2 py-1 bg-[#ff007f] text-white font-black text-xs border-2 border-black cursor-pointer hover:bg-[#ff3399]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✕
              </motion.button>
            </motion.div>

            {/* ═══════════ STEP CONTENT ═══════════ */}
            <AnimatePresence mode="wait" custom={direction}>
              {/* 1. SPLASH */}
              {step === 'splash' && (
                <motion.div
                  key="splash"
                  variants={dynamicStepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-center py-6 space-y-7"
                >
                  {/* Animated Logo */}
                  <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
                    <RotatingRing size={112} />
                    <motion.div
                      className="w-20 h-20 bg-[#000] border-4 border-[#ccff00] text-black font-black flex items-center justify-center shadow-[6px_6px_0px_0px_#ccff00] z-10 rounded-xl overflow-hidden p-2"
                      animate={{ ...floatAnimation, ...pulseGlow }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <img src="/logo.png" alt="Northveil Logo" className="w-full h-full object-contain" />
                    </motion.div>
                  </div>

                  <div>
                    <motion.h2
                      className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 20 }}
                    >
                      NORTHVEIL
                    </motion.h2>
                    <motion.p
                      className="text-[11px] text-slate-400 mt-2 max-w-sm mx-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      MILITARY-GRADE MULTICHAIN HARDWARE & BIOMETRIC VAULT
                    </motion.p>
                  </div>

                  {/* Feature Pills */}
                  <motion.div
                    className="flex flex-wrap justify-center gap-2"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {[
                      { icon: <Shield className="w-3 h-3" />, text: 'AES-256 ENCRYPTED' },
                      { icon: <Globe className="w-3 h-3" />, text: '8 CHAINS SUPPORTED' },
                      { icon: <Sparkles className="w-3 h-3" />, text: 'AI POWERED' },
                    ].map((feat, i) => (
                      <motion.span
                        key={i}
                        variants={staggerChild}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0a0a0c] border border-white/30 text-[10px] text-[#ccff00] font-bold"
                      >
                        {feat.icon} {feat.text}
                      </motion.span>
                    ))}
                  </motion.div>

                  {/* Network Status */}
                  <motion.div
                    className="p-3 bg-[#0a0a0c] border-2 border-white/20 text-xs text-[#00f0ff] font-bold overflow-hidden relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="relative z-10">
                      <motion.span
                        className="inline-block w-2 h-2 rounded-full bg-[#ccff00] mr-2"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      MAINNET ONLINE • EIP-712 VERIFIED • LATENCY 14ms
                    </span>
                  </motion.div>

                  <motion.button
                    onClick={() => goForward('welcome')}
                    className="w-full py-4 bg-[#ccff00] text-black font-black text-sm uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                    whileHover={{ scale: 1.02, backgroundColor: '#d8ff33' }}
                    whileTap={{ scale: 0.98, x: 2, y: 2, boxShadow: '0 0 0 0 #000' }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    INITIALIZE SECURE VAULT →
                  </motion.button>
                </motion.div>
              )}

              {/* 2. WELCOME */}
              {step === 'welcome' && (
                <motion.div
                  key="welcome"
                  variants={dynamicStepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="text-center space-y-3">
                    <motion.div
                      className="w-14 h-14 mx-auto bg-gradient-to-br from-[#ccff00] to-[#00f0ff] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    >
                      <Wallet className="w-7 h-7 text-black stroke-[2.5]" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">WELCOME TO NORTHVEIL</h3>
                    <p className="text-xs text-slate-400">SELECT AN ONBOARDING METHOD TO INITIALIZE YOUR CRYPTO VAULT.</p>
                  </div>

                  <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
                    {[
                      { id: 'create', label: 'CREATE NEW WALLET', desc: 'GENERATE A NEW 12-WORD SEED PHRASE', icon: <Zap className="w-5 h-5 text-black stroke-[2.5]" />, color: '#ccff00', onClick: () => goForward('createName') },
                      { id: 'import', label: 'IMPORT EXISTING WALLET', desc: 'RESTORE FROM SEED PHRASE', icon: <KeyRound className="w-5 h-5 text-black stroke-[2.5]" />, color: '#00f0ff', onClick: () => goForward('importWallet') },
                      { id: 'login', label: 'BIOMETRIC / PASSWORD LOGIN', desc: 'UNLOCK WITH TOUCH ID / FACE ID', icon: <Fingerprint className="w-5 h-5 text-white stroke-[2.5]" />, color: '#ff007f', onClick: () => goForward('login') },
                    ].map((item) => (
                      <motion.button
                        key={item.id}
                        variants={staggerChild}
                        onClick={item.onClick}
                        className="w-full p-5 bg-[#0a0a0c] border-2 border-white text-left group cursor-pointer transition-colors"
                        whileHover={{ borderColor: item.color, boxShadow: `4px 4px 0px 0px ${item.color}`, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div
                              className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]"
                              style={{ backgroundColor: item.color }}
                              whileHover={{ scale: 1.15, rotate: 5 }}
                            >
                              {item.icon}
                            </motion.div>
                            <div>
                              <span className="text-sm font-black text-white uppercase block">{item.label}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{item.desc}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" style={{ color: item.color }} />
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* 3. CREATE — NAME & CHAIN */}
              {step === 'createName' && (
                <motion.div
                  key="createName"
                  variants={dynamicStepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-5"
                >
                  <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2 flex items-center gap-2">
                    <span className="w-7 h-7 bg-[#ccff00] text-black text-xs font-black flex items-center justify-center border border-black">1</span>
                    CHOOSE WALLET DETAILS
                  </h3>

                  <div>
                    <label className="text-xs text-slate-300 mb-2 block font-bold uppercase">PRIMARY BLOCKCHAIN NETWORK:</label>
                    <motion.div className="grid grid-cols-2 gap-2 mb-4" variants={staggerContainer} initial="initial" animate="animate">
                      {SUPPORTED_CHAINS.filter(c => !c.isCustom && !c.isTestnet).slice(0, 8).map((chain) => (
                        <motion.button
                          key={chain.id}
                          variants={staggerChild}
                          onClick={() => setSelectedChain(chain.id)}
                          className={`flex items-center gap-2 p-2.5 border-2 text-xs font-black uppercase cursor-pointer transition-all ${
                            selectedChain === chain.id
                              ? 'border-[#ccff00] bg-[#ccff00] text-black shadow-[2px_2px_0px_0px_#000]'
                              : 'border-white/20 bg-[#0a0a0c] text-white hover:border-white/60'
                          }`}
                          whileTap={{ scale: 0.96 }}
                        >
                          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                            {chain.icon.startsWith('http') ? (
                              <img src={chain.icon} alt={chain.symbol} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-sm">{chain.icon}</span>
                            )}
                          </div>
                          <span className="truncate">{chain.name}</span>
                        </motion.button>
                      ))}
                    </motion.div>

                    <label className="text-xs text-slate-300 font-bold uppercase">WALLET IDENTIFIER:</label>
                    <input
                      type="text"
                      value={walletNameInput}
                      onChange={(e) => setWalletNameInput(e.target.value)}
                      className="w-full mt-2 bg-[#0a0a0c] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none focus:border-[#ccff00] transition-colors"
                    />
                  </div>

                  <motion.button
                    onClick={handleCreateWallet}
                    className="w-full py-3.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, backgroundColor: '#d8ff33' }}
                    whileTap={{ scale: 0.98, x: 2, y: 2, boxShadow: '0 0 0 0 #000' }}
                  >
                    <Zap className="w-4 h-4 stroke-[3]" /> GENERATE RECOVERY SEED PHRASE
                  </motion.button>
                </motion.div>
              )}

              {/* 4. CREATE — SEED DISPLAY */}
              {step === 'createSeed' && (
                <motion.div
                  key="createSeed"
                  variants={dynamicStepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-5"
                >
                  <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2 flex items-center gap-2">
                    <span className="w-7 h-7 bg-[#ccff00] text-black text-xs font-black flex items-center justify-center border border-black">2</span>
                    12-WORD RECOVERY PHRASE
                  </h3>

                  {/* Warning */}
                  <motion.div
                    className="flex items-start gap-3 p-3 bg-[#ff007f]/10 border-2 border-[#ff007f]"
                    animate={{ borderColor: ['#ff007f', '#00f0ff', '#ff007f'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <AlertTriangle className="w-5 h-5 text-[#ff007f] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#ff007f] font-black uppercase">CRITICAL SECURITY WARNING</p>
                      <p className="text-[10px] text-slate-300 mt-0.5">WRITE THESE 12 WORDS DOWN ON PAPER. NEVER SHARE THEM. ANYONE WITH THESE WORDS CAN ACCESS YOUR FUNDS.</p>
                    </div>
                  </motion.div>

                  {/* Seed Words */}
                  <motion.div className="grid grid-cols-3 gap-2" variants={staggerContainer} initial="initial" animate="animate">
                    {seedPhrase.map((word, idx) => (
                      <motion.div
                        key={idx}
                        variants={staggerChild}
                        className="bg-[#0a0a0c] p-2.5 border-2 border-white/40 text-xs text-[#ccff00] font-black flex items-center gap-2"
                        whileHover={{ borderColor: '#ccff00', scale: 1.03 }}
                      >
                        <span className="text-slate-500 text-[10px] w-4 text-right">{idx + 1}.</span>
                        <span>{word}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Copy */}
                  <motion.button
                    onClick={handleCopySeed}
                    className={`w-full py-2.5 border-2 text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      copiedSeed ? 'bg-[#ccff00] text-black border-black' : 'bg-[#0a0a0c] text-slate-300 border-white/40 hover:border-white'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {copiedSeed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedSeed ? 'COPIED!' : 'COPY SEED PHRASE'}
                  </motion.button>

                  <motion.button
                    onClick={() => goForward('createVerify')}
                    className="w-full py-3.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98, x: 2, y: 2 }}
                  >
                    <ShieldCheck className="w-4 h-4 stroke-[3]" /> I SAVED IT — VERIFY SEED
                  </motion.button>
                </motion.div>
              )}

              {/* 5. CREATE — VERIFY */}
              {step === 'createVerify' && (
                <motion.div
                  key="createVerify"
                  variants={dynamicStepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-5"
                >
                  <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2 flex items-center gap-2">
                    <span className="w-7 h-7 bg-[#ccff00] text-black text-xs font-black flex items-center justify-center border border-black">3</span>
                    SEED VERIFICATION
                  </h3>
                  <p className="text-xs text-slate-400">CONFIRM YOU SAVED YOUR PHRASE BY ENTERING THE CORRECT WORDS.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[#00f0ff] font-black uppercase mb-1.5 block">WORD #3:</label>
                      <input type="text" placeholder="TYPE 3RD WORD..." value={quizWord3}
                        onChange={(e) => { setQuizWord3(e.target.value); setQuizError(''); }}
                        className="w-full bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] transition-colors"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#00f0ff] font-black uppercase mb-1.5 block">WORD #7:</label>
                      <input type="text" placeholder="TYPE 7TH WORD..." value={quizWord7}
                        onChange={(e) => { setQuizWord7(e.target.value); setQuizError(''); }}
                        className="w-full bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] transition-colors"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {quizError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-[#ff007f]/10 border-2 border-[#ff007f] text-xs text-[#ff007f] font-black flex items-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0" /> {quizError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    onClick={handleVerifySeed}
                    disabled={quizVerified}
                    className="w-full py-3.5 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    VERIFY WORDS
                  </motion.button>

                  <AnimatePresence>
                    {quizVerified && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="p-4 bg-[#0a0a0c] border-2 border-[#ccff00] text-center space-y-3"
                      >
                        <motion.div
                          className="flex items-center justify-center gap-2 text-[#ccff00] font-black text-sm"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                        >
                          <CheckCircle2 className="w-5 h-5" /> SEED VERIFIED!
                        </motion.div>
                        <motion.button
                          onClick={() => goForward('createVault')}
                          className="w-full py-3 bg-[#ccff00] text-black border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
                          whileTap={{ scale: 0.98 }}
                        >
                          <Lock className="w-4 h-4 stroke-[3]" /> SECURE VAULT NOW
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* 6. VAULT PASSWORD */}
              {step === 'createVault' && (
                <motion.div
                  key="createVault"
                  variants={dynamicStepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-5"
                >
                  <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2 flex items-center gap-2">
                    <span className="w-7 h-7 bg-[#ccff00] text-black text-xs font-black flex items-center justify-center border border-black">4</span>
                    ENCRYPT YOUR VAULT
                  </h3>

                  <div className="flex items-center justify-center py-4">
                    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
                      <RotatingRing size={80} color="#00f0ff" />
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-[#ccff00] to-[#00f0ff] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] z-10"
                        animate={pulseGlow}
                        whileHover={{ scale: 1.1, rotateY: 15 }}
                      >
                        <Lock className="w-8 h-8 text-black stroke-[2.5]" />
                      </motion.div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 text-center">
                    CREATE A SECURE PASSWORD TO ENCRYPT YOUR SEED PHRASE LOCALLY.
                  </p>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="ENTER SECURE PASSWORD (MIN 4 CHARS)"
                      value={vaultPassword}
                      onChange={(e) => setVaultPassword(e.target.value)}
                      className="w-full bg-[#0a0a0c] border-2 border-white p-3 pr-10 text-xs text-white focus:outline-none focus:border-[#ccff00] transition-colors"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength Bar */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <motion.div
                        key={i}
                        className="h-1.5 flex-1"
                        animate={{
                          backgroundColor: vaultPassword.length >= i * 2
                            ? i <= 1 ? '#ff007f' : i <= 2 ? '#ffe600' : '#ccff00'
                            : 'rgba(255,255,255,0.1)',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                    <span className="text-[10px] text-slate-400 font-bold">
                      {vaultPassword.length < 4 ? 'WEAK' : vaultPassword.length < 8 ? 'MEDIUM' : 'STRONG'}
                    </span>
                  </div>

                  <motion.button
                    onClick={handleFinalizeVault}
                    disabled={vaultPassword.length < 4}
                    className={`w-full py-3.5 font-black text-xs uppercase border-2 border-black cursor-pointer flex items-center justify-center gap-2 ${
                      vaultPassword.length >= 4
                        ? 'bg-[#ccff00] text-black shadow-[4px_4px_0px_0px_#000]'
                        : 'bg-[#333] text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                    whileHover={vaultPassword.length >= 4 ? { scale: 1.02 } : {}}
                    whileTap={vaultPassword.length >= 4 ? { scale: 0.98 } : {}}
                  >
                    <ShieldCheck className="w-4 h-4 stroke-[3]" /> ENCRYPT & ENTER DASHBOARD
                  </motion.button>
                </motion.div>
              )}

              {/* 7. IMPORT WALLET */}
              {step === 'importWallet' && (
                <motion.div
                  key="importWallet"
                  variants={dynamicStepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-5"
                >
                  <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#00f0ff]" /> IMPORT EXISTING WALLET
                  </h3>

                  <motion.div className="flex flex-wrap gap-2" variants={staggerContainer} initial="initial" animate="animate">
                    {[
                      { id: 'seed', label: 'SEED PHRASE' },
                      { id: 'privateKey', label: 'PRIVATE KEY (SOON)' },
                      { id: 'keystore', label: 'KEYSTORE (SOON)' },
                      { id: 'walletConnect', label: 'WALLETCONNECT (SOON)' },
                    ].map((t) => (
                      <motion.button
                        key={t.id}
                        variants={staggerChild}
                        onClick={() => setImportType(t.id as any)}
                        className={`px-3 py-1.5 text-xs font-black uppercase border-2 cursor-pointer ${
                          importType === t.id ? 'bg-[#00f0ff] text-black border-black shadow-[2px_2px_0px_0px_#000]' : 'bg-[#0a0a0c] text-white/60 border-white/20'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {t.label}
                      </motion.button>
                    ))}
                  </motion.div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-bold uppercase block">ENTER YOUR 12 OR 24-WORD SEED PHRASE:</label>
                    <textarea
                      rows={4}
                      placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      className="w-full bg-[#0a0a0c] border-2 border-white p-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] transition-colors resize-none"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <span>WORDS: {importText.trim().split(/[\s,]+/).filter(w => w.length > 0).length} / 12</span>
                      <span className="text-[#00f0ff]">BIP-39</span>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleImportWallet}
                    className="w-full py-3.5 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <KeyRound className="w-4 h-4 stroke-[3]" /> VALIDATE & IMPORT
                  </motion.button>

                  <AnimatePresence>
                    {importSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3 bg-[#0a0a0c] border-2 border-[#ccff00] text-xs text-[#ccff00] font-black flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {importSuccess}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* 8. BIOMETRIC LOGIN */}
              {step === 'login' && (
                <motion.div
                  key="login"
                  variants={dynamicStepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6 text-center py-4"
                >
                  <h3 className="text-xl font-black text-white uppercase border-b-2 border-white pb-2">AUTHENTICATION</h3>

                  <motion.div animate={floatAnimation}>
                    <motion.div
                      className="w-20 h-20 mx-auto bg-gradient-to-br from-[#ff007f] to-[#9d00ff] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]"
                      animate={pulseGlow}
                    >
                      <Fingerprint className="w-10 h-10 text-white stroke-[1.5]" />
                    </motion.div>
                  </motion.div>

                  <p className="text-xs text-slate-400">TOUCH FINGERPRINT SENSOR OR ENTER PIN.</p>

                  <motion.button
                    onClick={() => { alert('Biometric authentication success!'); onClose(); }}
                    className="w-full py-4 bg-[#ff007f] text-white font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, backgroundColor: '#ff3399' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Fingerprint className="w-4 h-4 stroke-[3]" /> AUTHENTICATE WITH TOUCH ID
                  </motion.button>
                </motion.div>
              )}

              {/* 9. PROCESSING */}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  variants={dynamicStepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-center py-10 space-y-6"
                >
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <RotatingRing size={96} />
                    <motion.div
                      className="w-16 h-16 bg-[#0a0a0c] border-2 border-[#ccff00] rounded-full flex items-center justify-center z-10"
                      animate={pulseGlow}
                    >
                      <Loader2 className="w-8 h-8 text-[#ccff00] animate-spin" />
                    </motion.div>
                  </div>

                  <div className="space-y-3">
                    <motion.p
                      className="text-sm font-black text-white uppercase"
                      key={processingMsg}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {processingMsg}
                    </motion.p>

                    <div className="w-56 h-2 mx-auto bg-[#0a0a0c] border border-white/20 overflow-hidden rounded-full">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#ccff00] to-[#00f0ff] rounded-full"
                        animate={{ width: `${processingProgress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-500 font-bold">{processingProgress}% COMPLETE</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
