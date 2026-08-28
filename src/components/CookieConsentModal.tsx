import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Sliders, Lock } from 'lucide-react';

export const CookieConsentModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [telemetry, setTelemetry] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('northveil_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (type: 'all' | 'reject') => {
    const consentData = {
      essential: true,
      telemetry: type === 'all',
      analytics: type === 'all',
      status: type === 'all' ? 'all' : 'rejected',
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('northveil_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
    setShowPreferences(false);
    logEvent('cookie_consent', consentData);
  };

  const handleSaveCustom = () => {
    const consentData = {
      essential: true,
      telemetry,
      analytics,
      status: telemetry || analytics ? 'custom' : 'rejected',
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('northveil_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
    setShowPreferences(false);
    logEvent('cookie_consent', consentData);
  };

  const logEvent = (name: string, payload: any) => {
    try {
      const events = JSON.parse(localStorage.getItem('northveil_analytics_events') || '[]');
      events.push({
        event: name,
        payload,
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
      if (events.length > 50) events.shift();
      localStorage.setItem('northveil_analytics_events', JSON.stringify(events));
    } catch (e) {}
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Bottom-Right Glass Banner */}
      {!showPreferences && (
        <div className="fixed bottom-5 right-5 max-w-md w-[calc(100%-40px)] bg-[#0f0f12]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3.5 mb-4 text-left">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Privacy &amp; Data Preferences
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                Northveil uses privacy-preserving session keys and RPC telemetry for multi-chain routing. You can accept, reject, or customize.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              onClick={() => handleConsent('all')}
              className="px-3.5 py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
            >
              Accept All
            </button>
            <button
              onClick={() => handleConsent('reject')}
              className="px-3.5 py-1.5 bg-white/[0.06] text-zinc-300 text-xs font-medium rounded-lg hover:bg-white/[0.1] transition-all cursor-pointer"
            >
              Reject All
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="text-xs text-zinc-400 hover:text-white underline ml-auto cursor-pointer transition-colors"
            >
              Customize
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f0f12] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Data &amp; Cookie Preferences</h3>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Essential */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-medium text-white">Essential Passkeys &amp; Sessions</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Required for WebAuthn biometric signing and hardware enclave encryption.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-semibold shrink-0">
                  Required
                </span>
              </div>

              {/* RPC Telemetry */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-medium text-white">RPC Failover &amp; Latency</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Monitors node health across Ethereum, Base, and Solana.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={telemetry}
                  onChange={(e) => setTelemetry(e.target.checked)}
                  className="w-4 h-4 accent-white rounded cursor-pointer shrink-0"
                />
              </div>

              {/* Usage Analytics */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-medium text-white">Feature Performance Analytics</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Anonymous telemetry for MCP agent tool speed and error logging.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-4 h-4 accent-white rounded cursor-pointer shrink-0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleConsent('reject')}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Reject All
              </button>
              <button
                onClick={handleSaveCustom}
                className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
