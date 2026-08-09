import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Share2, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';

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
      // Check if user dismissed prompt recently
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
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#141419] border-3 border-white p-4 shadow-[8px_8px_0px_0px_#ccff00] font-mono animate-in slide-in-from-bottom duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#ccff00] border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <Smartphone className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white uppercase tracking-wider">INSTALL NORTHVEIL APP</span>
                <span className="px-1.5 py-0.5 bg-[#00f0ff] text-black text-[9px] font-black uppercase border border-black">PWA</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Install as native app on iOS, Android, macOS & Windows!
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 hover:bg-white/10"
            title="Dismiss"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>INSTALL NOW</span>
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 bg-[#0a0a0c] text-slate-300 font-bold text-xs uppercase border-2 border-white hover:text-white cursor-pointer"
          >
            LATER
          </button>
        </div>
      </div>

      {/* iOS Step-By-Step Installation Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
          <div className="bg-[#141419] border-4 border-white p-6 max-w-md w-full shadow-[10px_10px_0px_0px_#00f0ff] space-y-5 relative">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#00f0ff]" />
                <span className="text-white font-black text-sm uppercase">INSTALL ON IOS SAFARI</span>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <div className="flex items-start gap-3 bg-[#0a0a0c] p-3 border-2 border-white">
                <span className="w-6 h-6 rounded-full bg-[#00f0ff] text-black font-black flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-black text-white uppercase">Tap Share Button</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tap the Share icon at the bottom of your Safari browser bar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#0a0a0c] p-3 border-2 border-white">
                <span className="w-6 h-6 rounded-full bg-[#ccff00] text-black font-black flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-black text-white uppercase">Add to Home Screen</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Scroll down in the action menu and tap <strong>"Add to Home Screen"</strong>.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#0a0a0c] p-3 border-2 border-white">
                <span className="w-6 h-6 rounded-full bg-[#ff007f] text-white font-black flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-black text-white uppercase">Launch Northveil App</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tap "Add" in the top right to open Northveil as a standalone app!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer"
            >
              GOT IT!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
