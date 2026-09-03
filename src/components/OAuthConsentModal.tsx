import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Shield, Check, Fingerprint } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { WebAuthnService } from '../services/WebAuthnService';
import { formatShortAddress } from '../services/addressUtils';

interface OAuthConsentModalProps {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod?: string;
  state?: string;
  onClose: () => void;
}

export const OAuthConsentModal: React.FC<OAuthConsentModalProps> = ({
  clientId,
  redirectUri,
  codeChallenge,
  codeChallengeMethod = 'S256',
  state,
  onClose,
}) => {
  const { activeSubWallet } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientName = clientId === 'claude' ? 'Claude' : clientId;

  const handleAllow = async () => {
    setIsProcessing(true);
    setError(null);
    setStatusMessage('Verifying biometric passkey...');

    try {
      // Prompt passkey verification if supported
      if (WebAuthnService.isSupported()) {
        try {
          const authRes = await WebAuthnService.authenticate(activeSubWallet?.address, codeChallenge);
          if (!authRes.success && authRes.error?.includes('cancelled')) {
            setStatusMessage('Passkey prompt cancelled.');
            setIsProcessing(false);
            return;
          }
        } catch {
          // Non-blocking passkey recommendation
        }
      }

      setStatusMessage('Authorizing Claude connection...');
      const mcpUrl =
        (import.meta as any).env?.VITE_NORTHVEIL_API_URL ||
        (import.meta as any).env?.VITE_MCP_URL ||
        'https://mcp.northveil.xyz';

      const token = localStorage.getItem('nv_session_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${mcpUrl}/oauth/consent`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          state,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Authorization failed: ${errText}`);
      }

      const data = await res.json();
      if (data.redirect_uri) {
        window.location.href = data.redirect_uri;
        return;
      }

      onClose();
    } catch (err: any) {
      console.error('Consent error:', err);
      setError(err.message || 'Authorization failed.');
      setIsProcessing(false);
    }
  };

  const handleDeny = () => {
    if (redirectUri) {
      try {
        const url = new URL(redirectUri);
        url.searchParams.set('error', 'access_denied');
        if (state) url.searchParams.set('state', state);
        window.location.href = url.toString();
        return;
      } catch {}
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 dark:bg-black/85 p-4 sm:p-6 mono-animate-in">
      <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center mx-auto overflow-hidden p-2 border border-black/[0.08] dark:border-white/[0.08]">
            <img src="https://iili.io/CDS9fvn.png" alt="Northveil MCP" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Allow {clientName} to use this Northveil vault
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Claude is requesting access to inspect balances and stage transactions on your behalf.
            </p>
          </div>
        </div>

        {/* Vault & Policy Info */}
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/50 border border-black/[0.06] dark:border-white/[0.06] space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Vault Account</span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">
              {formatShortAddress(activeSubWallet?.address)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Security Mode</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-white font-mono text-[10px] font-semibold">
              Always Ask (Default)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Key Custody</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Non-Custodial MPC
            </span>
          </div>
        </div>

        {/* Security Invariant Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <Fingerprint className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Passkey recommended</strong>. The agent will never receive private keys. Any fund movement will require biometric passkey authorization on this device.
          </p>
        </div>

        {statusMessage && (
          <p className="text-center text-xs text-zinc-600 dark:text-zinc-400 animate-pulse font-mono">
            {statusMessage}
          </p>
        )}

        {error && (
          <p className="text-center text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDeny}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-black/[0.1] transition-all cursor-pointer disabled:opacity-50"
          >
            Deny
          </button>
          <button
            type="button"
            onClick={handleAllow}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 active:scale-[0.98] transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span>Authorizing...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Allow Access</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
