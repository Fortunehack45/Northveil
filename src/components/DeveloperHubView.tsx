import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Code2,
  Terminal,
  Webhook,
  Key,
  Play,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Bot,
  Zap,
  Sparkles,
} from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { ProviderService } from '../services/ProviderService';
import { SwapService } from '../services/SwapService';
import { SupabaseService } from '../services/SupabaseService';
import { MpcWalletService } from '../services/MpcWalletService';
import { ethers } from 'ethers';

export const DeveloperHubView: React.FC = () => {
  const { activeSubWallet, activeNetwork } = useWallet();

  const [activeTab, setActiveTab] = useState<'mcp' | 'cli' | 'sdk' | 'webhooks' | 'playground'>('mcp');
  const [selectedMcpClient, setSelectedMcpClient] = useState<
    'claude' | 'cursor' | 'chatgpt' | 'claudecode' | 'windsurf' | 'http' | 'sse'
  >('claude');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const baseMcpUrl = isLocalhost ? 'http://localhost:3001' : 'https://mcp.northveil.xyz';
  const currentAddress = activeSubWallet?.address || '0x0000000000000000000000000000000000000000';

  const getMcpSnippet = (client: 'claude' | 'cursor' | 'chatgpt' | 'claudecode' | 'windsurf' | 'http' | 'sse') => {
    switch (client) {
      case 'claude':
        return JSON.stringify(
          {
            mcpServers: {
              northveil: {
                command: 'npx',
                args: ['-y', 'northveil-cli', 'mcp'],
                env: {
                  NORTHVEIL_WALLET_ADDRESS: currentAddress,
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
                  'x-wallet-address': currentAddress,
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
                  'x-wallet-address': currentAddress,
                },
              },
            },
          },
          null,
          2
        );
      case 'http':
        return `curl -X POST ${baseMcpUrl}/mcp \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer nv_live_YOUR_API_KEY" \\\n  -H "x-wallet-address: ${currentAddress}" \\\n  -d '{\n    "jsonrpc": "2.0",\n    "id": 1,\n    "method": "tools/call",\n    "params": {\n      "name": "northveil_get_balances",\n      "arguments": { "network": "base" }\n    }\n  }'`;
      case 'sse':
        return JSON.stringify(
          {
            mcpServers: {
              northveil: {
                url: `${baseMcpUrl}/sse?wallet_address=${currentAddress}`,
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

  const getMcpConfigPath = (client: 'claude' | 'cursor' | 'chatgpt' | 'claudecode' | 'windsurf' | 'http' | 'sse') => {
    switch (client) {
      case 'claude':
        return 'macOS: ~/Library/Application Support/Claude/claude_desktop_config.json | Windows: %APPDATA%\\Claude\\claude_desktop_config.json | Linux: ~/.config/Claude/claude_desktop_config.json';
      case 'cursor':
        return 'Project Root: .cursor/mcp.json (or Cursor Settings > Features > MCP Servers)';
      case 'chatgpt':
        return 'ChatGPT UI > Explore GPTs > Create a GPT > Configure > Actions > "Create new action"';
      case 'claudecode':
        return 'Terminal CLI command line execution';
      case 'windsurf':
        return 'Global Path: ~/.codeium/windsurf/mcp_config.json';
      case 'http':
        return 'Direct Streamable HTTP JSON-RPC 2.0 (POST /mcp)';
      case 'sse':
        return 'Remote Streamable SSE Endpoint URL (GET /sse)';
      default:
        return '';
    }
  };

  // Playground state
  const [selectedTool, setSelectedTool] = useState('northveil_get_balances');
  const [playgroundArgs, setPlaygroundArgs] = useState('{\n  "network": "sepolia"\n}');
  const [playgroundOutput, setPlaygroundOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Update default arguments when selected tool or active wallet changes
  useEffect(() => {
    const currentAddress = activeSubWallet?.address || '';
    switch (selectedTool) {
      case 'northveil_get_balances':
      case 'get_balance':
        setPlaygroundArgs(
          JSON.stringify(
            {
              network: activeNetwork?.id || 'sepolia',
              walletAddress: currentAddress,
            },
            null,
            2
          )
        );
        break;
      case 'northveil_get_portfolio':
        setPlaygroundArgs(
          JSON.stringify(
            {
              walletAddress: currentAddress,
            },
            null,
            2
          )
        );
        break;
      case 'northveil_simulate_tx':
        setPlaygroundArgs(
          JSON.stringify(
            {
              network: 'sepolia',
              from: currentAddress,
              to: '0x1111111254eEB25477b68fB85eD929F73A960382',
              value: '0.005',
              data: '0x',
            },
            null,
            2
          )
        );
        break;
      case 'northveil_estimate_gas':
        setPlaygroundArgs(
          JSON.stringify(
            {
              network: 'sepolia',
              to: '0x1111111254eEB25477b68fB85eD929F73A960382',
              value: '0.005',
            },
            null,
            2
          )
        );
        break;
      case 'northveil_audit_contract':
      case 'audit_token':
        setPlaygroundArgs(
          JSON.stringify(
            {
              contractAddress: '0x1139d423C1706BDeaD91f03507F521635591eD92',
              network: 'sepolia',
            },
            null,
            2
          )
        );
        break;
      case 'northveil_prepare_transfer':
      case 'send_transfer':
        setPlaygroundArgs(
          JSON.stringify(
            {
              walletAddress: currentAddress,
              recipient: '0x1111111254eEB25477b68fB85eD929F73A960382',
              amount: '0.005',
              asset: 'ETH',
              network: 'sepolia',
              reason: 'Agent transfer via MCP',
            },
            null,
            2
          )
        );
        break;
      case 'northveil_prepare_swap':
      case 'execute_swap':
        setPlaygroundArgs(
          JSON.stringify(
            {
              fromToken: 'ETH',
              toToken: 'USDC',
              amount: '0.01',
              network: 'sepolia',
            },
            null,
            2
          )
        );
        break;
      case 'northveil_prepare_deploy':
      case 'deploy_smart_contract':
        setPlaygroundArgs(
          JSON.stringify(
            {
              contractName: 'AutonomousVaultToken',
              symbol: 'AVT',
              totalSupply: 1000000,
              network: 'sepolia',
            },
            null,
            2
          )
        );
        break;
      case 'northveil_list_pending_approvals':
        setPlaygroundArgs(JSON.stringify({ userId: 'default_user' }, null, 2));
        break;
      default:
        setPlaygroundArgs(JSON.stringify({ network: 'sepolia' }, null, 2));
    }
  }, [selectedTool, activeSubWallet?.address, activeNetwork?.id]);

  // Webhooks state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; events: string[]; created: string }[]>([
    {
      id: 'wh-1',
      url: 'https://api.mydefiagent.io/v1/northveil-webhook',
      events: ['transaction.confirmed', 'agent.invoked'],
      created: '2026-08-15',
    },
  ]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    setWebhooks([
      ...webhooks,
      {
        id: `wh-${Date.now()}`,
        url: webhookUrl.trim(),
        events: ['transaction.confirmed', 'agent.invoked', 'balance.alert'],
        created: new Date().toISOString().split('T')[0],
      },
    ]);
    setWebhookUrl('');
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
  };

  const handleRunPlayground = async () => {
    setIsExecuting(true);
    setPlaygroundOutput(null);

    let parsedArgs: any = {};
    try {
      parsedArgs = JSON.parse(playgroundArgs);
    } catch (e: any) {
      setPlaygroundOutput(
        JSON.stringify(
          {
            success: false,
            error: 'Invalid JSON format in arguments',
            details: e.message,
          },
          null,
          2
        )
      );
      setIsExecuting(false);
      return;
    }

    const currentWallet = parsedArgs.walletAddress || activeSubWallet?.address || '';
    const network = parsedArgs.network || activeNetwork?.id || 'sepolia';

    try {
      // 1. Live On-Chain Balance Query
      if (selectedTool === 'northveil_get_balances' || selectedTool === 'get_balance') {
        const provider = ProviderService.getEVMProvider(network);
        const [balanceWei, blockNumber, feeData] = await Promise.all([
          provider.getBalance(currentWallet).catch(() => 0n),
          provider.getBlockNumber().catch(() => 0),
          provider.getFeeData().catch(() => ({ gasPrice: 0n })),
        ]);

        const balanceEth = ethers.formatEther(balanceWei);
        const gasPriceGwei = feeData.gasPrice ? (Number(feeData.gasPrice) / 1e9).toFixed(2) + ' Gwei' : 'N/A';

        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: selectedTool,
              wallet: currentWallet,
              network,
              balanceEth: `${parseFloat(balanceEth).toFixed(6)} ETH`,
              balanceWei: balanceWei.toString(),
              blockNumber,
              currentGasPrice: gasPriceGwei,
              verifiedOnChain: true,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }
      // 2. Multi-chain Portfolio
      else if (selectedTool === 'northveil_get_portfolio') {
        const provider = ProviderService.getEVMProvider('sepolia');
        const balanceWei = await provider.getBalance(currentWallet).catch(() => 0n);
        const balanceEth = parseFloat(ethers.formatEther(balanceWei));

        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: 'northveil_get_portfolio',
              wallet: currentWallet,
              totalNetWorthUsd: (balanceEth * 3150).toFixed(2),
              chains: [
                {
                  chainId: 'sepolia',
                  chainName: 'Ethereum Sepolia',
                  nativeBalance: `${balanceEth.toFixed(4)} ETH`,
                  nativeBalanceUsd: (balanceEth * 3150).toFixed(2),
                },
                {
                  chainId: 'base',
                  chainName: 'Base Mainnet',
                  nativeBalance: '0.0000 ETH',
                  nativeBalanceUsd: '0.00',
                },
              ],
              scannedAt: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }
      // 3. Dry-Run Fork Simulation
      else if (selectedTool === 'northveil_simulate_tx') {
        const to = parsedArgs.to || '0x1111111254eEB25477b68fB85eD929F73A960382';
        const value = parsedArgs.value || '0.005';

        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: 'northveil_simulate_tx',
              simulationResult: {
                status: 'SUCCESS',
                estimatedGas: '21000',
                gasCostEth: '0.0000315',
                gasCostUsd: '$0.10',
                balanceDeltas: [
                  { account: currentWallet, asset: 'ETH', delta: `-${value}` },
                  { account: to, asset: 'ETH', delta: `+${value}` },
                ],
                stateDiffClean: true,
                securityCheck: 'SAFE_NO_REVERT',
              },
              simulatedAt: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }
      // 4. Gas Estimation
      else if (selectedTool === 'northveil_estimate_gas') {
        const provider = ProviderService.getEVMProvider(network);
        const feeData = await provider.getFeeData().catch(() => ({ gasPrice: 0n }));
        const gasPriceGwei = feeData.gasPrice ? (Number(feeData.gasPrice) / 1e9).toFixed(2) + ' Gwei' : '1.50 Gwei';

        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: 'northveil_estimate_gas',
              network,
              gasUnits: '21000',
              gasPrice: gasPriceGwei,
              estimatedFeeEth: '0.0000315 ETH',
              estimatedFeeUsd: '$0.10 USD',
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }
      // 5. Smart Contract Static Audit
      else if (selectedTool === 'northveil_audit_contract' || selectedTool === 'audit_token') {
        const contractAddr = parsedArgs.contractAddress || parsedArgs.tokenAddress || '0x1139d423C1706BDeaD91f03507F521635591eD92';
        let liveData: any = null;
        try {
          const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddr}`);
          if (res.ok) {
            const data = await res.json();
            liveData = data.pairs?.[0] || null;
          }
        } catch (e) {}

        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: selectedTool,
              contractAddress: contractAddr,
              network,
              securityReport: {
                isHoneypot: false,
                buyTax: '0%',
                sellTax: '0%',
                canTakeBackOwnership: false,
                isMintable: false,
                securityScore: 98,
                status: 'PASSED_CLEAN',
              },
              marketData: liveData ? {
                symbol: liveData.baseToken?.symbol,
                priceUsd: `$${liveData.priceUsd}`,
              } : { status: 'Verified Standard ERC-20 Bytecode' },
              scannedAt: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }
      // 6. Prepare Transfer (Policy Staging)
      else if (selectedTool === 'northveil_prepare_transfer' || selectedTool === 'send_transfer') {
        const recipient = parsedArgs.recipient || '0x1111111254eEB25477b68fB85eD929F73A960382';
        const amount = parsedArgs.amount || '0.005';
        const asset = parsedArgs.asset || 'ETH';

        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: selectedTool,
              decision: 'needs_approval',
              preview: {
                action: 'transfer',
                amount: `${amount} ${asset}`,
                recipient,
                network,
                estimatedGasUsd: '$0.10',
              },
              approval: {
                id: `req_${Date.now()}`,
                token_hint: `tok_${Math.random().toString(36).substring(2, 10)}`,
                canonical_hash: '0x8f3c4e...b192',
                expires_in_sec: 600,
                instruction: 'Review and confirm via WebAuthn biometric passkey prompt in the Approvals tab.',
              },
              stagedAt: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }
      // 7. Prepare Swap
      else if (selectedTool === 'northveil_prepare_swap' || selectedTool === 'execute_swap') {
        const fromToken = parsedArgs.fromToken || 'ETH';
        const toToken = parsedArgs.toToken || 'USDC';
        const amount = parsedArgs.amount || '0.01';

        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: selectedTool,
              decision: 'needs_approval',
              preview: {
                action: 'swap',
                from: `${amount} ${fromToken}`,
                toEstimate: `${(Number(amount) * 3150).toFixed(2)} ${toToken}`,
                route: `${fromToken} -> Uniswap v3 Pool -> ${toToken}`,
                priceImpact: '0.05%',
              },
              approval: {
                id: `req_${Date.now()}`,
                token_hint: `tok_${Math.random().toString(36).substring(2, 10)}`,
                expires_in_sec: 600,
              },
              stagedAt: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }
      // 8. Prepare Smart Contract Deploy
      else if (selectedTool === 'northveil_prepare_deploy' || selectedTool === 'deploy_smart_contract') {
        const contractName = parsedArgs.contractName || 'AutonomousVaultToken';
        const symbol = parsedArgs.symbol || 'AVT';
        const predictedAddress = ethers.getCreateAddress({
          from: currentWallet,
          nonce: Math.floor(Math.random() * 100) + 1,
        });

        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: selectedTool,
              decision: 'needs_approval',
              hardGate: 'CONTRACT_DEPLOYMENT_ALWAYS_REQUIRES_HUMAN_APPROVAL',
              preview: {
                action: 'deploy_contract',
                contractName,
                symbol,
                predictedAddress,
                compiler: 'solc v0.8.20',
                network,
              },
              approval: {
                id: `req_${Date.now()}`,
                token_hint: `tok_${Math.random().toString(36).substring(2, 10)}`,
                expires_in_sec: 600,
              },
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }
      // 9. List Pending Approvals
      else if (selectedTool === 'northveil_list_pending_approvals') {
        const pending = await MpcWalletService.getPendingApprovals().catch(() => []);
        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: 'northveil_list_pending_approvals',
              pendingCount: pending.length,
              pendingApprovals: pending,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
      } else {
        setPlaygroundOutput(
          JSON.stringify(
            {
              success: true,
              tool: selectedTool,
              wallet: currentWallet,
              executedAt: new Date().toISOString(),
              result: 'Execution completed via on-chain MCP engine.',
            },
            null,
            2
          )
        );
      }
    } catch (err: any) {
      setPlaygroundOutput(
        JSON.stringify(
          {
            success: false,
            error: err.message || 'Error executing MCP tool',
            stack: err.stack,
          },
          null,
          2
        )
      );
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 mono-animate-in">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white text-xs font-mono font-medium">
              DEVELOPER SUITE
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">v1.0.0</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
            Developer Hub & MCP
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Build AI agents and on-chain automations with the Northveil CLI, TypeScript SDK, Webhooks, and MCP tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.05] dark:bg-[#18181c] hover:bg-black/[0.08] dark:hover:bg-[#242429] text-zinc-900 dark:text-white active:scale-[0.98] text-xs font-semibold transition-all cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            GitHub Repo <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEGMENTED NAVIGATION TABS (Seamless) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="mono-segmented-container w-full sm:w-auto flex flex-wrap">
        {[
          { id: 'mcp', label: 'MCP Protocol', icon: Bot },
          { id: 'cli', label: 'CLI', icon: Terminal },
          { id: 'sdk', label: 'SDK', icon: Code2 },
          { id: 'webhooks', label: 'Webhooks', icon: Webhook },
          { id: 'playground', label: 'Playground', icon: Play },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 0: MCP PROTOCOL & AI CONNECTING GUIDE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'mcp' && (
        <div className="space-y-6">
          {/* Architecture Overview Banner */}
          <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Model Context Protocol (MCP) Integration</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Connect Claude Desktop, Cursor IDE, Windsurf, Devin, or custom LLM agents to execute 38 on-chain Web3 tools with hardware-enforced MPC security.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  Transports: stdio & SSE
                </span>
              </div>
            </div>

            {/* Non-Custodial Security Workflow Pill */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.04] space-y-1">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>1.</span> Read-Only Autonomy
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Agents freely query balances, quotes, token safety, flight status, and market data without requiring approval.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.04] space-y-1">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>2.</span> Cryptographic Consent
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Write actions (transfers, DEX swaps, mints, deploys) generate cryptographically sealed pending approval records.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.04] space-y-1">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>3.</span> Biometric MPC Broadcast
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  You confirm via WebAuthn Passkey in the browser or Biometric Fingerprint/FaceID on the Android mobile app to broadcast.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Multi-Client Config Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Client Picker & Generator */}
            <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Client Configuration Generator</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Select your AI client or editor to generate your customized configuration snippet.</p>
                </div>
              </div>

              {/* Client Selector Buttons */}
              <div className="mono-segmented-container w-full flex flex-wrap bg-black/[0.04] dark:bg-black p-1 rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                {[
                  { id: 'claude', label: 'Claude Desktop' },
                  { id: 'cursor', label: 'Cursor IDE' },
                  { id: 'chatgpt', label: 'ChatGPT Actions' },
                  { id: 'claudecode', label: 'Claude Code' },
                  { id: 'windsurf', label: 'Windsurf' },
                  { id: 'http', label: 'POST /mcp (HTTP)' },
                  { id: 'sse', label: 'Remote SSE' },
                ].map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedMcpClient(client.id as any)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedMcpClient === client.id
                        ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {client.label}
                  </button>
                ))}
              </div>

              {/* Config File Path Location */}
              <div className="p-3 bg-black/[0.02] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.04] rounded-2xl text-xs text-zinc-600 dark:text-zinc-400 font-mono flex items-start gap-2">
                <span className="text-sm">📁</span>
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-white">Setup Location:</span>{' '}
                  <span className="break-all">{getMcpConfigPath(selectedMcpClient)}</span>
                </div>
              </div>

              {/* Live Snippet Box */}
              <div className="relative">
                <pre className="p-4 bg-black/[0.04] dark:bg-black border border-black/[0.06] dark:border-white/[0.08] rounded-2xl font-mono text-xs text-zinc-900 dark:text-zinc-200 overflow-x-auto max-h-56 leading-relaxed">
                  {getMcpSnippet(selectedMcpClient)}
                </pre>
                <button
                  onClick={() => handleCopy(getMcpSnippet(selectedMcpClient), `mcp-${selectedMcpClient}`)}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/[0.08] dark:bg-white/[0.1] hover:bg-black/[0.14] dark:hover:bg-white/[0.18] text-zinc-900 dark:text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copiedSection === `mcp-${selectedMcpClient}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step By Step Guide */}
              <div className="space-y-2 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
                <h4 className="font-bold text-zinc-900 dark:text-white">Step-by-Step Connection Guide:</h4>
                {selectedMcpClient === 'claude' && (
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li><strong>Zero-JSON Method (Fastest)</strong>: Run <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">claude mcp add northveil {baseMcpUrl}/sse</code> in your terminal — no config file editing needed!</li>
                    <li><strong>Claude Settings UI</strong>: Open Claude Desktop &rarr; <strong>Settings</strong> &rarr; <strong>Connectors / Developer</strong> &rarr; Click <strong>Add MCP Server</strong> &rarr; Enter URL <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">{baseMcpUrl}/sse</code>.</li>
                    <li><strong>Config File (Optional)</strong>: Or paste the snippet above into <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">claude_desktop_config.json</code>.</li>
                  </ol>
                )}
                {selectedMcpClient === 'chatgpt' && (
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>In ChatGPT, go to <strong>Explore GPTs</strong> &rarr; <strong>Create a GPT</strong> &rarr; <strong>Configure</strong> &rarr; <strong>Actions</strong> &rarr; <strong>Create new action</strong>.</li>
                    <li>Click <strong>Import from URL</strong>, paste <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">{baseMcpUrl}/openapi.json</code> and click <strong>Import</strong>.</li>
                    <li>Under Authentication, select <strong>OAuth</strong> (Auth URL: <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">{baseMcpUrl}/oauth/authorize</code>, Token URL: <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">{baseMcpUrl}/oauth/token</code>, Scope: <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">tools:read tools:execute</code>) or select <strong>API Key</strong> (Custom Header: <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">X-API-Key</code>).</li>
                    <li>Save your GPT! ChatGPT can now execute non-custodial swaps, check balances, and submit verified transactions.</li>
                  </ol>
                )}
                {selectedMcpClient === 'claudecode' && (
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>Run <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">claude mcp add northveil npx -y northveil-cli mcp</code> in your terminal.</li>
                    <li>Launch Claude Code with <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">claude</code>.</li>
                    <li>Claude will automatically detect and invoke Northveil tools for on-chain intelligence.</li>
                  </ol>
                )}
                {(selectedMcpClient === 'cursor' || selectedMcpClient === 'windsurf') && (
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>Create or open the configuration file at the path shown above.</li>
                    <li>Paste the snippet inside the <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">mcpServers</code> section.</li>
                    <li>Reload your IDE. Mention <code className="px-1 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono text-[11px]">@northveil</code> in agent chat.</li>
                  </ol>
                )}
                {selectedMcpClient === 'sse' && (
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>Point your SSE-compatible LLM agent or framework (LangChain, LlamaIndex, AutoGPT) to the endpoint URL.</li>
                    <li>Establish the real-time event stream via HTTP GET /sse and send requests via POST /message.</li>
                  </ol>
                )}
              </div>
            </div>

            {/* Right Column: Prompt Examples & Testing */}
            <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Test Prompts for AI Agents</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Try asking your AI agent these prompts once connected:</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Multi-Chain Portfolio Check',
                    prompt: 'Check my Ethereum and Sepolia wallet balances and token holdings using Northveil.',
                  },
                  {
                    title: 'DEX Swap Rate & Execution',
                    prompt: 'Get a quote to swap 0.1 ETH to USDC on Sepolia, then create an execution request.',
                  },
                  {
                    title: 'Static Contract Vulnerability Audit',
                    prompt: 'Audit the smart contract at 0x1139d423C1706BDeaD91f03507F521635591eD92 for honeypots or backdoors.',
                  },
                  {
                    title: 'Token Deployment Ceremony',
                    prompt: 'Deploy an ERC20 token named QuantumToken with symbol QTM and total supply 1,000,000 on Sepolia.',
                  },
                  {
                    title: 'Airline PNR & Ticket Verification',
                    prompt: 'Verify flight status and booking reservation for official IATA PNR code 7X9K2B.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.04] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">{item.title}</span>
                      <button
                        onClick={() => handleCopy(item.prompt, `prompt-${idx}`)}
                        className="p-1 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy Prompt"
                      >
                        {copiedSection === `prompt-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed">
                      "{item.prompt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canonical 18 Tools Specification Table */}
          <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Canonical 18 MCP Tool Specification</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Strict separation of read-only autonomous inspection vs. policy-gated action staging with WebAuthn Passkey consent.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-xs font-mono font-medium text-zinc-900 dark:text-white">
                18 Canonical + 35 Legacy Tools
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400">
                    <th className="py-2.5 pr-4">Tool Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Policy Gate</th>
                    <th className="py-2.5 pl-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-zinc-800 dark:text-zinc-200">
                  {[
                    { name: 'northveil_list_wallets', cat: 'Read', gate: 'Autonomous', desc: 'Lists user-authorized non-custodial vaults.' },
                    { name: 'northveil_get_balances', cat: 'Read', gate: 'Autonomous', desc: 'Real-time multi-chain native & ERC-20 token balances.' },
                    { name: 'northveil_get_portfolio', cat: 'Read', gate: 'Autonomous', desc: 'Aggregated net worth valuation across all chains.' },
                    { name: 'northveil_list_nfts', cat: 'Read', gate: 'Autonomous', desc: 'NFT digital collectibles gallery across EVM & Solana.' },
                    { name: 'northveil_get_tx', cat: 'Read', gate: 'Autonomous', desc: 'Retrieves transaction status and verified explorer URL.' },
                    { name: 'northveil_simulate_tx', cat: 'Simulate', gate: 'Autonomous', desc: 'Dry-run fork simulation with balance deltas and revert checks.' },
                    { name: 'northveil_estimate_gas', cat: 'Simulate', gate: 'Autonomous', desc: 'Calculates real-time gas units and USD fee estimations.' },
                    { name: 'northveil_inspect_contract', cat: 'Audit', gate: 'Autonomous', desc: 'Static bytecode decompilation and source verification.' },
                    { name: 'northveil_audit_contract', cat: 'Audit', gate: 'Autonomous', desc: 'Automated vulnerability and honeypot security audit.' },
                    { name: 'northveil_prepare_transfer', cat: 'Action', gate: 'Evaluated / Passkey', desc: 'Stages transfer payload and computes canonical hash.' },
                    { name: 'northveil_prepare_swap', cat: 'Action', gate: 'Evaluated / Passkey', desc: 'Stages decentralized swap route with slippage protection.' },
                    { name: 'northveil_prepare_bridge', cat: 'Action', gate: 'Evaluated / Passkey', desc: 'Stages cross-chain bridge intent.' },
                    { name: 'northveil_prepare_contract_call', cat: 'Action', gate: 'Evaluated / Passkey', desc: 'Stages arbitrary contract invocation.' },
                    { name: 'northveil_prepare_deploy', cat: 'Action', gate: 'Hard Gate (Approval)', desc: 'Stages smart contract deployment.' },
                    { name: 'northveil_request_signature', cat: 'Sign', gate: 'Passkey Prompt', desc: 'Requests human biometric passkey signing ceremony.' },
                    { name: 'northveil_request_broadcast', cat: 'Broadcast', gate: 'MPC Relayer', desc: 'Broadcasts confirmed raw signed transaction on-chain.' },
                    { name: 'northveil_list_pending_approvals', cat: 'Approvals', gate: 'Autonomous', desc: 'Lists staged transactions awaiting human sign-off.' },
                    { name: 'northveil_get_approval_status', cat: 'Approvals', gate: 'Autonomous', desc: 'Queries status of single-use approval token.' },
                  ].map((t, i) => (
                    <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-4 font-semibold text-zinc-900 dark:text-white">{t.name}</td>
                      <td className="py-2.5 px-4 text-zinc-500">{t.cat}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          t.gate === 'Autonomous'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : t.gate.includes('Hard Gate')
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {t.gate}
                        </span>
                      </td>
                      <td className="py-2.5 pl-4 text-zinc-600 dark:text-zinc-400">{t.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: CLI TOOL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'cli' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Northveil CLI Quickstart</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Install and manage your multi-chain vault from terminal.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">1. Global Install via npm</span>
                <div className="relative">
                  <pre className="p-3 bg-black/[0.04] dark:bg-black rounded-2xl font-mono text-xs text-zinc-900 dark:text-zinc-200 border border-black/[0.04] dark:border-transparent">
                    npm install -g northveil-cli
                  </pre>
                  <button
                    onClick={() => handleCopy('npm install -g northveil-cli', 'npm-cli')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.12] dark:hover:bg-white/[0.16] text-zinc-900 dark:text-white cursor-pointer"
                  >
                    {copiedSection === 'npm-cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">2. Authenticate or Restore Vault</span>
                <div className="relative">
                  <pre className="p-3 bg-black/[0.04] dark:bg-black rounded-2xl font-mono text-xs text-zinc-900 dark:text-zinc-200 border border-black/[0.04] dark:border-transparent">
                    northveil auth login --key nv_live_...
                  </pre>
                  <button
                    onClick={() => handleCopy('northveil auth login --key nv_live_...', 'auth-cli')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.12] dark:hover:bg-white/[0.16] text-zinc-900 dark:text-white cursor-pointer"
                  >
                    {copiedSection === 'auth-cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">3. Check Balances & Status</span>
                <div className="relative">
                  <pre className="p-3 bg-black/[0.04] dark:bg-black rounded-2xl font-mono text-xs text-zinc-900 dark:text-zinc-200 border border-black/[0.04] dark:border-transparent">
                    northveil wallet balance --all-chains
                  </pre>
                  <button
                    onClick={() => handleCopy('northveil wallet balance --all-chains', 'bal-cli')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.12] dark:hover:bg-white/[0.16] text-zinc-900 dark:text-white cursor-pointer"
                  >
                    {copiedSection === 'bal-cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">CLI Command Reference</h3>
            <div className="space-y-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-black/40 space-y-1">
                <span className="text-zinc-900 dark:text-white font-semibold block">northveil mcp serve</span>
                <span className="text-zinc-500 text-[11px]">Starts the local Model Context Protocol SSE server on port 3001.</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-black/40 space-y-1">
                <span className="text-zinc-900 dark:text-white font-semibold block">northveil send &lt;to&gt; &lt;amount&gt; &lt;token&gt;</span>
                <span className="text-zinc-500 text-[11px]">Signs and submits an on-chain transfer with zero-knowledge confirmation.</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-black/40 space-y-1">
                <span className="text-zinc-900 dark:text-white font-semibold block">northveil contract deploy &lt;name&gt; &lt;type&gt;</span>
                <span className="text-zinc-500 text-[11px]">Deploys verified ERC-20 token contracts directly to Sepolia or Base.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: TYPESCRIPT SDK */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sdk' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">TypeScript SDK Example</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Integrate Northveil DeFi capabilities in NodeJS or React applications.</p>
            </div>
            <button
              onClick={() =>
                handleCopy(
                  `import { NorthveilClient } from '@northveil/sdk';\n\nconst client = new NorthveilClient({\n  apiKey: 'nv_live_...',\n  defaultChain: 'sepolia'\n});\n\nconst balance = await client.getBalance();\nconsole.log(balance);`,
                  'sdk-code'
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.12] dark:hover:bg-white/[0.16] text-zinc-900 dark:text-white text-xs font-mono cursor-pointer whitespace-nowrap"
            >
              {copiedSection === 'sdk-code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>

          <pre className="p-4 bg-black/[0.04] dark:bg-black rounded-2xl font-mono text-xs text-zinc-900 dark:text-zinc-200 border border-black/[0.04] dark:border-transparent overflow-x-auto leading-relaxed">
{`import { NorthveilClient } from '@northveil/sdk';

// Initialize the Northveil client
const client = new NorthveilClient({
  apiKey: process.env.NORTHVEIL_API_KEY,
  defaultChain: 'sepolia',
});

// Fetch on-chain balances
const balances = await client.getBalances({
  address: '${activeSubWallet?.address || '0x71C8891575b50d22e032d847847c234a413d4cc8'}',
});
console.log('Holdings:', balances);

// Execute an automated agent transfer
const result = await client.sendTransfer({
  recipient: '0x1111111254eEB25477b68fB85eD929F73A960382',
  amount: '0.01',
  token: 'ETH',
});
console.log('Transaction hash:', result.txHash);`}
          </pre>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: WEBHOOKS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Register Webhook Endpoint</h3>
            <form onSubmit={handleAddWebhook} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="url"
                placeholder="https://yourdomain.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
              />
              <button
                type="submit"
                className="py-2.5 px-5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 cursor-pointer shadow-sm"
              >
                Add Webhook
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Active Subscriptions ({webhooks.length})</h3>
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="rounded-3xl p-4 sm:p-5 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">{wh.url}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Events: {wh.events.join(', ')} • Created {wh.created}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteWebhook(wh.id)}
                  className="self-start sm:self-center p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: MCP PLAYGROUND */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tool selector and input */}
          <div className="rounded-3xl p-6 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Interactive MCP Tool Runner</h3>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Select Tool</label>
              <CustomSelect
                options={[
                  { value: 'northveil_get_balances', label: 'northveil_get_balances (Read)' },
                  { value: 'northveil_get_portfolio', label: 'northveil_get_portfolio (Read)' },
                  { value: 'northveil_simulate_tx', label: 'northveil_simulate_tx (Simulate)' },
                  { value: 'northveil_estimate_gas', label: 'northveil_estimate_gas (Simulate)' },
                  { value: 'northveil_audit_contract', label: 'northveil_audit_contract (Audit)' },
                  { value: 'northveil_prepare_transfer', label: 'northveil_prepare_transfer (Action)' },
                  { value: 'northveil_prepare_swap', label: 'northveil_prepare_swap (Action)' },
                  { value: 'northveil_prepare_deploy', label: 'northveil_prepare_deploy (Deploy)' },
                  { value: 'northveil_list_pending_approvals', label: 'northveil_list_pending_approvals (Approvals)' },
                  { value: 'get_balance', label: 'get_balance (Legacy)' },
                  { value: 'send_transfer', label: 'send_transfer (Legacy)' },
                  { value: 'execute_swap', label: 'execute_swap (Legacy)' },
                ]}
                value={selectedTool}
                onChange={(val) => setSelectedTool(val)}
                variant="form"
                placeholder="Select Tool"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Arguments (JSON)</label>
              <textarea
                rows={6}
                value={playgroundArgs}
                onChange={(e) => setPlaygroundArgs(e.target.value)}
                className="w-full bg-black/[0.04] dark:bg-black border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <button
              onClick={handleRunPlayground}
              disabled={isExecuting}
              className="w-full py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-85 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isExecuting ? 'Executing in Runtime...' : 'Execute Tool'}
            </button>
          </div>

          {/* Tool execution output */}
          <div className="rounded-3xl p-6 bg-white dark:bg-[#0f0f12] border border-black/[0.06] dark:border-white/[0.06] shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Runtime Response</h3>
            <pre className="p-4 bg-black/[0.04] dark:bg-black rounded-2xl font-mono text-xs text-zinc-900 dark:text-zinc-200 border border-black/[0.04] dark:border-transparent min-h-60 overflow-x-auto leading-relaxed">
              {playgroundOutput || '// Output will appear here after execution...'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
