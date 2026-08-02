import React, { useState } from 'react';
import { Network, Plus, Trash2, Activity, Globe, Shield, Search, Zap, ExternalLink, Settings2, CheckCircle2, AlertTriangle, Edit2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/initialData';
import { ChainInfo } from '../types';
import { ethers } from 'ethers';

export const NetworkManagerView: React.FC = () => {
  const { activeChain, setActiveChain, customNetworks, addCustomNetwork } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isTestingRPC, setIsTestingRPC] = useState(false);
  
  const [newNetData, setNewNetData] = useState({
    name: '',
    rpcUrl: '',
    chainId: '',
    symbol: '',
    explorerUrl: ''
  });

  const [testResult, setTestResult] = useState<'none' | 'success' | 'error'>('none');
  const [latency, setLatency] = useState<number>(0);

  const allNetworks = [...SUPPORTED_CHAINS, ...customNetworks];
  const filteredNetworks = allNetworks.filter(n => 
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTestRPC = async () => {
    if (!newNetData.rpcUrl) return;
    setIsTestingRPC(true);
    setTestResult('none');
    
    try {
      const start = Date.now();
      const provider = new ethers.JsonRpcProvider(newNetData.rpcUrl);
      
      // Attempt to fetch the network details to validate the RPC
      const network = await provider.getNetwork();
      
      const end = Date.now();
      setLatency(end - start);

      // If the user entered a chainId, validate it matches the RPC
      if (newNetData.chainId && Number(network.chainId) !== parseInt(newNetData.chainId)) {
        console.error(`Chain ID mismatch: RPC returned ${network.chainId}, but ${newNetData.chainId} was provided.`);
        setTestResult('error');
        setIsTestingRPC(false);
        return;
      }
      
      setTestResult('success');
    } catch (e) {
      console.error('RPC Test Failed:', e);
      setTestResult('error');
    } finally {
      setIsTestingRPC(false);
    }
  };

  const handleAddNetwork = () => {
    if (!newNetData.name || !newNetData.rpcUrl || !newNetData.chainId) return;
    
    const newChain: ChainInfo = {
      id: `custom-${Date.now()}`,
      name: newNetData.name,
      symbol: newNetData.symbol || 'ETH',
      icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', // Generic icon
      color: '#ccff00',
      rpcLatency: testResult === 'success' ? latency : 120,
      blockTime: 12,
      gasUnit: 'Gwei',
      nativeTokenPrice: 0,
      explorerUrl: newNetData.explorerUrl,
      rpcUrl: newNetData.rpcUrl,
      chainId: parseInt(newNetData.chainId),
      isCustom: true
    };
    
    addCustomNetwork(newChain);
    setActiveChain(newChain.id);
    setIsAddingMode(false);
    setNewNetData({ name: '', rpcUrl: '', chainId: '', symbol: '', explorerUrl: '' });
    setTestResult('none');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-24 sm:pb-12 w-full font-mono select-none animate-fadeIn">
      {/* Top Banner Navigation */}
      <div className="bg-[#141419] border-2 border-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#ccff00] sm:shadow-[8px_8px_0px_0px_#ccff00] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="px-2 py-0.5 bg-[#00f0ff] text-black text-[9px] sm:text-[10px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000] inline-block">
            ADVANCED ROUTING
          </span>
          <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#ccff00]" />
            NETWORK MANAGER
          </h1>
        </div>

        <button
          onClick={() => setIsAddingMode(!isAddingMode)}
          className={`px-6 py-3 font-black text-xs uppercase border-2 transition-all shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2 ${
            isAddingMode ? 'bg-[#ff007f] text-white border-black' : 'bg-[#ccff00] text-black border-black hover:bg-[#d8ff33]'
          }`}
        >
          {isAddingMode ? (
            <><span>CANCEL CONFIG</span></>
          ) : (
            <><Plus className="w-4 h-4 stroke-[3]" /><span>ADD CUSTOM RPC</span></>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Panel: Network List */}
        <div className={`${isAddingMode ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-4 transition-all`}>
          
          {!isAddingMode && (
            <div className="bg-[#0a0a0c] border-2 border-white p-2 shadow-[4px_4px_0px_0px_#00f0ff] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#00f0ff] ml-2" />
              <input 
                type="text" 
                placeholder="SEARCH NETWORKS OR CHAIN ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-white text-xs font-bold uppercase placeholder-slate-500 focus:outline-none p-2"
              />
            </div>
          )}

          <div className={isAddingMode ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
            {filteredNetworks.map(net => {
              const isActive = activeChain === net.id;
              return (
                <div 
                  key={net.id}
                  onClick={() => setActiveChain(net.id)}
                  className={`border-2 p-4 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px] ${
                    isActive 
                      ? 'bg-[#181820] border-[#ccff00] shadow-[6px_6px_0px_0px_#ccff00]' 
                      : 'bg-[#0a0a0c] border-white/20 hover:border-white/50 hover:shadow-[4px_4px_0px_0px_#ffffff40]'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-0 right-0 p-2">
                    {isActive ? (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ccff00]"></span>
                      </span>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <img src={net.icon} alt={net.name} className="w-8 h-8 object-contain" />
                    <div>
                      <h3 className="text-sm font-black text-white uppercase">{net.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 bg-black border border-white/20 text-[9px] text-slate-300 font-bold">
                          CHAIN ID: {net.chainId || 'N/A'}
                        </span>
                        {net.isCustom && (
                          <span className="px-1.5 py-0.5 bg-[#ff007f]/20 border border-[#ff007f] text-[9px] text-[#ff007f] font-bold">
                            CUSTOM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                    <div className="flex items-center gap-1">
                      <Zap className={`w-3 h-3 ${isActive ? 'text-[#ccff00]' : 'text-slate-500'}`} />
                      <span>{net.rpcLatency}ms LATENCY</span>
                    </div>
                    {isActive && (
                      <span className="text-[#ccff00]">CONNECTED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Add Network Form */}
        {isAddingMode && (
          <div className="lg:col-span-2 bg-[#0a0a0c] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#ff007f] animate-slideIn">
            <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 border-b-2 border-white/20 pb-4 mb-6">
              <Settings2 className="w-5 h-5 text-[#ff007f]" />
              CONFIGURE CUSTOM RPC ENDPOINT
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Network Name *</label>
                <input
                  type="text"
                  value={newNetData.name}
                  onChange={(e) => setNewNetData({ ...newNetData, name: e.target.value })}
                  placeholder="e.g. Arbitrum Nova"
                  className="w-full bg-[#141419] border-2 border-white/30 text-white p-3 text-sm font-bold uppercase focus:border-[#ccff00] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">New RPC URL *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNetData.rpcUrl}
                    onChange={(e) => setNewNetData({ ...newNetData, rpcUrl: e.target.value })}
                    placeholder="https://nova.arbitrum.io/rpc"
                    className="flex-1 bg-[#141419] border-2 border-white/30 text-white p-3 text-sm font-bold focus:border-[#ccff00] focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleTestRPC}
                    disabled={!newNetData.rpcUrl || isTestingRPC}
                    className="px-4 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black hover:bg-[#33f3ff] disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_#000]"
                  >
                    {isTestingRPC ? 'TESTING...' : 'TEST RPC'}
                  </button>
                </div>
                
                {/* Test Result Indicator */}
                {testResult !== 'none' && (
                  <div className={`mt-2 p-2 border text-xs font-bold uppercase flex items-center gap-2 ${
                    testResult === 'success' ? 'bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]' : 'bg-[#ff007f]/10 border-[#ff007f] text-[#ff007f]'
                  }`}>
                    {testResult === 'success' ? (
                      <><CheckCircle2 className="w-4 h-4" /> CONNECTION SUCCESSFUL. LATENCY: {latency}ms</>
                    ) : (
                      <><AlertTriangle className="w-4 h-4" /> CONNECTION FAILED. VERIFY URL OR CORS.</>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Chain ID *</label>
                  <input
                    type="number"
                    value={newNetData.chainId}
                    onChange={(e) => setNewNetData({ ...newNetData, chainId: e.target.value })}
                    placeholder="42170"
                    className="w-full bg-[#141419] border-2 border-white/30 text-white p-3 text-sm font-bold focus:border-[#ccff00] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Currency Symbol</label>
                  <input
                    type="text"
                    value={newNetData.symbol}
                    onChange={(e) => setNewNetData({ ...newNetData, symbol: e.target.value.toUpperCase() })}
                    placeholder="ETH"
                    className="w-full bg-[#141419] border-2 border-white/30 text-white p-3 text-sm font-bold uppercase focus:border-[#ccff00] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Block Explorer URL (Optional)</label>
                <input
                  type="text"
                  value={newNetData.explorerUrl}
                  onChange={(e) => setNewNetData({ ...newNetData, explorerUrl: e.target.value })}
                  placeholder="https://nova.arbiscan.io"
                  className="w-full bg-[#141419] border-2 border-white/30 text-white p-3 text-sm font-bold focus:border-[#ccff00] focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-4 mt-4 border-t-2 border-white/20">
                <div className="flex items-start gap-3 bg-[#181820] p-3 border border-yellow-500/50 text-yellow-500 text-[10px] leading-relaxed mb-4">
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  <p>
                    <strong>SECURITY WARNING:</strong> ONLY ADD CUSTOM RPC ENDPOINTS FROM TRUSTED PROVIDERS. MALICIOUS NETWORKS CAN LOG YOUR IP ADDRESS, TRACK TRANSACTIONS, OR RETURN FALSE BALANCES AND DATA.
                  </p>
                </div>

                <button
                  onClick={handleAddNetwork}
                  disabled={!newNetData.name || !newNetData.rpcUrl || !newNetData.chainId || testResult === 'error'}
                  className="w-full py-4 bg-[#ccff00] text-black font-black text-sm uppercase border-2 border-black hover:bg-[#d8ff33] disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  SAVE & CONNECT TO NETWORK
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
