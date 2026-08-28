import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../context/WalletContext';
import {
  Bot,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Trash2,
  Wallet,
  Eye,
  EyeOff,
  Key,
  ExternalLink,
} from 'lucide-react';
import { AgentConnection } from '../types';
import { CustomSelect } from './CustomSelect';

export const AgentsView: React.FC = () => {
  const {
    agents,
    subWallets,
    activeSubWallet,
    addAgentConnection,
    updateAgentExpiration,
    revokeAgentConnection,
  } = useWallet();

  // Modal States
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectType, setConnectType] = useState<'claude' | 'chatgpt' | 'custom'>('claude');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentConnection | null>(null);

  // Setup Form States
  const [selectedWalletAddr, setSelectedWalletAddr] = useState<string>(
    activeSubWallet?.address || subWallets[0]?.address || ''
  );
  const [selectedDuration, setSelectedDuration] = useState<'1h' | '24h' | '7d' | '30d' | 'never'>('7d');
  const [customAgentName, setCustomAgentName] = useState('');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedSse, setCopiedSse] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<'zero_json' | 'json_config'>('zero_json');
  const [mcpClientTab, setMcpClientTab] = useState<'claude' | 'chatgpt' | 'cursor' | 'windsurf' | 'claudecode' | 'sse'>('claude');
  const [mcpOnline, setMcpOnline] = useState(true);

  const toggleRevealKey = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyKey = (keyText: string, id: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const baseMcpUrl = isLocalhost ? 'http://localhost:3001' : 'https://mcp.northveil.xyz';
  const targetWallet = selectedWalletAddr || activeSubWallet?.address || '0x0000000000000000000000000000000000000000';
  const generatedSseUrl = `${baseMcpUrl}/sse?wallet_address=${targetWallet}`;

  // Live MCP Health Check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${baseMcpUrl}/health`, { method: 'GET' }).catch(() => null);
        setMcpOnline(!!res && res.ok);
      } catch {
        setMcpOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [baseMcpUrl]);

  const getClientConfigSnippet = (client: 'claude' | 'chatgpt' | 'cursor' | 'windsurf' | 'claudecode' | 'sse') => {
    switch (client) {
      case 'claude':
        return JSON.stringify(
          {
            mcpServers: {
              northveil: {
                command: 'npx',
                args: ['-y', 'northveil-cli', 'mcp'],
                env: {
                  NORTHVEIL_WALLET_ADDRESS: targetWallet,
                  NORTHVEIL_API_URL: baseMcpUrl,
                },
              },
            },
          },
          null,
          2
        );
      case 'cursor':
        return JSON.stringify(
          {
            mcpServers: {
              northveil: {
                url: `${baseMcpUrl}/mcp`,
                headers: {
                  Authorization: 'Bearer nv_live_YOUR_API_KEY',
                  'x-wallet-address': targetWallet,
                },
              },
            },
          },
          null,
          2
        );
      case 'chatgpt':
        return JSON.stringify(
          {
            integration: 'OpenAI ChatGPT Custom Action / GPT Plugin',
            schema_url: `${baseMcpUrl}/openapi.json`,
            mcp_stream_url: `${baseMcpUrl}/mcp`,
            oauth_configuration: {
              authorization_url: `${baseMcpUrl}/oauth/authorize`,
              token_url: `${baseMcpUrl}/oauth/token`,
              client_registration_url: `${baseMcpUrl}/oauth/register`,
              protected_resource_metadata: `${baseMcpUrl}/.well-known/oauth-protected-resource`,
              authorization_server_metadata: `${baseMcpUrl}/.well-known/oauth-authorization-server`,
              scope: 'tools:read tools:execute',
              client_id: 'chatgpt_agent',
              client_secret: 'northveil_secret',
            },
            alternative_api_key_auth: {
              type: 'Custom Header',
              header_name: 'X-API-Key',
              header_value: 'Your Northveil API Key (from Agents tab)',
            },
          },
          null,
          2
        );
      case 'claudecode':
        return `claude mcp add northveil ${baseMcpUrl}/mcp --header "Authorization: Bearer nv_live_YOUR_API_KEY"`;
      case 'windsurf':
        return JSON.stringify(
          {
            mcpServers: {
              northveil: {
                url: `${baseMcpUrl}/mcp`,
                headers: {
                  Authorization: 'Bearer nv_live_YOUR_API_KEY',
                  'x-wallet-address': targetWallet,
                },
              },
            },
          },
          null,
          2
        );
      case 'sse':
        return JSON.stringify(
          {
            mcpServers: {
              northveil: {
                url: generatedSseUrl,
              },
            },
          },
          null,
          2
        );
      default:
        return '';
    }
  };

  const getClientFilePath = (client: 'claude' | 'chatgpt' | 'cursor' | 'windsurf' | 'claudecode' | 'sse') => {
    switch (client) {
      case 'claude':
        return 'macOS: ~/Library/Application Support/Claude/claude_desktop_config.json | Windows: %APPDATA%\\Claude\\claude_desktop_config.json';
      case 'chatgpt':
        return 'ChatGPT Web UI > Explore GPTs > Create a GPT > Configure > Actions > "Create new action"';
      case 'cursor':
        return 'Project Root: .cursor/mcp.json or Settings -> Features -> MCP';
      case 'windsurf':
        return 'Global: ~/.codeium/windsurf/mcp_config.json';
      case 'claudecode':
        return 'Terminal CLI command';
      case 'sse':
        return 'Remote SSE Transport Endpoint URL';
      default:
        return '';
    }
  };

  const claudeDesktopConfigJson = getClientConfigSnippet(mcpClientTab);

  const handleOpenConnect = (type: 'claude' | 'chatgpt' | 'custom') => {
    setConnectType(type);
    setSelectedWalletAddr(activeSubWallet?.address || subWallets[0]?.address || '');
    setSelectedDuration('7d');
    setCustomAgentName('');
    setMcpClientTab(type === 'claude' ? 'claude' : type === 'chatgpt' ? 'chatgpt' : 'sse');
    setShowConnectModal(true);
  };

  const handleSaveConnection = () => {
    const name =
      connectType === 'claude'
        ? 'Claude Desktop Agent'
        : connectType === 'chatgpt'
        ? 'ChatGPT Custom Action'
        : customAgentName.trim() || 'Custom AI Agent';

    addAgentConnection({
      name,
      type: connectType,
      walletAddress: selectedWalletAddr || activeSubWallet?.address || '',
      duration: selectedDuration,
      expiresAt: null,
      status: 'active',
      permissions: [
        'get_balance',
        'send_transfer',
        'execute_swap',
        'mint_tokens',
        'deploy_smart_contract',
        'reserve_tokens',
      ],
      sseUrl: generatedSseUrl,
      recentActionsCount: 0,
    });

    setShowConnectModal(false);
  };

  const handleOpenDetails = (agent: AgentConnection) => {
    setSelectedAgent(agent);
    setShowDetailsModal(true);
  };

  const formatShortAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const calculateRemainingTime = (expiresAt: string | null) => {
    if (!expiresAt) return 'Permanent Access';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Access Expired';
    const days = Math.floor(diff / (24 * 3600 * 1000));
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours} hours remaining`;
  };

  const walletSelectOptions = subWallets.map((w) => ({
    value: w.address,
    label: `${w.name} (${formatShortAddress(w.address)})`,
    icon: <Wallet className="w-3.5 h-3.5 text-zinc-400" />,
  }));

  return (
    <div className="space-y-6 sm:space-y-8 mono-animate-in">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-mono font-medium flex items-center gap-1.5 whitespace-nowrap">
              <span className={`w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white ${mcpOnline ? 'animate-pulse' : 'opacity-40'}`} />
              {mcpOnline ? 'MCP ACTIVE' : 'MCP LOCAL'}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">
              {agents.filter((a) => a.status === 'active').length} Connected
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">
            Connected AI Agents
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Connect Claude Desktop, ChatGPT, or custom agents with customizable session duration controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenConnect('claude')}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs sm:text-sm hover:opacity-85 active:scale-[0.98] transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Bot className="w-4 h-4" />
            <span>Connect Claude</span>
          </button>
          <button
            onClick={() => handleOpenConnect('chatgpt')}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-black/[0.05] dark:bg-[#18181c] hover:bg-black/[0.08] dark:hover:bg-[#242429] text-zinc-900 dark:text-white active:scale-[0.98] font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Connect ChatGPT</span>
          </button>
          <button
            onClick={() => handleOpenConnect('custom')}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-full bg-black/[0.05] dark:bg-[#18181c] hover:bg-black/[0.08] dark:hover:bg-[#242429] text-zinc-900 dark:text-white active:scale-[0.98] font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-zinc-500 dark:text-zinc-300" />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CONNECTED AGENTS GRID */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {agents.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] text-zinc-900 dark:text-white mx-auto flex items-center justify-center">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">No AI Agents Connected</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Connect Claude Desktop, ChatGPT Custom Action, or an Autonomous Agent to manage on-chain actions through your Model Context Protocol gateway.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 pt-2">
            <button
              onClick={() => handleOpenConnect('claude')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 cursor-pointer shadow-sm"
            >
              <Bot className="w-4 h-4" />
              Connect Claude
            </button>
            <button
              onClick={() => handleOpenConnect('chatgpt')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.05] dark:bg-white/[0.04] text-zinc-900 dark:text-white font-medium text-xs hover:bg-black/[0.08] dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Connect ChatGPT
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const isClaude = agent.type === 'claude';
            const isGpt = agent.type === 'chatgpt';
            const isRevoked = agent.status === 'revoked';

            return (
              <div
                key={agent.id}
                className={`rounded-3xl p-6 transition-all space-y-4 border ${
                  isRevoked
                    ? 'bg-zinc-100 dark:bg-black border-black/[0.04] dark:border-white/[0.04] opacity-50'
                    : 'bg-white dark:bg-[#0f0f12] hover:bg-zinc-50 dark:hover:bg-[#141418] border-black/[0.06] dark:border-white/[0.06] shadow-sm'
                }`}
              >
                {/* Agent Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                      {isClaude ? 'C' : isGpt ? 'GPT' : 'AI'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{agent.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {isClaude ? 'Desktop MCP Server' : isGpt ? 'Custom GPT Action' : 'Universal Agent'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${
                      agent.status === 'active'
                        ? 'bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-medium'
                        : 'bg-black/[0.03] dark:bg-white/[0.02] text-zinc-400'
                    }`}
                  >
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                {/* Bound Wallet Badge */}
                <div className="p-3.5 bg-black/[0.03] dark:bg-black/40 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Vault Address:</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-mono font-medium">
                      {formatShortAddress(agent.walletAddress)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Session:</span>
                    <span className="text-zinc-900 dark:text-white font-mono font-semibold">
                      {calculateRemainingTime(agent.expiresAt)}
                    </span>
                  </div>
                </div>

                {/* API Key Box with Reveal & Copy */}
                <div className="p-3 bg-black/[0.03] dark:bg-black/40 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                      <Key className="w-3 h-3 text-zinc-400" />
                      <span>Agent API Key</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Bearer / Header</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-1.5 px-2.5 bg-white dark:bg-[#18181c] rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
                    <span className="font-mono text-xs text-zinc-900 dark:text-zinc-200 truncate">
                      {revealedKeys[agent.id]
                        ? (agent.apiKey || 'nv_live_key_active')
                        : (agent.apiKey ? `${agent.apiKey.slice(0, 10)}••••••••${agent.apiKey.slice(-4)}` : 'nv_live_••••••••••••')}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleRevealKey(agent.id)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        title={revealedKeys[agent.id] ? "Hide Key" : "Reveal Key"}
                      >
                        {revealedKeys[agent.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopyKey(agent.apiKey || 'nv_live_key_active', agent.id)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy Key"
                      >
                        {copiedKeyId === agent.id ? <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-2.5 bg-black/[0.03] dark:bg-black/40 rounded-xl">
                    <span className="block text-[10px] text-zinc-500">Actions</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {agent.recentActionsCount || 0} calls
                    </span>
                  </div>
                  <div className="p-2.5 bg-black/[0.03] dark:bg-black/40 rounded-xl">
                    <span className="block text-[10px] text-zinc-500">Last Active</span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {agent.lastActiveAt ? 'Recent' : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleOpenDetails(agent)}
                    className="flex-1 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Details & Logs <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {agent.status === 'active' ? (
                    <button
                      onClick={() => revokeAgentConnection(agent.id)}
                      className="p-2 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-red-500/10 dark:hover:bg-white/[0.08] text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                      title="Revoke Access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => updateAgentExpiration(agent.id, '7d')}
                      className="p-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white transition-colors cursor-pointer text-xs font-medium font-mono"
                      title="Renew 7 Days"
                    >
                      Renew
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CONNECT AGENT (Rendered with React Portal to Document Body) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showConnectModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 sm:p-6 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              {/* Fixed Header (Never Cut Off) */}
              <div className="p-6 pb-4 flex items-center justify-between shrink-0 bg-white dark:bg-[#121215]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center font-bold text-base text-zinc-900 dark:text-white">
                    {connectType === 'claude' ? 'C' : connectType === 'chatgpt' ? 'GPT' : 'AI'}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                      Connect {connectType === 'claude' ? 'Claude Desktop' : connectType === 'chatgpt' ? 'ChatGPT' : 'Custom AI Agent'}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      Model Context Protocol Stream Configuration
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-2 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-sm font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 pt-2 overflow-y-auto no-scrollbar space-y-4 flex-1">
                {/* Step 1: Target Wallet Selection (In-Wallet Dropdown) */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    1. Target Wallet Account
                  </label>
                  <CustomSelect
                    options={walletSelectOptions}
                    value={selectedWalletAddr}
                    onChange={(val) => setSelectedWalletAddr(val)}
                    variant="form"
                    placeholder="Select Wallet Account"
                  />
                </div>

                {/* Step 2: Access Expiration Selector (Segmented Picker) */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    2. Session Access Expiration
                  </label>
                  <div className="mono-segmented-container w-full flex bg-black/[0.04] dark:bg-black p-1 rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                    {[
                      { id: '1h', label: '1 Hour' },
                      { id: '24h', label: '24 Hours' },
                      { id: '7d', label: '7 Days' },
                      { id: '30d', label: '30 Days' },
                      { id: 'never', label: 'Never' },
                    ].map((dur) => (
                      <button
                        key={dur.id}
                        type="button"
                        onClick={() => setSelectedDuration(dur.id as any)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          selectedDuration === dur.id
                            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Connection Mode & Guided Walkthrough */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      3. Connection Method
                    </label>
                    <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-black p-0.5 rounded-lg border border-black/[0.06] dark:border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setConnectionMode('zero_json')}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                          connectionMode === 'zero_json'
                            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        ⚡ Zero-JSON (UI Only)
                      </button>
                      <button
                        type="button"
                        onClick={() => setConnectionMode('json_config')}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                          connectionMode === 'json_config'
                            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        📄 Config File
                      </button>
                    </div>
                  </div>

                  {connectionMode === 'zero_json' ? (
                    <div className="space-y-3">
                      {/* Zero-JSON Claude Guide */}
                      {(connectType === 'claude' || mcpClientTab === 'claude') && (
                        <div className="p-3.5 bg-black/[0.02] dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <Bot className="w-4 h-4" /> Claude Zero-JSON Direct Connect
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold">
                              NO FILE EDITING
                            </span>
                          </div>

                          {/* Method 1: Claude.ai Web Custom Connector (Web & Mobile) */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                              Method A: Claude.ai Custom Connector (Web / Mobile)
                            </span>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-0.5">
                              <li>Open <strong>Claude.ai</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Connectors</strong> &rarr; <strong>Add custom connector</strong>.</li>
                              <li>
                                Set <strong>Name</strong> to <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[10px]">Northveil</code> and <strong>Connector URL</strong> to:
                                <div className="flex items-center justify-between gap-2 p-1.5 my-1 bg-white dark:bg-[#18181c] rounded-lg border border-black/[0.04] dark:border-white/[0.06]">
                                  <span className="font-mono text-[10px] text-zinc-800 dark:text-zinc-200 truncate">{baseMcpUrl}/mcp</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(`${baseMcpUrl}/mcp`, 'claude-streamable-url')}
                                    className="p-1 rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 cursor-pointer shrink-0"
                                    title="Copy URL"
                                  >
                                    {copiedField === 'claude-streamable-url' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </li>
                              <li>Click <strong>Connect</strong>! Claude will instantly load all 60 MCP tools with official logo.</li>
                            </ol>
                          </div>

                          {/* Method 2: 1-Click Terminal Command */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                              Method B: 1-Click Terminal Command (Claude Code / Desktop)
                            </span>
                            <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-[#18181c] rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
                              <code className="font-mono text-[11px] text-zinc-900 dark:text-zinc-200 truncate">
                                claude mcp add northveil {baseMcpUrl}/mcp
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopyText(`claude mcp add northveil ${baseMcpUrl}/mcp`, 'claude-cmd')}
                                className="px-2 py-1 rounded-lg bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.12] dark:hover:bg-white/[0.16] text-zinc-900 dark:text-white text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                {copiedField === 'claude-cmd' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                {copiedField === 'claude-cmd' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>

                          {/* Method 3: Claude Desktop Settings UI */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                              Method C: Claude Desktop UI Settings (No config file)
                            </span>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-0.5">
                              <li>Open <strong>Claude Desktop</strong> &rarr; Click <strong>Settings</strong> &rarr; <strong>Connectors / Developer</strong> &rarr; <strong>Add MCP Server</strong>.</li>
                              <li>
                                Set <strong>Name</strong>: <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[10px]">Northveil</code> and <strong>Server URL</strong> to:
                                <div className="flex items-center justify-between gap-2 p-1.5 my-1 bg-white dark:bg-[#18181c] rounded-lg border border-black/[0.04] dark:border-white/[0.06]">
                                  <span className="font-mono text-[10px] text-zinc-800 dark:text-zinc-200 truncate">{generatedSseUrl}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(generatedSseUrl, 'claude-url')}
                                    className="p-1 rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 cursor-pointer shrink-0"
                                    title="Copy URL"
                                  >
                                    {copiedField === 'claude-url' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </li>
                              <li>Click <strong>Save</strong>! All tools will load immediately.</li>
                            </ol>
                          </div>
                        </div>
                      )}

                      {/* Zero-JSON ChatGPT Guide */}
                      {(connectType === 'chatgpt' || mcpClientTab === 'chatgpt') && (
                        <div className="p-3.5 bg-black/[0.02] dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4" /> ChatGPT Custom Action / GPT Plugin
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold">
                              NO FILE EDITING
                            </span>
                          </div>

                          <div className="space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            <div className="p-2 bg-white dark:bg-[#18181c] rounded-xl border border-black/[0.04] dark:border-white/[0.06] space-y-1">
                              <span className="font-semibold text-zinc-900 dark:text-white block text-[10px]">
                                1. Schema Import URL (Copy & paste into ChatGPT)
                              </span>
                              <div className="flex items-center justify-between gap-2">
                                <code className="font-mono text-[10px] text-zinc-800 dark:text-zinc-200 truncate">
                                  {baseMcpUrl}/openapi.json
                                </code>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(`${baseMcpUrl}/openapi.json`, 'gpt-schema')}
                                  className="px-2 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-[10px] font-medium cursor-pointer shrink-0"
                                >
                                  {copiedField === 'gpt-schema' ? 'Copied' : 'Copy URL'}
                                </button>
                              </div>
                            </div>

                            <ol className="list-decimal list-inside space-y-1 pl-0.5">
                              <li>In ChatGPT, open <strong>Explore GPTs</strong> &rarr; <strong>+ Create</strong> &rarr; <strong>Configure</strong> &rarr; <strong>Actions</strong> &rarr; <strong>Create new action</strong>.</li>
                              <li>Click <strong>Import from URL</strong>, paste the schema URL copied above and click <strong>Import</strong>.</li>
                              <li>
                                Under <strong>Authentication</strong>, select <strong>OAuth</strong> (Auth URL: <code className="font-mono text-[10px]">{baseMcpUrl}/oauth/authorize</code>, Token URL: <code className="font-mono text-[10px]">{baseMcpUrl}/oauth/token</code>, Scope: <code className="font-mono text-[10px]">tools:read tools:execute</code>) or select <strong>API Key</strong> with Header <code className="font-mono text-[10px]">X-API-Key</code>.
                              </li>
                              <li>Click <strong>Save</strong>! Your GPT can now perform on-chain operations with hardware MPC security.</li>
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* Client Tabs for JSON mode */}
                      <div className="mono-segmented-container w-full flex flex-wrap bg-black/[0.04] dark:bg-black p-1 rounded-xl border border-black/[0.06] dark:border-white/[0.08] mb-2.5">
                        {[
                          { id: 'claude', label: 'Claude Desktop' },
                          { id: 'chatgpt', label: 'ChatGPT' },
                          { id: 'cursor', label: 'Cursor' },
                          { id: 'windsurf', label: 'Windsurf' },
                          { id: 'claudecode', label: 'Claude Code' },
                          { id: 'sse', label: 'Remote SSE' },
                        ].map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => setMcpClientTab(client.id as any)}
                            className={`flex-1 py-1 px-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                              mcpClientTab === client.id
                                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                            }`}
                          >
                            {client.label}
                          </button>
                        ))}
                      </div>

                      {/* Config File Location Hint */}
                      <div className="p-2.5 bg-black/[0.02] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mb-2">
                        📁 <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Config Location:</span> {getClientFilePath(mcpClientTab)}
                      </div>

                      {/* Code Snippet Box */}
                      <div className="relative">
                        <pre className="p-3.5 bg-black/[0.03] dark:bg-black border border-black/[0.06] dark:border-white/[0.08] rounded-2xl font-mono text-[11px] text-zinc-800 dark:text-zinc-200 overflow-x-auto max-h-40 leading-relaxed">
                          {claudeDesktopConfigJson}
                        </pre>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(claudeDesktopConfigJson);
                            setCopiedConfig(true);
                            setTimeout(() => setCopiedConfig(false), 2000);
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.12] dark:hover:bg-white/[0.16] text-zinc-900 dark:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-medium"
                          title="Copy Configuration"
                        >
                          {copiedConfig ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4: Non-Custodial Security & Approval Flow Guide */}
                <div className="p-3.5 bg-black/[0.02] dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-white">
                    <span>🛡️</span>
                    <span>Hardware Non-Custodial MPC Security</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    AI agents connect with read-only query capabilities by default. Whenever an agent requests a write action (transfers, DEX swaps, contract deployments), a cryptographic approval ticket is routed to your web dashboard and mobile wallet for biometric authorization.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 pb-1">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="flex-1 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveConnection}
                    className="flex-1 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-85 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  >
                    Save & Activate Connection
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: AGENT DETAILS (Rendered with React Portal to Document Body) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showDetailsModal &&
        selectedAgent &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 sm:p-6 mono-animate-in">
            <div className="bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="p-6 pb-4 flex items-center justify-between shrink-0 bg-white dark:bg-[#121215]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center font-bold text-zinc-900 dark:text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{selectedAgent.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Bound to {formatShortAddress(selectedAgent.walletAddress)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-2 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-sm font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 pt-2 overflow-y-auto no-scrollbar space-y-4 flex-1">
                {/* Agent API Key in Details */}
                <div className="p-4 bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-transparent rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-zinc-400" />
                      Agent API Key
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Header: X-API-Key</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-[#18181c] rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
                    <span className="font-mono text-xs text-zinc-900 dark:text-zinc-200 truncate">
                      {revealedKeys[selectedAgent.id]
                        ? (selectedAgent.apiKey || 'nv_live_key_active')
                        : (selectedAgent.apiKey ? `${selectedAgent.apiKey.slice(0, 12)}••••••••${selectedAgent.apiKey.slice(-4)}` : 'nv_live_••••••••••••')}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleRevealKey(selectedAgent.id)}
                        className="p-1 rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        title={revealedKeys[selectedAgent.id] ? "Hide Key" : "Reveal Key"}
                      >
                        {revealedKeys[selectedAgent.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(selectedAgent.apiKey || 'nv_live_key_active', selectedAgent.id)}
                        className="p-1 rounded hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy Key"
                      >
                        {copiedKeyId === selectedAgent.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Access expiration manager */}
                <div className="p-4 bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-transparent rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">Session Expiration:</span>
                    <span className="text-xs text-zinc-900 dark:text-white font-mono font-semibold">
                      {calculateRemainingTime(selectedAgent.expiresAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Change:</span>
                    <div className="mono-segmented-container flex-1 flex bg-black/[0.04] dark:bg-black p-1 rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                      {(['1h', '24h', '7d', '30d', 'never'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => updateAgentExpiration(selectedAgent.id, d)}
                          className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                            selectedAgent.duration === d
                              ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Granted permissions */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Granted Tool Permissions
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'get_balance',
                      'send_transfer',
                      'execute_swap',
                      'mint_tokens',
                      'deploy_smart_contract',
                      'reserve_tokens',
                      'audit_token',
                      'get_trending_memecoins',
                    ].map((perm) => (
                      <span
                        key={perm}
                        className="px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.04] dark:border-transparent text-[10px] font-mono text-zinc-800 dark:text-zinc-300 flex items-center gap-1 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-zinc-900 dark:text-white" /> {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-3 pb-1">
                  <button
                    onClick={() => {
                      revokeAgentConnection(selectedAgent.id);
                      setShowDetailsModal(false);
                    }}
                    className="py-2.5 px-4 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white text-xs font-medium cursor-pointer"
                  >
                    Revoke Access
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 cursor-pointer shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
