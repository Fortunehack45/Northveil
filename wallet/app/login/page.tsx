'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Fingerprint, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

import { startAuthentication } from '@simplewebauthn/browser';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    setLoading(true);
    // Redirect to Google OAuth initialization
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'mock_google_client_id';
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = encodeURIComponent('openid email profile');
    const state = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    
    // In demo/offline mode or development, navigate directly to callback with simulated code
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      router.push(`/auth/google/callback?code=mock_code&state=${state}`);
      return;
    }

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&prompt=select_account`;
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn passkeys are not supported on this browser or device.');
      }
      const mcpBase = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.northveil.xyz';
      const beginRes = await fetch(`${mcpBase}/auth/passkey/login/begin`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!beginRes.ok) {
        throw new Error('Failed to begin passkey authentication.');
      }
      const opts = await beginRes.json();
      const optionsJSON = opts.options || opts;
      const authResp = await startAuthentication({ optionsJSON });

      const finishRes = await fetch(`${mcpBase}/auth/passkey/login/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          credentialId: authResp.id,
          challenge: opts.challenge || optionsJSON.challenge,
          challengeToken: opts.challengeToken,
          response: authResp,
        }),
      });

      const finishData = await finishRes.json();
      if (!finishRes.ok || (!finishData.verified && !finishData.success)) {
        throw new Error(finishData.error || finishData.message || 'Passkey verification rejected');
      }

      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Passkey authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sign In to Northveil</h1>
          <p className="text-sm text-zinc-400">
            Non-custodial control plane for AI agent capabilities.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-medium text-sm flex items-center justify-center gap-3 transition shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <span className="relative px-3 bg-[#11131b] text-xs text-zinc-500 uppercase tracking-wider font-mono">
              Or returning user
            </span>
          </div>

          <button
            onClick={handlePasskeyLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-white font-medium text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
          >
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            Sign in with passkey
          </button>
        </div>

        <div className="p-4 bg-zinc-800/40 border border-zinc-800/60 rounded-xl space-y-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-200 font-medium">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Why Google + Passkeys?</span>
          </div>
          <p>
            Google confirms your account identity. Your device passkey is the hardware factor that approves payments and signs grants.
          </p>
        </div>
      </div>
    </div>
  );
}
