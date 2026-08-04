/**
 * Northveil Web3 Wallet & AI MCP Official JavaScript / TypeScript SDK v1.0.0
 * Allows developers to interact programmatically with Northveil API, Execute Smart Contract Deployments, and Call MCP Tools.
 */

export interface NorthveilSDKConfig {
  apiKey: string;
  baseUrl?: string;
  walletAddress?: string;
}

export interface PortfolioAsset {
  symbol: string;
  balance: number;
  priceUsd: number;
  totalUsd: number;
}

export interface PortfolioResponse {
  formattedMarkdown?: string;
  walletAddress: string;
  netWorthUsd: number;
  totalAssetsCount: number;
  assets: PortfolioAsset[];
}

export interface DeploymentResponse {
  formattedMarkdown?: string;
  contractName: string;
  deployedAddress: string;
  txHash: string;
  network: string;
  explorerUrl: string;
  status: string;
}

export class NorthveilSDK {
  private apiKey: string;
  private baseUrl: string;
  private walletAddress?: string;

  constructor(config: NorthveilSDKConfig) {
    if (!config.apiKey) {
      throw new Error('[Northveil SDK Error]: API key is required. (e.g. nv_live_...)');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || 'https://northveil.vercel.app').replace(/\/$/, '');
    this.walletAddress = config.walletAddress;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...(this.walletAddress ? { 'X-Wallet-Address': this.walletAddress } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[Northveil SDK HTTP ${res.status}]: ${errText}`);
    }
    return res.json();
  }

  /**
   * Check live server health status
   */
  public async getHealth(): Promise<{ status: string; server: string; timestamp: string }> {
    return this.request('/health');
  }

  /**
   * Execute an MCP Tool call directly (e.g., get_portfolio, deploy_smart_contract, execute_swap)
   */
  public async callTool<T = any>(toolName: string, args: Record<string, any> = {}): Promise<T> {
    const payload = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: toolName, arguments: args },
      id: Date.now(),
    };

    const data = await this.request('/mcp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return data.result;
  }

  /**
   * Fetch live wallet portfolio & assets
   */
  public async getPortfolio(): Promise<PortfolioResponse> {
    const res = await this.callTool('get_portfolio', {});
    return res as PortfolioResponse;
  }

  /**
   * Deploy a compiled Solidity smart contract to a real EVM blockchain
   */
  public async deploySmartContract(contractName: string, network: string = 'sepolia'): Promise<DeploymentResponse> {
    const res = await this.callTool('deploy_smart_contract', { contractName, network });
    return res as DeploymentResponse;
  }

  /**
   * Execute a token transfer on-chain
   */
  public async sendTransfer(token: string, amount: number, recipientAddress: string): Promise<any> {
    return this.callTool('send_transfer', { token, amount, recipientAddress });
  }
}
