import {
  NorthveilConfig,
  BalanceResult,
  TokenBalance,
  NFTItem,
  SwapParams,
  DeployContractParams,
  TransactionResult
} from './types.js';

export class NorthveilClient {
  private baseUrl: string;
  private apiKey: string;
  private walletAddress: string;

  constructor(config: NorthveilConfig = {}) {
    this.baseUrl = (config.baseUrl || 'https://mcp.northveil.xyz').replace(/\/$/, '');
    this.apiKey = config.apiKey || '';
    this.walletAddress = config.walletAddress || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    if (this.walletAddress) headers['x-wallet-address'] = this.walletAddress;

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Northveil SDK Request Failed (${res.status}): ${errorText}`);
    }
    return res.json() as Promise<T>;
  }

  /**
   * Get connected wallet address and details
   */
  async getWalletAddress(): Promise<{ address: string; chain: string }> {
    return this.request<{ address: string; chain: string }>('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'get_wallet_address', arguments: {} },
        id: Date.now()
      })
    });
  }

  /**
   * Get live native token balance for a wallet across EVM or 30+ blockchains
   */
  async getBalance(chain = 'ethereum'): Promise<BalanceResult> {
    return this.request<BalanceResult>('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'get_wallet_balance', arguments: { chain, address: this.walletAddress } },
        id: Date.now()
      })
    });
  }

  /**
   * Get all ERC-20 token balances for a wallet
   */
  async getTokenBalances(chain = 'ethereum'): Promise<TokenBalance[]> {
    return this.request<TokenBalance[]>('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'get_token_balances', arguments: { chain, address: this.walletAddress } },
        id: Date.now()
      })
    });
  }

  /**
   * Get NFT balances across 30+ blockchains
   */
  async getNFTs(chain = 'ethereum'): Promise<NFTItem[]> {
    return this.request<NFTItem[]>('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'get_nft_balances', arguments: { chain, address: this.walletAddress } },
        id: Date.now()
      })
    });
  }

  /**
   * Execute token swap via DEX router
   */
  async swapTokens(params: SwapParams): Promise<TransactionResult> {
    return this.request<TransactionResult>('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'swap_tokens', arguments: params },
        id: Date.now()
      })
    });
  }

  /**
   * Compile and deploy a Smart Contract with optional socials
   */
  async deploySmartContract(params: DeployContractParams): Promise<TransactionResult> {
    return this.request<TransactionResult>('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'deploy_smart_contract', arguments: params },
        id: Date.now()
      })
    });
  }
}
