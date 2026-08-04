import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { McpDocs } from './components/McpDocs';
import { ApiDocs } from './components/ApiDocs';
import { SdkDocs } from './components/SdkDocs';
import { DeploymentGuide } from './components/DeploymentGuide';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-mono selection:bg-[#ccff00] selection:text-black">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero onExploreMcp={() => setActiveTab('mcpDocs')} />
            <McpDocs />
          </>
        )}
        {activeTab === 'mcpDocs' && <McpDocs />}
        {activeTab === 'apiDocs' && <ApiDocs />}
        {activeTab === 'sdkDocs' && <SdkDocs />}
        {activeTab === 'deployGuide' && <DeploymentGuide />}
        {activeTab === 'terms' && (
          <>
            <TermsPage />
            <PrivacyPage />
          </>
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
