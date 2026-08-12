import {
  NorthveilConfig,
  BalanceResult,
  TokenBalance,
  NFTItem,
  SwapParams,
  DeployContractParams,
  TransactionResult,
  TokenPrice,
  TrendingMemecoin,
  TokenAuditResult,
  TradeOrderParams,
  TradeOrder,
  WalletHealthResult,
  SecurityScanResult,
  SendTransferParams,
  GasEstimate,
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

  private mcpCall<T>(toolName: string, args: Record<string, any> = {}): Promise<T> {
    return this.request<T>('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: toolName, arguments: args },
        id: Date.now(),
      }),
    });
  }

  // ═══════════════════════════════════════════════════════
  // WALLET & PORTFOLIO
  // ═══════════════════════════════════════════════════════

  /** Get connected wallet address and details */
  async getWalletInfo(chain?: string): Promise<any> {
    return this.mcpCall('get_wallet_info', { chain });
  }

  /** Get full portfolio with balances and USD valuations */
  async getPortfolio(hideZeroBalances = false): Promise<any> {
    return this.mcpCall('get_portfolio', { hideZeroBalances });
  }

  /** Get balance for a specific token */
  async getTokenBalance(symbol: string): Promise<any> {
    return this.mcpCall('get_token_balance', { symbol });
  }

  /** Get NFT gallery across 36+ blockchains */
  async getNFTs(chain = 'all'): Promise<any> {
    return this.mcpCall('get_nft_gallery', { chain });
  }

  /** Get transaction history */
  async getTransactionHistory(limit = 20, type?: string): Promise<any> {
    return this.mcpCall('get_transaction_history', { limit, type });
  }

  /** Get gas estimates across all chains */
  async getGasEstimate(chain?: string): Promise<any> {
    return this.mcpCall('get_gas_estimate', { chain });
  }

  // ═══════════════════════════════════════════════════════
  // TRADING (Buy, Sell, Swap, Transfer)
  // ═══════════════════════════════════════════════════════

  /** Execute a token swap via DEX aggregator */
  async swapTokens(params: SwapParams): Promise<TransactionResult> {
    return this.mcpCall<TransactionResult>('execute_swap', params);
  }

  /** Buy tokens on DEX */
  async buyTokens(token: string, amount: number, fromToken = 'ETH'): Promise<TransactionResult> {
    return this.mcpCall<TransactionResult>('buy_tokens', { token, amount, fromToken });
  }

  /** Sell tokens on DEX */
  async sellTokens(token: string, amount: number, toToken = 'ETH'): Promise<TransactionResult> {
    return this.mcpCall<TransactionResult>('sell_tokens', { token, amount, toToken });
  }

  /** Send a crypto transfer */
  async sendTransfer(params: SendTransferParams): Promise<TransactionResult> {
    return this.mcpCall<TransactionResult>('send_transfer', params);
  }

  // ═══════════════════════════════════════════════════════
  // REAL-TIME PRICING
  // ═══════════════════════════════════════════════════════

  /** Get real-time prices for tokens (by symbol or contract address) */
  async getRealtimePrices(symbols?: string[], contractAddresses?: string[], chain?: string): Promise<{ prices: TokenPrice[]; count: number }> {
    return this.mcpCall('get_realtime_prices', {
      symbols: symbols?.join(','),
      contractAddresses: contractAddresses?.join(','),
      chain,
    });
  }

  // ═══════════════════════════════════════════════════════
  // MEME COIN INTELLIGENCE
  // ═══════════════════════════════════════════════════════

  /** Discover trending meme coins with safety audit scores */
  async getTrendingMemecoins(chain = 'all', limit = 20, minLiquidity = 10000): Promise<{ tokens: TrendingMemecoin[]; count: number }> {
    return this.mcpCall('get_trending_memecoins', { chain, limit, minLiquidity });
  }

  /** Deep security audit of a token contract */
  async auditToken(contractAddress: string, chain = 'ethereum'): Promise<TokenAuditResult> {
    return this.mcpCall<TokenAuditResult>('audit_token', { contractAddress, chain });
  }

  // ═══════════════════════════════════════════════════════
  // TRADE ORDERS (Stop-Loss / Take-Profit)
  // ═══════════════════════════════════════════════════════

  /** Set a stop-loss or take-profit order */
  async setTradeOrder(params: TradeOrderParams): Promise<TradeOrder> {
    return this.mcpCall<TradeOrder>('set_trade_order', params);
  }

  /** List active trade orders */
  async getActiveOrders(status = 'ACTIVE'): Promise<{ orders: TradeOrder[]; count: number }> {
    return this.mcpCall('get_active_orders', { status });
  }

  /** Cancel a trade order by ID */
  async cancelTradeOrder(orderId: string): Promise<{ orderId: string; status: string }> {
    return this.mcpCall('cancel_trade_order', { orderId });
  }

  // ═══════════════════════════════════════════════════════
  // WALLET HEALTH & SECURITY
  // ═══════════════════════════════════════════════════════

  /** Comprehensive wallet health check (balances, gas, diversity) */
  async checkWalletHealth(walletAddress?: string): Promise<WalletHealthResult> {
    return this.mcpCall<WalletHealthResult>('check_wallet_health', { walletAddress });
  }

  /** Deep security scan (phishing, approvals, leaked data) */
  async scanWalletSecurity(walletAddress?: string, deepScan = true): Promise<SecurityScanResult> {
    return this.mcpCall<SecurityScanResult>('scan_wallet_security', { walletAddress, deepScan });
  }

  // ═══════════════════════════════════════════════════════
  // SMART CONTRACTS
  // ═══════════════════════════════════════════════════════

  /** Deploy a smart contract */
  async deploySmartContract(params: DeployContractParams): Promise<TransactionResult> {
    return this.mcpCall<TransactionResult>('deploy_smart_contract', params);
  }

  /** Audit smart contract source code */
  async auditSmartContract(code: string): Promise<any> {
    return this.mcpCall('audit_smart_contract', { code });
  }

  /** Verify and publish smart contract source code on block explorer */
  async verifySmartContract(params: { contractAddress: string; contractName: string; sourceCode?: string; network?: string; compilerVersion?: string }): Promise<any> {
    return this.mcpCall('verify_smart_contract', params);
  }
}

