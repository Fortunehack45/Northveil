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
        if (this.apiKey)
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        if (this.walletAddress)
            headers['x-wallet-address'] = this.walletAddress;
        const res = await fetch(url, { ...options, headers });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Northveil SDK Request Failed (${res.status}): ${errorText}`);
        }
        return res.json();
    }
    mcpCall(toolName, args = {}) {
        return this.request('/mcp', {
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
}
exports.NorthveilClient = NorthveilClient;
//# sourceMappingURL=client.js.map