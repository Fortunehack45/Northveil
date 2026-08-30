"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NorthveilClient = void 0;
class NorthveilClient {
    baseUrl;
    apiKey;
    walletAddress;
    constructor(config = {}) {
        this.baseUrl = (config.baseUrl || 'https://mcp.northveil.xyz').replace(/\/$/, '');
        this.apiKey = config.apiKey || '';
        this.walletAddress = config.walletAddress || '';
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true',
            ...(options.headers || {})
        };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
            headers['X-API-Key'] = this.apiKey;
        }
        if (this.walletAddress)
            headers['x-wallet-address'] = this.walletAddress;
        const res = await fetch(url, { ...options, headers });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Northveil SDK Request Failed (${res.status}): ${errorText}`);
        }
        return res.json();
    }
    /** Authentication & Identity Scope Service */
    auth = {
        /** Get current authenticated developer/user profile, scopes, and allowed wallet addresses */
        getMe: async () => {
            return this.request('/api/v1/auth/me');
        },
        /** Dynamically update the active API Key */
        setApiKey: (key) => {
            this.apiKey = key;
        },
        /** Dynamically update the active target wallet */
        setWalletAddress: (address) => {
            this.walletAddress = address;
        }
    };
    async mcpCall(toolName, args = {}) {
        const raw = await this.request('/mcp', {
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
        return (raw?.result !== undefined ? raw.result : raw);
    }
    // ═══════════════════════════════════════════════════════
    // WALLET & PORTFOLIO
    // ═══════════════════════════════════════════════════════
    /** Get connected wallet address and details */
    async getWalletInfo(chain) {
        return this.mcpCall('get_wallet_info', { chain });
    }
    /** Get full portfolio with balances and USD valuations */
    async getPortfolio(hideZeroBalances = false) {
        return this.mcpCall('get_portfolio', { hideZeroBalances });
    }
    /** Get balance for a specific token */
    async getTokenBalance(symbol) {
        return this.mcpCall('get_token_balance', { symbol });
    }
    /** Get NFT gallery across 36+ blockchains */
    async getNFTs(chain = 'all') {
        return this.mcpCall('get_nft_gallery', { chain });
    }
    /** Get transaction history */
    async getTransactionHistory(limit = 20, type) {
        return this.mcpCall('get_transaction_history', { limit, type });
    }
    /** Get gas estimates across all chains */
    async getGasEstimate(chain) {
        return this.mcpCall('get_gas_estimate', { chain });
    }
    // ═══════════════════════════════════════════════════════
    // TRADING (Buy, Sell, Swap, Transfer)
    // ═══════════════════════════════════════════════════════
    /** Execute a token swap via DEX aggregator */
    async swapTokens(params) {
        return this.mcpCall('execute_swap', params);
    }
    /** Buy tokens on DEX */
    async buyTokens(token, amount, fromToken = 'ETH') {
        return this.mcpCall('buy_tokens', { token, amount, fromToken });
    }
    /** Sell tokens on DEX */
    async sellTokens(token, amount, toToken = 'ETH') {
        return this.mcpCall('sell_tokens', { token, amount, toToken });
    }
    /** Send a crypto transfer */
    async sendTransfer(params) {
        return this.mcpCall('send_transfer', params);
    }
    // ═══════════════════════════════════════════════════════
    // REAL-TIME PRICING
    // ═══════════════════════════════════════════════════════
    /** Get real-time prices for tokens (by symbol or contract address) */
    async getRealtimePrices(symbols, contractAddresses, chain) {
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
    async getTrendingMemecoins(chain = 'all', limit = 20, minLiquidity = 10000) {
        return this.mcpCall('get_trending_memecoins', { chain, limit, minLiquidity });
    }
    /** Deep security audit of a token contract */
    async auditToken(contractAddress, chain = 'ethereum') {
        return this.mcpCall('audit_token', { contractAddress, chain });
    }
    // ═══════════════════════════════════════════════════════
    // TRADE ORDERS (Stop-Loss / Take-Profit)
    // ═══════════════════════════════════════════════════════
    /** Set a stop-loss or take-profit order */
    async setTradeOrder(params) {
        return this.mcpCall('set_trade_order', params);
    }
    /** List active trade orders */
    async getActiveOrders(status = 'ACTIVE') {
        return this.mcpCall('get_active_orders', { status });
    }
    /** Cancel a trade order by ID */
    async cancelTradeOrder(orderId) {
        return this.mcpCall('cancel_trade_order', { orderId });
    }
    // ═══════════════════════════════════════════════════════
    // WALLET HEALTH & SECURITY
    // ═══════════════════════════════════════════════════════
    /** Comprehensive wallet health check (balances, gas, diversity) */
    async checkWalletHealth(walletAddress) {
        return this.mcpCall('check_wallet_health', { walletAddress });
    }
    /** Deep security scan (phishing, approvals, leaked data) */
    async scanWalletSecurity(walletAddress, deepScan = true) {
        return this.mcpCall('scan_wallet_security', { walletAddress, deepScan });
    }
    // ═══════════════════════════════════════════════════════
    // SMART CONTRACTS
    // ═══════════════════════════════════════════════════════
    /** Deploy a smart contract */
    async deploySmartContract(params) {
        return this.mcpCall('deploy_smart_contract', params);
    }
    /** Audit smart contract source code */
    async auditSmartContract(code) {
        return this.mcpCall('audit_smart_contract', { code });
    }
    /** Verify and publish smart contract source code on block explorer */
    async verifySmartContract(params) {
        return this.mcpCall('verify_smart_contract', params);
    }
    /** Mint new tokens from an ERC-20 contract */
    async mintTokens(params) {
        return this.mcpCall('mint_tokens', params);
    }
    /** Create a time-locked token reservation */
    async reserveTokens(params) {
        return this.mcpCall('reserve_tokens', params);
    }
    /** Create a web3 booking reservation & digital ticket pass (flight, movie, hotel, event, dining) */
    async makeReservation(params) {
        return this.mcpCall('make_reservation', params);
    }
    /** List active web3 reservations, flight boarding passes, and bookings */
    async listReservations(params = {}) {
        return this.mcpCall('list_reservations', params);
    }
    /** Search live international flights with crypto pricing */
    async searchFlights(params) {
        return this.mcpCall('search_flights', params);
    }
    /** Search global hotel accommodations with crypto pricing */
    async searchHotels(params) {
        return this.mcpCall('search_hotels', params);
    }
    /** Search movies, IMAX screenings, concerts, and VIP events */
    async searchEvents(params = {}) {
        return this.mcpCall('search_events_and_movies', params);
    }
    /** Query booking confirmation status by official airline PNR or Northveil reference */
    async getBookingStatus(bookingReferenceOrPnr) {
        return this.mcpCall('get_booking_status', { bookingReference: bookingReferenceOrPnr });
    }
    /** Prepare an unsigned transaction request for local client signing */
    async prepareTransaction(params) {
        return this.request('/api/v1/transactions/prepare', {
            method: 'POST',
            body: JSON.stringify({
                walletAddress: params.walletAddress || this.walletAddress,
                ...params,
            }),
        });
    }
    /** Broadcast an already signed raw transaction on-chain */
    async broadcastTransaction(params) {
        return this.request('/api/v1/transactions/broadcast', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }
    /** Register public wallet metadata non-custodially */
    async registerWallet(params) {
        return this.request('/api/v1/wallets/register', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }
    /** Get full OpenAPI 3.0.3 schema for ChatGPT & REST Action integration */
    async getOpenApiSchema() {
        const res = await fetch(`${this.baseUrl}/openapi.json`);
        return res.json();
    }
    // ═══════════════════════════════════════════════════════
    // CANONICAL 18 MCP TOOLS (NON-CUSTODIAL & ASYNC APPROVALS)
    // ═══════════════════════════════════════════════════════
    /** List permitted non-custodial wallets */
    async listWallets() {
        return this.mcpCall('northveil_list_wallets');
    }
    /** Get live multi-chain native and token balances */
    async getBalances(network = 'base', walletAddress) {
        return this.mcpCall('northveil_get_balances', { network, walletAddress: walletAddress || this.walletAddress });
    }
    /** Simulate transaction execution on a fork */
    async simulateTx(params) {
        return this.mcpCall('northveil_simulate_tx', params);
    }
    /** Estimate live EIP-1559 gas consumption and USD cost */
    async estimateGas(params = {}) {
        return this.mcpCall('northveil_estimate_gas', params);
    }
    /** Audit smart contract security and bytecode */
    async auditContract(params) {
        return this.mcpCall('northveil_audit_contract', params);
    }
    /** Non-custodially prepare an unsigned native or token transfer */
    async prepareTransfer(params) {
        return this.mcpCall('northveil_prepare_transfer', {
            walletAddress: this.walletAddress,
            ...params,
        });
    }
    /** Non-custodially prepare an optimal DEX swap */
    async prepareSwap(params) {
        return this.mcpCall('northveil_prepare_swap', {
            walletAddress: this.walletAddress,
            ...params,
        });
    }
    /** Request passkey biometric signature for a staged approval */
    async requestSignature(params) {
        return this.mcpCall('northveil_request_signature', params);
    }
    /** Request on-chain broadcast of a client-signed raw transaction */
    async requestBroadcast(params) {
        return this.mcpCall('northveil_request_broadcast', params);
    }
    /** List pending transaction approvals */
    async listPendingApprovals() {
        return this.mcpCall('northveil_list_pending_approvals');
    }
    /** Get approval status for an approval token */
    async getApprovalStatus(approvalToken) {
        return this.mcpCall('northveil_get_approval_status', { approvalToken });
    }
    // ═══════════════════════════════════════════════════════
    // OAUTH 2.0 & RFC METADATA DISCOVERY
    // ═══════════════════════════════════════════════════════
    /** Fetch RFC 9728 OAuth 2.0 Protected Resource Metadata */
    async getOAuthProtectedResourceMetadata() {
        const res = await fetch(`${this.baseUrl}/.well-known/oauth-protected-resource`);
        return res.json();
    }
    /** Fetch RFC 8414 OAuth 2.0 Authorization Server Metadata */
    async getOAuthServerMetadata() {
        const res = await fetch(`${this.baseUrl}/.well-known/oauth-authorization-server`);
        return res.json();
    }
    /** Register an OAuth 2.0 client dynamically (RFC 7591) */
    async registerOAuthClient(params) {
        return this.request('/oauth/register', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }
    /**
     * Check live server & database connectivity health
     */
    async getHealth() {
        return this.request('/health');
    }
}
exports.NorthveilClient = NorthveilClient;
//# sourceMappingURL=client.js.map