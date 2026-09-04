import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Lock,
  ShieldCheck,
  Fingerprint,
  Sparkles,
  Key,
  Plus,
  Mail,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { MpcWalletService } from '../services/MpcWalletService';
import { WebAuthnService } from '../services/WebAuthnService';

interface OnboardingAuthModalProps {
  onClose?: () => void;
  isFullscreen?: boolean;
  initialStep?: 'welcome' | 'unlock_passkey' | 'enroll_passkey' | 'create_or_import' | string;
}

function mapAuthNextToModalStep(
  authNext?: string
): 'welcome' | 'unlockPasskey' | 'enrollPasskey' | 'chooseWallet' {
  if (authNext === 'unlock_passkey') return 'unlockPasskey';
  if (authNext === 'enroll_passkey') return 'enrollPasskey';
  if (authNext === 'create_or_import' || authNext === 'chooseWallet') return 'chooseWallet';
  return 'welcome';
}

function explainFetch(err: unknown, url: string): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return `Cannot reach ${url}. Check you are on wallet.northveil.xyz, MCP is up, and CORS allows this origin.`;
  }
  return msg;
}

export const OnboardingAuthModal: React.FC<OnboardingAuthModalProps> = ({
  onClose,
  isFullscreen = false,
  initialStep = 'welcome',
}) => {
  const {
    setupMpcVault,
    setupMpcVaultFromServer,
    setGate,
    setIsVaultConfigured,
    setIsLocked,
  } = useWallet();

  // Log MCP server base URL once on welcome
  useEffect(() => {
    console.info('[nv] mcp', MpcWalletService.getBaseUrl());
  }, []);

  const [step, setStep] = useState<
    | 'welcome'
    | 'emailEnter'
    | 'emailCode'
    | 'unlockPasskey'
    | 'enrollPasskey'
    | 'chooseWallet'
    | 'importWallet'
    | 'createdSuccess'
    | 'processing'
  >(() => mapAuthNextToModalStep(initialStep));

  // Sync initialStep only if user is still on welcome
  useEffect(() => {
    if (initialStep && step === 'welcome') {
      const mapped = mapAuthNextToModalStep(initialStep);
      if (mapped !== 'welcome') {
        setStep(mapped);
      }
    }
  }, [initialStep]);

  // Email OTP state
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(30);

  // Passkey & Wallet state
  const [hasDiscoverablePasskey, setHasDiscoverablePasskey] = useState(false);
  const [walletNameInput, setWalletNameInput] = useState('My Northveil Vault');
  const [createdVaultAddress, setCreatedVaultAddress] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Import state
  const [importWalletName, setImportWalletName] = useState('Primary Vault');
  const [importType, setImportType] = useState<'seed' | 'privateKey'>('seed');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const [processingMsg, setProcessingMsg] = useState('');
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [devNotice, setDevNotice] = useState<string | null>(null);

  const countdownTimerRef = useRef<any>(null);
  const resendTimerRef = useRef<any>(null);

  // Check if device supports platform biometric passkey
  useEffect(() => {
    if (WebAuthnService.isSupported()) {
      if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then((avail) => setHasDiscoverablePasskey(avail))
          .catch(() => setHasDiscoverablePasskey(false));
      } else {
        setHasDiscoverablePasskey(true);
      }
    }
  }, []);

  // Handle incoming OAuth callback params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err === 'GOOGLE_CLIENT_ID_NOT_CONFIGURED') {
      setGoogleNotice(
        'Google OAuth credentials need to be configured in Vercel. You can continue with email or your biometric passkey below!'
      );
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }

    const incomingToken = params.get('sessionToken');
    if (incomingToken) {
      setStep('processing');
      setProcessingMsg('Securing session with Northveil MPC...');
      MpcWalletService.fetchWalletMe(incomingToken)
        .then(async (me) => {
          // Clean URL only AFTER fetch finishes to prevent query loss
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);

          if (me && me.user) {
            MpcWalletService.saveSession(incomingToken, me.user.id, 'mpc');
            if (me.wallets && me.wallets.length > 0) {
              await setupMpcVaultFromServer(me.wallets, incomingToken);
            }
            const next = me.next || (me.wallets?.length ? 'unlock_passkey' : 'enroll_passkey');
            if (next === 'unlock_passkey') {
              if (me.passkeyOk && me.wallets?.length) {
                setIsVaultConfigured(true);
                setIsLocked(false);
                setGate('app');
                if (onClose) onClose();
                return;
              }
              setStep('unlockPasskey');
            } else if (next === 'enroll_passkey') {
              setStep('enrollPasskey');
            } else {
              setStep('chooseWallet');
            }
          } else {
            MpcWalletService.clearSession();
            setGoogleNotice('Authentication session could not be verified. Please sign in again.');
            setStep('welcome');
          }
        })
        .catch((fetchErr: any) => {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          setGoogleNotice(explainFetch(fetchErr, `${MpcWalletService.getBaseUrl()}/wallet/me`));
          setStep('welcome');
        });
    }
  }, []);

  // Countdown timer effect for emailCode step
  useEffect(() => {
    if (step === 'emailCode') {
      setCountdown(300);
      setResendCooldown(30);

      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      clearInterval(resendTimerRef.current);
      resendTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownTimerRef.current);
      clearInterval(resendTimerRef.current);
    }

    return () => {
      clearInterval(countdownTimerRef.current);
      clearInterval(resendTimerRef.current);
    };
  }, [step]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyAddress = () => {
    if (createdVaultAddress) {
      navigator.clipboard.writeText(createdVaultAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleContinueWithGoogle = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUri = window.location.origin + window.location.pathname;
    const mcpBase = MpcWalletService.getBaseUrl();
    window.location.href = `${mcpBase}/auth/google/start?redirect=${encodeURIComponent(redirectUri)}`;
  };

  const parseResponse = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}: ${text.slice(0, 100) || res.statusText}`);
      }
      throw new Error('Received unexpected non-JSON response from server.');
    }
  };

  /**
   * Start Email OTP Flow (POST /auth/email/start)
   */
  const handleSendEmailOtp = async () => {
    setEmailError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setStep('processing');
    setProcessingMsg('Sending 6-digit verification code...');

    try {
      const res = await fetch(`${MpcWalletService.getBaseUrl()}/auth/email/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await parseResponse(res);
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      if (data.devCode) {
        setCode(data.devCode);
        setDevNotice(
          data.deliveryNotice
            ? `${data.deliveryNotice} Your verification code is: ${data.devCode}`
            : `Your verification code is: ${data.devCode}`
        );
      } else {
        setDevNotice(null);
        setCode('');
      }
      setCodeError('');
      setStep('emailCode');
    } catch (err: any) {
      setEmailError(explainFetch(err, `${MpcWalletService.getBaseUrl()}/auth/email/start`));
      setStep('emailEnter');
    }
  };

  /**
   * Verify Email OTP Code (POST /auth/email/verify)
   */
  const handleVerifyEmailCode = async (codeToVerify?: string) => {
    const targetCode = (codeToVerify !== undefined ? codeToVerify : code).trim();
    if (targetCode.length !== 6) {
      setCodeError('Please enter the complete 6-digit code.');
      return;
    }

    setCodeError('');
    setStep('processing');
    setProcessingMsg('Verifying authentication code...');

    try {
      const res = await fetch(`${MpcWalletService.getBaseUrl()}/auth/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: targetCode }),
      });

      const data = await parseResponse(res);
      if (!res.ok) {
        if (data.error === 'OTP_EXPIRED') {
          setEmailError('Your verification code expired (5-minute limit). Please request a new one.');
          setStep('emailEnter');
          return;
        }
        if (data.error === 'OTP_LOCKED') {
          setCodeError('Too many failed attempts (5/5). Code locked. Please request a new one.');
          setStep('emailCode');
          return;
        }
        if (data.error === 'OTP_USED') {
          setCodeError('This code was already used. Please request a new code.');
          setStep('emailCode');
          return;
        }
        setCodeError(data.error || data.message || 'Invalid code. Please check and try again.');
        setStep('emailCode');
        return;
      }

      // Save session identity (never flip isVaultConfigured or gate here)
      MpcWalletService.saveSession(data.sessionToken, data.user?.id, 'mpc');

      // Fetch /wallet/me via canonical MpcWalletService.fetchWalletMe
      try {
        const me = await MpcWalletService.fetchWalletMe(data.sessionToken);
        if (me?.user?.id) {
          MpcWalletService.saveSession(data.sessionToken, me.user.id, 'mpc');
        }
        if (me?.wallets && me.wallets.length > 0) {
          await setupMpcVaultFromServer(me.wallets, data.sessionToken);
        }

        const next = me?.next || (me?.wallets?.length ? 'unlock_passkey' : 'enroll_passkey');
        if (next === 'unlock_passkey') {
          if (me.passkeyOk && me.wallets?.length) {
            setIsVaultConfigured(true);
            setIsLocked(false);
            setGate('app');
            if (onClose) onClose();
            return;
          }
          setStep('unlockPasskey');
        } else if (next === 'enroll_passkey') {
          setStep('enrollPasskey');
        } else {
          setStep('chooseWallet');
        }
      } catch (meErr: any) {
        // Show error on current step without bouncing to welcome
        setCodeError(explainFetch(meErr, `${MpcWalletService.getBaseUrl()}/wallet/me`));
        setStep('emailCode');
      }
    } catch (err: any) {
      setCodeError(explainFetch(err, `${MpcWalletService.getBaseUrl()}/auth/email/verify`));
      setStep('emailCode');
    }
  };

  /**
   * Unlock with Passkey (Returning user flow)
   */
  const handleUnlockPasskey = async () => {
    setPasskeyError('');
    setStep('processing');
    setProcessingMsg('Authenticating with hardware biometric passkey...');

    try {
      const userId = MpcWalletService.getUserId();
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // 1. Begin passkey login options
      const beginRes = await fetch(`${MpcWalletService.getBaseUrl()}/auth/passkey/login/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId || undefined, rpID: isLocal ? 'localhost' : undefined }),
      });
      const options = await parseResponse(beginRes);
      if (!beginRes.ok) throw new Error(options.error || 'Failed to start passkey authentication');

      // 2. Prompt user WebAuthn assertion
      const cred = (await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: WebAuthnService.base64URLToBuffer(options.challenge) as unknown as BufferSource,
          allowCredentials: options.allowCredentials?.map((c: any) => ({
            ...c,
            id: WebAuthnService.base64URLToBuffer(c.id) as unknown as BufferSource,
          })),
        },
      })) as PublicKeyCredential | null;

      if (!cred) throw new Error('Passkey authentication cancelled or returned no credential');

      const getResp = cred.response as AuthenticatorAssertionResponse;
      const loginPayload = {
        credentialId: cred.id,
        response: {
          id: cred.id,
          rawId: WebAuthnService.bufferToBase64URL(cred.rawId),
          type: cred.type,
          clientDataJSON: WebAuthnService.bufferToBase64URL(getResp.clientDataJSON),
          authenticatorData: WebAuthnService.bufferToBase64URL(getResp.authenticatorData),
          signature: WebAuthnService.bufferToBase64URL(getResp.signature),
          userHandle: getResp.userHandle ? WebAuthnService.bufferToBase64URL(getResp.userHandle) : undefined,
        },
      };

      // 3. Complete passkey login on server (returns elevated passkeyOk: true session token)
      const finishRes = await fetch(`${MpcWalletService.getBaseUrl()}/auth/passkey/login/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });
      const finishData = await parseResponse(finishRes);
      if (!finishRes.ok) throw new Error(finishData.error || 'Passkey authentication failed');

      // 4. Save elevated session token
      MpcWalletService.saveSession(finishData.sessionToken, finishData.user?.id, 'mpc');

      // 5. Fetch /wallet/me to load all authentic wallets (primary first)
      const me = await MpcWalletService.fetchWalletMe(finishData.sessionToken);

      if (!me.wallets || me.wallets.length === 0) {
        setStep('chooseWallet');
        return;
      }

      await setupMpcVaultFromServer(me.wallets, finishData.sessionToken);

      // Passkey unlock successful: transition directly to dashboard without lock flash
      setIsVaultConfigured(true);
      setIsLocked(false);
      setGate('app');
      if (onClose) onClose();
    } catch (err: any) {
      setPasskeyError(explainFetch(err, `${MpcWalletService.getBaseUrl()}/auth/passkey/login`));
      setStep('unlockPasskey');
    }
  };

  /**
   * Enroll Biometric Passkey (Mandatory WebAuthn registration)
   */
  const handleEnrollPasskey = async () => {
    setPasskeyError('');
    setStep('processing');
    setProcessingMsg('Prompting biometric passkey enrollment (Touch ID / Face ID / Windows Hello)...');

    try {
      const userId = MpcWalletService.getUserId();
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const token = MpcWalletService.getSessionToken();

      // 1. Begin registration
      const beginRes = await fetch(`${MpcWalletService.getBaseUrl()}/auth/passkey/register/begin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId, rpID: isLocal ? 'localhost' : undefined }),
      });
      const options = await parseResponse(beginRes);
      if (!beginRes.ok) throw new Error(options.error || 'Failed to start passkey registration');

      // 2. Navigator credentials create
      const cred = (await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: WebAuthnService.base64URLToBuffer(options.challenge) as unknown as BufferSource,
          user: {
            ...options.user,
            id: WebAuthnService.base64URLToBuffer(options.user.id) as unknown as BufferSource,
          },
        },
      })) as PublicKeyCredential | null;

      if (!cred) throw new Error('Passkey creation cancelled or returned no credential');

      const regResp = cred.response as AuthenticatorAttestationResponse;
      const registerPayload = {
        userId,
        response: {
          id: cred.id,
          rawId: WebAuthnService.bufferToBase64URL(cred.rawId),
          type: cred.type,
          clientDataJSON: WebAuthnService.bufferToBase64URL(regResp.clientDataJSON),
          attestationObject: WebAuthnService.bufferToBase64URL(regResp.attestationObject),
          transports: (regResp as any).getTransports ? (regResp as any).getTransports() : ['internal', 'hybrid'],
        },
      };

      // 3. Finish registration
      const finishRes = await fetch(`${MpcWalletService.getBaseUrl()}/auth/passkey/register/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(registerPayload),
      });
      const finishData = await parseResponse(finishRes);
      if (!finishRes.ok) throw new Error(finishData.error || 'Passkey registration verification failed');

      // 4. Branch based on /wallet/me: if user already has wallets, load them and go to dashboard
      const sessionToken = MpcWalletService.getSessionToken();
      const me = await MpcWalletService.fetchWalletMe(sessionToken || undefined);

      if (me.wallets && me.wallets.length > 0) {
        await setupMpcVaultFromServer(me.wallets, sessionToken || undefined);
        const primary = me.wallets.find((w: any) => w.is_primary) || me.wallets[0];
        setCreatedVaultAddress(primary.address);
        setStep('createdSuccess');
      } else {
        setStep('chooseWallet');
      }
    } catch (err: any) {
      setPasskeyError(explainFetch(err, `${MpcWalletService.getBaseUrl()}/auth/passkey/register`));
      setStep('enrollPasskey');
    }
  };

  /**
   * Create New Turnkey MPC Wallet
   */
  const handleCreateNewMpcWallet = async () => {
    setPasskeyError('');
    setStep('processing');
    setProcessingMsg('Provisioning Northveil MPC Enclave Vault...');

    try {
      const userId = MpcWalletService.getUserId();
      const token = MpcWalletService.getSessionToken() || '';
      await MpcWalletService.createMpcVault(walletNameInput, userId);

      const me = await MpcWalletService.fetchWalletMe(token);

      if (me.wallets && me.wallets.length > 0) {
        await setupMpcVaultFromServer(me.wallets, token);
        const primary = me.wallets.find((w: any) => w.is_primary) || me.wallets[0];
        setCreatedVaultAddress(primary.address);
      }
      setStep('createdSuccess');
    } catch (err: any) {
      setPasskeyError(explainFetch(err, `${MpcWalletService.getBaseUrl()}/wallet/create`));
      setStep('chooseWallet');
    }
  };

  /**
   * Non-Custodial Enclave Import into Turnkey MPC (Never stored locally)
   */
  const handleImportIntoMpc = async () => {
    setImportError('');
    const clean = importText.trim();
    if (!clean) {
      setImportError('Please enter your mnemonic recovery phrase or hex private key.');
      return;
    }

    setStep('processing');
    setProcessingMsg('Submitting key material non-custodially to Turnkey MPC enclave...');

    try {
      const chosenName = importWalletName.trim() || 'Imported Vault';
      const token = MpcWalletService.getSessionToken() || '';
      await MpcWalletService.importMpcVault(importType, clean, chosenName);

      // Memory wipe of secrets in component state
      setImportText('');

      const me = await MpcWalletService.fetchWalletMe(token);

      if (me.wallets && me.wallets.length > 0) {
        await setupMpcVaultFromServer(me.wallets, token);
        const primary = me.wallets.find((w: any) => w.is_primary) || me.wallets[0];
        setCreatedVaultAddress(primary.address);
      }
      setStep('createdSuccess');
    } catch (err: any) {
      setImportError(explainFetch(err, `${MpcWalletService.getBaseUrl()}/wallet/import`));
      setStep('importWallet');
    } finally {
      // Guaranteed zeroing of recovery secret in state
      setImportText('');
    }
  };

  const cardContent = (
    <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] p-6 sm:p-8 max-w-md w-full rounded-3xl shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
      {/* ─── STEP: WELCOME ────────────────────────────────────────── */}
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

          {googleNotice && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-left space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Notice</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {googleNotice}
              </p>
            </div>
          )}

          {/* Section 1A: Buttons in exact specified order */}
          <div className="space-y-3 pt-2">
            {/* 1. Continue with Google */}
            <button
              onClick={handleContinueWithGoogle}
              className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google <ArrowRight className="w-4 h-4" />
            </button>

            {/* 2. Continue with email */}
            <button
              onClick={() => {
                setEmailError('');
                setStep('emailEnter');
              }}
              className="w-full py-3.5 bg-black/[0.04] dark:bg-white/[0.06] text-zinc-900 dark:text-white font-semibold text-xs rounded-full border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4 text-blue-500" /> Continue with email
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

      {/* ─── STEP: EMAIL ENTER ────────────────────────────────────── */}
      {step === 'emailEnter' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('welcome')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">EMAIL OTP</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Sign In with Email</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              We will send a 6-digit verification code to your inbox (valid for 5 minutes).
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendEmailOtp();
              }}
            />

            {emailError && (
              <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {emailError}
              </div>
            )}

            <button
              onClick={handleSendEmailOtp}
              className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
            >
              Send Code <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP: EMAIL CODE (COUNTDOWN 5:00) ─────────────────────── */}
      {step === 'emailCode' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('emailEnter')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">
              EXPIRES IN: <span className="text-blue-500 font-bold">{formatCountdown(countdown)}</span>
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Enter 6-Digit Code</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Check your inbox at <span className="font-mono text-zinc-900 dark:text-white">{email}</span>.
            </p>
          </div>

          <div className="space-y-4">
            {devNotice && (
              <div className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" /> Verification Code Available
                </div>
                <div className="text-[11px] leading-relaxed text-zinc-300">{devNotice}</div>
              </div>
            )}

            <div className="flex justify-center">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(val);
                  if (val.length === 6) {
                    handleVerifyEmailCode(val);
                  }
                }}
                placeholder="••••••"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-2xl py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {countdown === 0 && (
              <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Verification code expired (5-minute limit). Please request a new code.</span>
              </div>
            )}

            {codeError && (
              <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {codeError}
              </div>
            )}

            <button
              onClick={() => handleVerifyEmailCode()}
              disabled={code.length !== 6 || countdown === 0}
              className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
            >
              Verify Code <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleSendEmailOtp}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP: UNLOCK PASSKEY (RETURNING USER) ─────────────────── */}
      {step === 'unlockPasskey' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('welcome')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">AUTHENTICATE</span>
          </div>

          <div className="text-center space-y-3 py-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Fingerprint className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Unlock Vault with Passkey</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
                Email confirmed. Passkey authentication is required to unlock your non-custodial hardware MPC vaults.
              </p>
            </div>
          </div>

          {passkeyError && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {passkeyError}
            </div>
          )}

          <button
            onClick={handleUnlockPasskey}
            className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4" /> Unlock Vault with Passkey
          </button>
        </div>
      )}

      {/* ─── STEP: ENROLL PASSKEY (NEW ACCOUNT) ────────────────────── */}
      {step === 'enrollPasskey' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">Biometric Passkey Setup</span>
            <span className="text-[10px] font-mono text-zinc-500">STEP 1 OF 2</span>
          </div>

          <div className="text-center space-y-3 py-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Register Your Passkey</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
                Northveil uses WebAuthn biometric passkeys to bind your hardware authenticator to your MPC vault.
              </p>
            </div>
          </div>

          {passkeyError && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {passkeyError}
            </div>
          )}

          <button
            onClick={handleEnrollPasskey}
            className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4" /> Enroll Device Passkey
          </button>
        </div>
      )}

      {/* ─── STEP: CHOOSE WALLET (CREATE VS IMPORT) ────────────────── */}
      {step === 'chooseWallet' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">MPC Vault Configuration</span>
            <span className="text-[10px] font-mono text-zinc-500">STEP 2 OF 2</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Set Up Your Vault</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Choose how you would like to initialize your non-custodial hardware MPC account.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Vault Name</label>
            <input
              type="text"
              value={walletNameInput}
              onChange={(e) => setWalletNameInput(e.target.value)}
              placeholder="e.g. Primary MPC Vault"
              className="w-full bg-black/[0.03] dark:bg-black border border-black/[0.1] dark:border-white/[0.1] rounded-xl p-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {passkeyError && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {passkeyError}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleCreateNewMpcWallet}
              className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create New MPC Wallet
            </button>

            <button
              onClick={() => {
                setImportError('');
                setImportText('');
                setStep('importWallet');
              }}
              className="w-full py-3 bg-black/[0.04] dark:bg-white/[0.06] text-zinc-900 dark:text-white font-medium text-xs rounded-full border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5" /> Import Existing into MPC
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP: IMPORT WALLET (NON-CUSTODIAL ENCLAVE IMPORT) ─────── */}
      {step === 'importWallet' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <button
              onClick={() => setStep('chooseWallet')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-[10px] font-mono text-zinc-500">NON-CUSTODIAL IMPORT</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Import into MPC Enclave</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Key material is forwarded strictly over TLS to Turnkey enclave and wiped from memory. Never stored in Postgres or browser.
            </p>
          </div>

          <div className="flex rounded-xl bg-black/[0.04] dark:bg-white/[0.04] p-1 border border-black/[0.06] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setImportType('seed')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                importType === 'seed'
                  ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Seed Phrase
            </button>
            <button
              type="button"
              onClick={() => setImportType('privateKey')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                importType === 'privateKey'
                  ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
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
              placeholder="e.g. Imported Alpha Vault"
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
            onClick={handleImportIntoMpc}
            className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            Import into MPC <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── STEP: CREATED SUCCESS ─────────────────────────────────── */}
      {step === 'createdSuccess' && (
        <div className="text-center space-y-6 py-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-in zoom-in">
            <Check className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium rounded-full border border-emerald-500/20">
              VAULT ACTIVE & SECURED
            </span>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white pt-1">
              Welcome to Your Control Plane
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
              Your non-custodial hardware MPC vault is active and locked with your biometric passkey.
            </p>
          </div>

          {createdVaultAddress && (
            <div className="p-3 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate pr-2">
                {createdVaultAddress}
              </span>
              <button
                onClick={handleCopyAddress}
                className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                title="Copy Address"
              >
                {copiedAddress ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setIsVaultConfigured(true);
              setIsLocked(false);
              setGate('app');
              if (onClose) onClose();
            }}
            className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
          >
            Enter Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── STEP: PROCESSING ─────────────────────────────────────── */}
      {step === 'processing' && (
        <div className="text-center py-10 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-900 dark:text-white" />
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{processingMsg}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {cardContent}
    </div>
  );
};
