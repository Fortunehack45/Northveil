"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NorthveilClient = void 0;
/**
 * NorthveilClient
 * Thin, non-custodial TypeScript client for communicating with Northveil MCP servers.
 * Never stores or transmits private keys, seeds, or MPC key shares.
 */
class NorthveilClient {
    apiUrl;
    clientKey;
    walletAddress;
    constructor(config = {}) {
        if (config.privateKey || config.mnemonic) {
            throw new Error('NON_CUSTODIAL_VIOLATION: Northveil SDK strictly forbids privateKey or mnemonic. Authentication is strictly via clientKey (agent key) or OAuth.');
        }
        this.apiUrl = (config.baseUrl || config.apiUrl || process.env.NORTHVEIL_API_URL || 'https://mcp.northveil.xyz').replace(/\/$/, '');
        this.clientKey = config.clientKey || process.env.NORTHVEIL_API_KEY || '';
        this.walletAddress = config.walletAddress;
        if (!this.clientKey) {
            throw new Error('MISSING_CLIENT_KEY: Pass clientKey or set NORTHVEIL_API_KEY');
        }
    }
    /**
     * Invokes an arbitrary MCP tool by name
     */
    async call(tool, args = {}) {
        return this.callTool(tool, args);
    }
    /**
     * Inspects a request lifecycle record by its requestId
     */
    async getRequest(requestId) {
        const res = await fetch(`${this.apiUrl}/wallet/requests/${encodeURIComponent(requestId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.clientKey,
                'Authorization': `Bearer ${this.clientKey}`,
            },
        });
        if (!res.ok) {
            const err = await res.text().catch(() => '');
            throw new Error(`Failed to load request (${res.status}): ${err}`);
        }
        return await res.json();
    }
    /**
     * Dispatches a JSON-RPC 2.0 tool call to the Northveil MCP endpoint
     */
    async callTool(name, args = {}) {
        if (!this.clientKey) {
            throw new Error('MISSING_CLIENT_KEY: Northveil client key (nv_live_...) must be configured.');
        }
        const payloadArgs = { ...args };
        if (this.walletAddress && !payloadArgs.walletAddress) {
            payloadArgs.walletAddress = this.walletAddress;
        }
        const res = await fetch(`${this.apiUrl}/mcp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.clientKey,
                'Authorization': `Bearer ${this.clientKey}`,
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'tools/call',
                params: {
                    name,
                    arguments: payloadArgs,
                },
            }),
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`MCP Request failed with status ${res.status}: ${errText}`);
        }
        const json = (await res.json());
        if (json.error) {
            throw new Error(`MCP Tool Error (${json.error.code}): ${json.error.message}`);
        }
        const contentText = json.result?.content?.[0]?.text;
        if (!contentText)
            return json.result;
        try {
            return JSON.parse(contentText);
        }
        catch {
            return contentText;
        }
    }
    /**
     * Retrieves real-time portfolio balance and valuation across supported chains
     */
    async getPortfolio(walletAddress) {
        return this.callTool('get_portfolio', walletAddress ? { walletAddress } : {});
    }
    /**
     * Stages an on-chain transfer.
     * - Under Always Ask: Returns APPROVAL_REQUIRED with approvalId, payloadHash, and approveUrl for human passkey confirmation.
     * - Under Autonomous: Evaluates grant limits and executes threshold MPC signing immediately if within bounds.
     */
    async prepareTransfer(params) {
        return this.callTool('prepare_transfer', params);
    }
    /**
     * Checks the confirmation receipt of an on-chain transaction hash
     */
    async getTransactionStatus(txHash, chain) {
        return this.callTool('get_transaction_status', { txHash, chain });
    }
    /**
     * Queries metadata, active grant policies, and spending limits for the client's wallet
     */
    async getWalletInfo() {
        return this.callTool('nv_list_wallets', {});
    }
    /**
     * Alias for getWalletInfo
     */
    async listWallets() {
        return this.callTool('nv_list_wallets', {});
    }
    /**
     * Query balances across one chain or all supported chains
     */
    async getBalances(networkOrAddress) {
        return this.callTool('nv_get_balances', { network: networkOrAddress || 'all' });
    }
    /**
     * Check execution status of an approval ticket by ID
     */
    async getApprovalStatus(approvalId) {
        return this.callTool('nv_get_approval_status', { approvalId });
    }
    /**
     * Lists active pending approvals awaiting human passkey authorization
     */
    async listPendingApprovals() {
        return this.callTool('nv_list_pending_approvals', {});
    }
}
exports.NorthveilClient = NorthveilClient;
//# sourceMappingURL=client.js.map