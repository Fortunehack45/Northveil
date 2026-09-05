'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fingerprint, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

import { startRegistration } from '@simplewebauthn/browser';

export default function PasskeyOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrollPasskey = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn biometrics are not supported on this device.');
      }

      const mcpBase = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.northveil.xyz';
      const beginRes = await fetch(`${mcpBase}/auth/passkey/register/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hostname: window.location.hostname,
        }),
      });

      if (!beginRes.ok) {
        throw new Error('Failed to initiate passkey registration.');
      }

      const opts = await beginRes.json();
      const optionsJSON = opts.options || opts;
      const regResp = await startRegistration({ optionsJSON });

      const finishRes = await fetch(`${mcpBase}/auth/passkey/register/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          challenge: opts.challenge || optionsJSON.challenge,
          challengeToken: opts.challengeToken,
          response: regResp,
        }),
      });

      const finishData = await finishRes.json();
      if (!finishRes.ok || (!finishData.verified && !finishData.success)) {
        throw new Error(finishData.error || finishData.message || 'Passkey registration rejected.');
      }

      setEnrolled(true);
      setTimeout(() => {
        router.push('/onboarding/wallet');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Passkey enrollment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Step 1 of 2: Security Enrollment</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Enroll Your Passkey</h1>
          <p className="text-sm text-zinc-300 font-medium">
            “Google signs you in. A passkey is what approves payments.”
          </p>
          <p className="text-xs text-zinc-400">
            Enrolling a biometric passkey (Face ID, Windows Hello, Touch ID, or security key) ensures that AI agents can never move funds without your direct cryptographic hardware confirmation.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        <div className="p-4 bg-zinc-800/40 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-zinc-300">
              <span className="font-semibold text-white">Non-Custodial Guarantee</span>: Passkey private keys never leave your device’s secure enclave.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-zinc-300">
              <span className="font-semibold text-white">Exact Payload Binding</span>: Approvals commit to the exact transaction bytes and amount.
            </div>
          </div>
        </div>

        <button
          onClick={enrollPasskey}
          disabled={loading || enrolled}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for Authenticator...
            </>
          ) : enrolled ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-zinc-950" />
              Passkey Enrolled! Redirecting...
            </>
          ) : (
            <>
              <Fingerprint className="w-4 h-4 text-zinc-950" />
              Enroll Device Passkey
            </>
          )}
        </button>
      </div>
    </div>
  );
}
