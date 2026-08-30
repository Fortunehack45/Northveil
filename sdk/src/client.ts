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
  MintTokensParams,
  MintTokensResult,
  ReserveTokensParams,
  ReserveTokensResult,
  MakeReservationParams,
  MakeReservationResult,
  ListReservationsResult,
  FlightSearchParams,
  FlightSearchResult,
  HotelSearchParams,
  HotelSearchResult,
  EventSearchParams,
  EventSearchResult,
  BookingStatusResult,
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

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['X-API-Key'] = this.apiKey;
    }
    if (this.walletAddress) headers['x-wallet-address'] = this.walletAddress;

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Northveil SDK Request Failed (${res.status}): ${errorText}`);
    }
    return res.json() as Promise<T>;
  }

  /** Authentication & Identity Scope Service */
  public readonly auth = {
    /** Get current authenticated developer/user profile, scopes, and allowed wallet addresses */
    getMe: async (): Promise<{
      authenticated: boolean;
      keyName: string;
      walletAddress: string;
      allowedWallets: string[];
      permissions: string[];
      tier: string;
      userId: string;
      timestamp: string;
    }> => {
      return this.request('/api/v1/auth/me');
    },

    /** Dynamically update the active API Key */
    setApiKey: (key: string) => {
      this.apiKey = key;
    },

    /** Dynamically update the active target wallet */
    setWalletAddress: (address: string) => {
      this.walletAddress = address;
    }
  };

  private async mcpCall<T>(toolName: string, args: Record<string, any> = {}): Promise<T> {
    const raw = await this.request<any>('/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: toolName, arguments: args },
        id: Date.now(),
      }),
    });
    if (raw?.error) {
      throw new Error(`MCP Tool Error (${toolName}): ${raw.error.message || JSON.stringify(raw.error)}`);
    }
    return (raw?.result !== undefined ? raw.result : raw) as T;
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

  /** Mint new tokens from an ERC-20 contract */
  async mintTokens(params: MintTokensParams): Promise<MintTokensResult> {
    return this.mcpCall<MintTokensResult>('mint_tokens', params);
  }

  /** Create a time-locked token reservation */
  async reserveTokens(params: ReserveTokensParams): Promise<ReserveTokensResult> {
    return this.mcpCall<ReserveTokensResult>('reserve_tokens', params);
  }

  /** Create a web3 booking reservation & digital ticket pass (flight, movie, hotel, event, dining) */
  async makeReservation(params: MakeReservationParams): Promise<MakeReservationResult> {
    return this.mcpCall<MakeReservationResult>('make_reservation', params);
  }

  /** List active web3 reservations, flight boarding passes, and bookings */
  async listReservations(params: { walletAddress?: string; category?: string } = {}): Promise<ListReservationsResult> {
    return this.mcpCall<ListReservationsResult>('list_reservations', params);
  }

  /** Search live international flights with crypto pricing */
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
    return this.mcpCall<FlightSearchResult>('search_flights', params);
  }

  /** Search global hotel accommodations with crypto pricing */
  async searchHotels(params: HotelSearchParams): Promise<HotelSearchResult> {
    return this.mcpCall<HotelSearchResult>('search_hotels', params);
  }

  /** Search movies, IMAX screenings, concerts, and VIP events */
  async searchEvents(params: EventSearchParams = {}): Promise<EventSearchResult> {
    return this.mcpCall<EventSearchResult>('search_events_and_movies', params);
  }

  /** Query booking confirmation status by official airline PNR or Northveil reference */
  async getBookingStatus(bookingReferenceOrPnr: string): Promise<BookingStatusResult> {
    return this.mcpCall<BookingStatusResult>('get_booking_status', { bookingReference: bookingReferenceOrPnr });
  }

  /** Prepare an unsigned transaction request for local client signing */
  async prepareTransaction(params: {
    walletAddress?: string;
    recipient: string;
    amount: number;
    asset?: string;
    network?: string;
    chainId?: number;
    calldata?: string;
    operationType?: 'TRANSFER' | 'SWAP' | 'DEPLOY' | 'CONTRACT_CALL';
  }): Promise<{
    success: boolean;
    requestId: string;
    approvalToken: string;
    walletAddress: string;
    recipient: string;
    amount: number;
    asset: string;
    network: string;
    chainId: number;
    nonce: number;
    unsignedTransaction: any;
    unsignedSerialized?: string;
    expiresAt: string;
  }> {
    return this.request('/api/v1/transactions/prepare', {
      method: 'POST',
      body: JSON.stringify({
        walletAddress: params.walletAddress || this.walletAddress,
        ...params,
      }),
    });
  }

  /** Broadcast an already signed raw transaction on-chain */
  async broadcastTransaction(params: {
    approvalToken?: string;
    requestId?: string;
    signedTransaction: string;
  }): Promise<{
    success: boolean;
    status: string;
    requestId: string;
    walletAddress: string;
    recipient: string;
    amount: number;
    asset: string;
    network: string;
    txHash: string;
    blockNumber: number;
    gasUsed: string;
    explorerUrl: string;
  }> {
    return this.request('/api/v1/transactions/broadcast', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /** Register public wallet metadata non-custodially */
  async registerWallet(params: {
    address: string;
    walletName?: string;
    chainId?: string;
  }): Promise<{
    success: boolean;
    wallet: any;
    address: string;
    mpcWalletId: string;
  }> {
    return this.request('/api/v1/wallets/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /** Get full OpenAPI 3.0.3 schema for ChatGPT & REST Action integration */
  async getOpenApiSchema(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/openapi.json`);
    return res.json();
  }

  // ═══════════════════════════════════════════════════════
  // CANONICAL 18 MCP TOOLS (NON-CUSTODIAL & ASYNC APPROVALS)
  // ═══════════════════════════════════════════════════════

  /** List permitted non-custodial wallets */
  async listWallets(): Promise<{ wallets: string[]; active: string; count: number }> {
    return this.mcpCall('northveil_list_wallets');
  }

  /** Get live multi-chain native and token balances */
  async getBalances(network = 'base', walletAddress?: string): Promise<any> {
    return this.mcpCall('northveil_get_balances', { network, walletAddress: walletAddress || this.walletAddress });
  }

  /** Simulate transaction execution on a fork */
  async simulateTx(params: { from: string; to: string; value?: string; data?: string; network?: string }): Promise<any> {
    return this.mcpCall('northveil_simulate_tx', params);
  }

  /** Estimate live EIP-1559 gas consumption and USD cost */
  async estimateGas(params: { network?: string; to?: string; value?: string } = {}): Promise<any> {
    return this.mcpCall('northveil_estimate_gas', params);
  }

  /** Audit smart contract security and bytecode */
  async auditContract(params: { contractAddress?: string; code?: string; network?: string }): Promise<any> {
    return this.mcpCall('northveil_audit_contract', params);
  }

  /** Non-custodially prepare an unsigned native or token transfer */
  async prepareTransfer(params: { recipient: string; amount: number; asset?: string; network?: string }): Promise<any> {
    return this.mcpCall('northveil_prepare_transfer', {
      walletAddress: this.walletAddress,
      ...params,
    });
  }

  /** Non-custodially prepare an optimal DEX swap */
  async prepareSwap(params: { fromToken: string; toToken: string; amount: number; slippage?: number; network?: string }): Promise<any> {
    return this.mcpCall('northveil_prepare_swap', {
      walletAddress: this.walletAddress,
      ...params,
    });
  }

  /** Request passkey biometric signature for a staged approval */
  async requestSignature(params: { approvalToken: string; userId?: string }): Promise<any> {
    return this.mcpCall('northveil_request_signature', params);
  }

  /** Request on-chain broadcast of a client-signed raw transaction */
  async requestBroadcast(params: { approvalToken?: string; signedTransaction: string }): Promise<any> {
    return this.mcpCall('northveil_request_broadcast', params);
  }

  /** List pending transaction approvals */
  async listPendingApprovals(): Promise<any> {
    return this.mcpCall('northveil_list_pending_approvals');
  }

  /** Get approval status for an approval token */
  async getApprovalStatus(approvalToken: string): Promise<any> {
    return this.mcpCall('northveil_get_approval_status', { approvalToken });
  }

  // ═══════════════════════════════════════════════════════
  // OAUTH 2.0 & RFC METADATA DISCOVERY
  // ═══════════════════════════════════════════════════════

  /** Fetch RFC 9728 OAuth 2.0 Protected Resource Metadata */
  async getOAuthProtectedResourceMetadata(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/.well-known/oauth-protected-resource`);
    return res.json();
  }

  /** Fetch RFC 8414 OAuth 2.0 Authorization Server Metadata */
  async getOAuthServerMetadata(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/.well-known/oauth-authorization-server`);
    return res.json();
  }

  /** Register an OAuth 2.0 client dynamically (RFC 7591) */
  async registerOAuthClient(params: {
    client_name?: string;
    redirect_uris: string[];
    grant_types?: string[];
    response_types?: string[];
    scope?: string;
  }): Promise<{
    client_id: string;
    client_secret?: string;
    client_name: string;
    redirect_uris: string[];
    grant_types: string[];
    response_types: string[];
    scope: string;
  }> {
    return this.request('/oauth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Check live server & database connectivity health
   */
  async getHealth(): Promise<{
    status: string;
    service?: string;
    supabase?: { connected: boolean; error?: string };
    env?: { SUPABASE_URL: boolean; SUPABASE_ANON_KEY: boolean };
    timestamp: string;
  }> {
    return this.request('/health');
  }
}



