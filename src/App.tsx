import React, { useState, useEffect, useRef } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { OverviewView } from './components/OverviewView';
import { WalletsView } from './components/WalletsView';
import { AgentsView } from './components/AgentsView';
import { ApprovalsView } from './components/ApprovalsView';
import { DeveloperHubView } from './components/DeveloperHubView';
import { ProfileView } from './components/ProfileView';
import { SendReceiveModal } from './components/SendReceiveModal';
import { OnboardingAuthModal } from './components/OnboardingAuthModal';
import { AdminPanelView } from './components/AdminPanelView';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { InteractiveTourModal } from './components/InteractiveTourModal';
import { Lock } from 'lucide-react';

const MainContent: React.FC = () => {
  const { isVaultConfigured, isLocked, unlockWalletWithBiometrics, unlockVault } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'send' | 'receive' | null>(null);
  const [modalAssetId, setModalAssetId] = useState<string | undefined>(undefined);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlockPassword = async () => {
    if (!unlockPassword) return;
    setIsUnlocking(true);
    setUnlockError(false);
    try {
      const ok = await unlockVault(unlockPassword);
      if (!ok) {
        setUnlockError(true);
      } else {
        setUnlockPassword('');
      }
    } catch {
      setUnlockError(true);
    } finally {
      setIsUnlocking(false);
    }
  };

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action === 'transfer' || action === 'send' || action === 'dev') {
      setActiveTab('developerHub');
    } else if (action === 'wallets') {
      setActiveTab('wallets');
    } else if (action === 'agents') {
      setActiveTab('agents');
    } else if (action === 'approvals') {
      setActiveTab('approvals');
    } else if (action === 'profile') {
      setActiveTab('profile');
    }
  }, []);

  // If user is logged out or vault not configured, render Fullscreen Auth Page
  if (!isVaultConfigured) {
    return <OnboardingAuthModal isFullscreen={true} />;
  }

  // If vault is locked, render Lock & Decrypt screen
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] dark:bg-black text-zinc-900 dark:text-white flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl rounded-3xl relative z-10 mono-animate-in">
          {/* Logo Standalone */}
          <div className="flex justify-center">
            <img
              src="https://iili.io/CDj46zl.png"
              alt="Northveil Logo"
              className="h-16 w-auto object-contain northveil-logo transition-all"
            />
          </div>

          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-mono font-medium rounded-full">
              VAULT ENCRYPTED
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight font-sans pt-1">
              Northveil Security
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your vault password to decrypt credentials.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Vault Password"
              value={unlockPassword}
              onChange={(e) => {
                setUnlockPassword(e.target.value);
                setUnlockError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUnlockPassword();
                }
              }}
              disabled={isUnlocking}
              className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white disabled:opacity-50"
              autoFocus
            />
            {unlockError && <p className="text-xs text-red-500 font-medium">Incorrect password</p>}
            <button
              onClick={handleUnlockPassword}
              disabled={isUnlocking || !unlockPassword}
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] cursor-pointer transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnlocking ? 'Decrypting Vault...' : 'Decrypt Vault & Unlock'}
            </button>

            <button
              onClick={() => unlockWalletWithBiometrics()}
              disabled={isUnlocking}
              className="w-full py-2.5 bg-black/[0.04] dark:bg-white/[0.04] text-zinc-700 dark:text-white font-medium rounded-full text-xs hover:bg-black/[0.08] dark:hover:bg-white/[0.08] cursor-pointer transition-all disabled:opacity-50"
            >
              Unlock with Biometrics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#f8f8fa] dark:bg-black text-zinc-900 dark:text-white flex overflow-hidden relative">
      {/* Main Container */}
      <div className="w-full h-full bg-[#f8f8fa] dark:bg-black flex overflow-hidden relative z-10">
        {/* Left Sidebar Navigation */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenTour={() => {
            setActiveTab('overview');
            setIsTourOpen(true);
          }}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8f8fa] dark:bg-black">
          <Header
            activeTab={activeTab}
            onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
            onNavigateNetworkManager={() => setActiveTab('wallets')}
          />

          <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-6 md:p-8 pb-28 sm:pb-8 max-w-[1600px] mx-auto w-full">
            <div key={activeTab} className="mono-animate-in">
              {activeTab === 'overview' && (
                <OverviewView
                  onOpenSend={(assetId) => {
                    setModalAssetId(assetId);
                    setModalMode('send');
                  }}
                  onOpenReceive={(assetId) => {
                    setModalAssetId(assetId);
                    setModalMode('receive');
                  }}
                  onNavigateWallets={() => setActiveTab('wallets')}
                  onNavigateAgents={() => setActiveTab('agents')}
                  onNavigateApprovals={() => setActiveTab('approvals')}
                />
              )}

              {activeTab === 'wallets' && <WalletsView />}
              {activeTab === 'agents' && <AgentsView />}
              {activeTab === 'approvals' && <ApprovalsView />}
              {activeTab === 'developerHub' && <DeveloperHubView />}
              {activeTab === 'profile' && <ProfileView />}
              {activeTab === 'adminPanel' && <AdminPanelView />}
            </div>
          </main>

          <PWAInstallPrompt />
        </div>
      </div>

      {/* Modal for Send & Receive */}
      {modalMode && (
        <SendReceiveModal
          mode={modalMode}
          initialAssetId={modalAssetId}
          onClose={() => setModalMode(null)}
        />
      )}

      {/* Onboarding & Auth Simulator Modal */}
      {isOnboardingOpen && (
        <OnboardingAuthModal onClose={() => setIsOnboardingOpen(false)} />
      )}

      {/* Interactive Spotlight Guided Quick Tour */}
      <InteractiveTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
};

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleUncaughtError = (event: ErrorEvent) => {
      console.error("Uncaught Northveil App Error:", event.error);
      setHasError(true);
      setError(event.error || new Error(event.message));
    };

    window.addEventListener('error', handleUncaughtError);
    return () => window.removeEventListener('error', handleUncaughtError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 z-[99999]">
        <div className="bg-[#0f0f12] p-8 max-w-lg w-full space-y-4 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold text-white">Application Notice</h2>
          <p className="text-xs text-zinc-400">An unexpected component error occurred:</p>
          <div className="bg-black p-3 text-xs text-zinc-300 overflow-x-auto max-h-32 rounded-xl font-mono break-all">
            {error?.toString() || 'Unknown Runtime Error'}
          </div>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="w-full py-3 bg-white text-black font-semibold text-xs rounded-full hover:bg-zinc-200 cursor-pointer"
          >
            Refresh Application
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <MainContent />
      </WalletProvider>
    </ErrorBoundary>
  );
}
