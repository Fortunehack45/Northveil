import React, { useState, useEffect } from 'react';
import { Smartphone, X, Download } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const inStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (inStandalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    if (isIphoneOrIpad) {
      setIsIOS(true);
      const dismissed = localStorage.getItem('northveil_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    // Capture Chrome/Android/Desktop install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('northveil_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('northveil_pwa_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating Bottom PWA Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.1] rounded-3xl p-4 shadow-2xl mono-animate-in">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Install Northveil App</span>
                <span className="px-1.5 py-0.2 bg-black/[0.06] dark:bg-white/[0.08] text-zinc-700 dark:text-white text-[9px] font-mono rounded border border-black/[0.08] dark:border-white/20">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Install as a native standalone app on your device.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-1 text-xs font-medium cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Now</span>
          </button>
          <button
            onClick={handleDismiss}
            className="px-3.5 py-2 bg-black/[0.04] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-medium rounded-full cursor-pointer transition-colors"
          >
            Later
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 mono-animate-in">
          <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.1] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Install on iOS Safari</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tap the <strong>Share button (square with arrow)</strong> in your Safari toolbar at the bottom, then scroll down and select <strong>"Add to Home Screen"</strong>.
            </p>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
