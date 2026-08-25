import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { SUPPORTED_CHAINS } from '../data/initialData';
import {
  ShieldAlert,
  Activity,
  Database,
  Key,
  Server,
  Zap,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Check,
  Radio,
} from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const { assets, subWallets } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'rpcNodes' | 'keys' | 'vaults' | 'governance'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mcpHealth, setMcpHealth] = useState<{ online: boolean; uptime: number; memoryMb: number; toolsCount: number; latencyMs: number }>({
    online: true,
    uptime: 12400,
    memoryMb: 42,
    toolsCount: 22,
    latencyMs: 14,
  });

  const checkMcpServerHealth = async () => {
    const t0 = performance.now();
    try {
      const res = await fetch('http://localhost:3001/health').catch(() => null);
      const elapsed = Math.round(performance.now() - t0);
      if (res && res.ok) {
        const data = await res.json();
        setMcpHealth({
          online: true,
          uptime: data.uptimeSeconds || 0,
          memoryMb: data.memoryUsageMb || 45,
          toolsCount: data.supportedToolsCount || 22,
          latencyMs: elapsed,
        });
      } else {
        setMcpHealth((prev) => ({ ...prev, online: false, latencyMs: elapsed }));
      }
    } catch (e) {
      setMcpHealth((prev) => ({ ...prev, online: false }));
    }
  };

  useEffect(() => {
    checkMcpServerHealth();
    const interval = setInterval(checkMcpServerHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key: string; created: string; rateLimit: string }[]>([
    { id: '1', name: 'Primary Web App Key', key: 'nv_live_9f82a17b09c82415d8a9', created: '2026-08-01', rateLimit: '100 req/min' },
    { id: '2', name: 'Claude Desktop MCP Connector', key: 'nv_live_4b772c1092e411fa34c1', created: '2026-08-05', rateLimit: '500 req/min' },
  ]);

  const totalUsersCount = subWallets.length;
  const totalTvlUsd = assets.reduce((sum, a) => sum + a.balance * a.priceUsd, 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCreateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: `Developer Key #${apiKeys.length + 1}`,
      key: `nv_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`,
      created: new Date().toISOString().split('T')[0],
      rateLimit: '250 req/min',
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  return (
    <div className="space-y-6 sm:space-y-8 mono-animate-in">
      {/* Admin Panel Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#0d0d10] border border-black/[0.08] dark:border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl shadow-md">
              <ShieldAlert className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Admin & Telemetry Hub</h2>
                <span className="px-2.5 py-0.5 bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-[10px] font-mono rounded-full border border-black/10 dark:border-white/20 font-semibold">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Multi-chain RPC status, Supabase database audit & MCP server controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRefreshing(true);
                checkMcpServerHealth();
                setTimeout(() => setIsRefreshing(false), 800);
              }}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-full hover:opacity-85 cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-black/[0.02] dark:bg-black border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">ACTIVE SUB-ACCOUNTS</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">{totalUsersCount} WALLETS</div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">BIP-44 HD Derived</span>
          </div>

          <div className="bg-black/[0.02] dark:bg-black border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">TRACKED TVL</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">
              ${totalTvlUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Real On-Chain Balances</span>
          </div>

          <div className="bg-black/[0.02] dark:bg-black border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">SUPPORTED CHAINS</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">30+ NETWORKS</div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">EVM & Solana</span>
          </div>

          <div className="bg-black/[0.02] dark:bg-black border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">MCP SERVER (PORT 3001)</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">
              {mcpHealth.online ? 'ONLINE' : 'OFFLINE'}
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              {mcpHealth.online ? `${mcpHealth.latencyMs}ms • ${mcpHealth.toolsCount} Tools` : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mono-segmented-container w-full flex overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'rpcNodes', label: 'RPC Nodes', icon: Radio },
            { id: 'keys', label: 'API Keys', icon: Key },
            { id: 'vaults', label: 'Supabase Audit', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0d0d10] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">MCP Gateway Status</h3>
            <div className="space-y-2 text-xs font-mono text-zinc-700 dark:text-zinc-300">
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-black border border-black/[0.04] dark:border-white/[0.04] flex justify-between">
                <span>Port</span>
                <span className="text-zinc-900 dark:text-white font-semibold">3001</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-black border border-black/[0.04] dark:border-white/[0.04] flex justify-between">
                <span>Uptime</span>
                <span className="text-zinc-900 dark:text-white font-semibold">{Math.round(mcpHealth.uptime / 60)} minutes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-black border border-black/[0.04] dark:border-white/[0.04] flex justify-between">
                <span>Memory</span>
                <span className="text-zinc-900 dark:text-white font-semibold">{mcpHealth.memoryMb} MB</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-black border border-black/[0.04] dark:border-white/[0.04] flex justify-between">
                <span>Supported Tools</span>
                <span className="text-zinc-900 dark:text-white font-semibold">{mcpHealth.toolsCount} registered</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0d0d10] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Database Status</h3>
            <div className="space-y-2 text-xs font-mono text-zinc-700 dark:text-zinc-300">
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-black border border-black/[0.04] dark:border-white/[0.04] flex justify-between">
                <span>Provider</span>
                <span className="text-zinc-900 dark:text-white font-semibold">Supabase PostgreSQL</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-black border border-black/[0.04] dark:border-white/[0.04] flex justify-between">
                <span>Status</span>
                <span className="text-zinc-900 dark:text-white font-semibold">Connected</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-black border border-black/[0.04] dark:border-white/[0.04] flex justify-between">
                <span>Tables</span>
                <span className="text-zinc-900 dark:text-white font-semibold">wallets, contracts, mcp_activity_logs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RPC Nodes */}
      {activeTab === 'rpcNodes' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0d0d10] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Configured Network Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {SUPPORTED_CHAINS.slice(0, 8).map((chain) => (
              <div key={chain.id} className="p-3 bg-black/[0.03] dark:bg-black border border-black/[0.06] dark:border-white/[0.06] rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-zinc-900 dark:text-white font-semibold">
                  <span>{chain.name}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">{chain.symbol}</span>
                </div>
                <p className="text-zinc-500 text-[11px] truncate">{chain.rpcUrl}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: API Keys */}
      {activeTab === 'keys' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0d0d10] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Active System API Keys</h3>
            <button
              onClick={handleCreateApiKey}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Key
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {apiKeys.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-black/[0.03] dark:bg-black border border-black/[0.06] dark:border-white/[0.06] rounded-2xl flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{item.name}</p>
                  <p className="text-zinc-500 text-[11px]">{item.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item.key, item.id)}
                    className="p-1.5 rounded-xl bg-black/[0.06] dark:bg-white/[0.04] hover:bg-black/[0.12] dark:hover:bg-white/[0.08] text-zinc-900 dark:text-white cursor-pointer"
                  >
                    {copiedKey === item.id ? <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleRevokeKey(item.id)}
                    className="p-1.5 rounded-xl bg-black/[0.06] dark:bg-white/[0.04] hover:bg-red-500/10 text-zinc-500 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Vaults Audit */}
      {activeTab === 'vaults' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0d0d10] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Connected Vault Sub-Accounts</h3>
          <div className="space-y-2 font-mono text-xs">
            {subWallets.map((w) => (
              <div key={w.id} className="p-3 bg-black/[0.03] dark:bg-black border border-black/[0.06] dark:border-white/[0.06] rounded-2xl flex justify-between">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{w.name}</p>
                  <p className="text-zinc-500 text-[11px]">{w.address}</p>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 self-center">{w.derivationPath}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
