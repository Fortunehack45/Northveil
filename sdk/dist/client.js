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
    /**
     * Get connected wallet address and details
     */
    async getWalletAddress() {
        return this.request('/mcp', {
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
    async getBalance(chain = 'ethereum') {
        return this.request('/mcp', {
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
    async getTokenBalances(chain = 'ethereum') {
        return this.request('/mcp', {
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
    async getNFTs(chain = 'ethereum') {
        return this.request('/mcp', {
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
    async swapTokens(params) {
        return this.request('/mcp', {
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
    async deploySmartContract(params) {
        return this.request('/mcp', {
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
exports.NorthveilClient = NorthveilClient;
//# sourceMappingURL=client.js.map