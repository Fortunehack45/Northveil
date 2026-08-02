import React, { useState, useEffect, useRef } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { PortfolioView } from './components/PortfolioView';
import { DAppBrowserView } from './components/DAppBrowserView';
import { DexBridgeView } from './components/DexBridgeView';
import { GasEstimatorView } from './components/GasEstimatorView';
import { StakingView } from './components/StakingView';
import { HistoryTaxView } from './components/HistoryTaxView';
import { SecurityBackupView } from './components/SecurityBackupView';
import { SystemMetricsView } from './components/SystemMetricsView';
import { SendReceiveModal } from './components/SendReceiveModal';
import { NFTSectionView } from './components/NFTSectionView';
import { SmartContractStudioView } from './components/SmartContractStudioView';
import { SecurityCenterView } from './components/SecurityCenterView';
import { DeveloperHubView } from './components/DeveloperHubView';
import { HelpSupportView } from './components/HelpSupportView';
import { OnboardingAuthModal } from './components/OnboardingAuthModal';
import { BuySellView } from './components/BuySellView';
import { CreateTicketView } from './components/CreateTicketView';
import { ReportBugView } from './components/ReportBugView';
import { NetworkManagerView } from './components/NetworkManagerView';

const MainContent: React.FC = () => {
  const { isLocked, unlockWalletWithBiometrics, unlockVault } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'send' | 'receive' | null>(null);
  const [modalAssetId, setModalAssetId] = useState<string | undefined>(undefined);
  const [buySellMode, setBuySellMode] = useState<'buy' | 'sell'>('buy');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] brutal-grid-bg flex items-center justify-center p-4">
        <div className="bg-[#141419] border-4 border-white p-8 max-w-sm w-full text-center space-y-6 shadow-[8px_8px_0px_0px_#ccff00] relative z-10">
          <div className="w-20 h-20 bg-[#ccff00] border-4 border-black text-black text-4xl font-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000]">
            🔒
          </div>
          <div>
            <span className="px-2.5 py-1 bg-[#ff007f] text-white text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
              VAULT ENCRYPTED
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight font-mono mt-2">
              NORTHVEIL SECURITY
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-2">
              ENTER YOUR VAULT PASSWORD TO DECRYPT YOUR SEED PHRASE AND ACCESS YOUR FUNDS.
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
                  if (!unlockVault(unlockPassword)) {
                    setUnlockError(true);
                  }
                }
              }}
              className="w-full bg-[#0a0a0c] border-2 border-white p-3 font-mono text-white focus:outline-none focus:border-[#ccff00]"
            />
            {unlockError && <p className="text-xs font-mono text-[#ff007f]">INCORRECT PASSWORD</p>}
            <button
              onClick={() => {
                if (!unlockVault(unlockPassword)) {
                  setUnlockError(true);
                }
              }}
              className="w-full py-4 bg-[#ccff00] text-black font-black border-2 border-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer transition-all"
            >
              DECRYPT VAULT & UNLOCK
            </button>
            
            {/* Fallback to biometrics if enabled */}
            <button
              onClick={() => unlockWalletWithBiometrics()}
              className="w-full py-3 bg-transparent text-[#00f0ff] font-black border-2 border-white/20 text-xs uppercase tracking-wider hover:border-[#00f0ff] cursor-pointer transition-all mt-2"
            >
              Unlock with Biometrics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] brutal-grid-bg text-slate-100 flex overflow-hidden relative">
      {/* Main Cryptfast Dashboard Container - Fullscreen Seamless */}
      <div className="w-full h-full bg-transparent flex overflow-hidden relative z-10">
        {/* Left Sidebar Navigation */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          onToggleMobile={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
          <Header 
            onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} 
            onNavigateNetworkManager={() => setActiveTab('networkManager')}
          />

          <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-8 pb-24 sm:pb-8 max-w-[1600px] mx-auto w-full">
            {activeTab === 'portfolio' && (
              <PortfolioView
                onOpenSend={(assetId) => {
                  setModalAssetId(assetId);
                  setModalMode('send');
                }}
                onOpenReceive={(assetId) => {
                  setModalAssetId(assetId);
                  setModalMode('receive');
                }}
                onNavigateSwap={(assetId) => {
                  if (assetId) setModalAssetId(assetId);
                  setActiveTab('dexBridge');
                }}
                onNavigateDAppBrowser={() => setActiveTab('dappBrowser')}
                onNavigateNFT={() => setActiveTab('nftGallery')}
                onNavigateBuySell={(assetId, mode) => {
                  if (assetId) setModalAssetId(assetId);
                  if (mode) setBuySellMode(mode);
                  setActiveTab('buySell');
                }}
              />
            )}

            {activeTab === 'buySell' && (
              <BuySellView
                initialTokenId={modalAssetId}
                initialMode={buySellMode}
                onBack={() => setActiveTab('portfolio')}
              />
            )}

            {activeTab === 'dappBrowser' && <DAppBrowserView />}
            {activeTab === 'dexBridge' && <DexBridgeView />}
            {activeTab === 'gasEstimator' && <GasEstimatorView />}
            {activeTab === 'nftGallery' && <NFTSectionView />}
            {activeTab === 'smartContractStudio' && <SmartContractStudioView />}
            {activeTab === 'staking' && <StakingView />}
            {activeTab === 'historyTax' && <HistoryTaxView />}
            {activeTab === 'securityCenter' && <SecurityCenterView />}
            {activeTab === 'developerHub' && <DeveloperHubView />}
            {activeTab === 'securityBackup' && <SecurityBackupView />}
            {activeTab === 'systemMetrics' && <SystemMetricsView />}
            {activeTab === 'helpSupport' && <HelpSupportView />}
            {activeTab === 'createTicket' && (
              <CreateTicketView onBack={() => setActiveTab('helpSupport')} />
            )}
            {activeTab === 'reportBug' && (
              <ReportBugView onBack={() => setActiveTab('helpSupport')} />
            )}
            {activeTab === 'networkManager' && <NetworkManagerView />}
          </main>
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
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <MainContent />
    </WalletProvider>
  );
}

