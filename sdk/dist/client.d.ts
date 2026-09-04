import { NorthveilConfig, PortfolioResult, PrepareTransferParams, PrepareTransferResult, TransactionStatusResult, WalletInfoResult, PendingApprovalItem } from './types.js';
/**
 * NorthveilClient
 * Thin, non-custodial TypeScript client for communicating with Northveil MCP servers.
 * Never stores or transmits private keys, seeds, or MPC key shares.
 */
export declare class NorthveilClient {
    private apiUrl;
    private clientKey;
    private walletAddress?;
    constructor(config?: NorthveilConfig);
    /**
     * Invokes an arbitrary MCP tool by name
     */
    call<T = any>(tool: string, args?: Record<string, any>): Promise<T>;
    /**
     * Inspects a request lifecycle record by its requestId
     */
    getRequest(requestId: string): Promise<any>;
    /**
     * Dispatches a JSON-RPC 2.0 tool call to the Northveil MCP endpoint
     */
    callTool<T = any>(name: string, args?: Record<string, any>): Promise<T>;
    /**
     * Retrieves real-time portfolio balance and valuation across supported chains
     */
    getPortfolio(walletAddress?: string): Promise<PortfolioResult>;
    /**
     * Stages an on-chain transfer.
     * - Under Always Ask: Returns APPROVAL_REQUIRED with approvalId, payloadHash, and approveUrl for human passkey confirmation.
     * - Under Autonomous: Evaluates grant limits and executes threshold MPC signing immediately if within bounds.
     */
    prepareTransfer(params: PrepareTransferParams): Promise<PrepareTransferResult>;
    /**
     * Checks the confirmation receipt of an on-chain transaction hash
     */
    getTransactionStatus(txHash: string, chain?: string): Promise<TransactionStatusResult>;
    /**
     * Queries metadata, active grant policies, and spending limits for the client's wallet
     */
    getWalletInfo(): Promise<WalletInfoResult>;
    /**
     * Alias for getWalletInfo
     */
    listWallets(): Promise<WalletInfoResult>;
    /**
     * Query balances across one chain or all supported chains
     */
    getBalances(networkOrAddress?: string): Promise<any>;
    /**
     * Check execution status of an approval ticket by ID
     */
    getApprovalStatus(approvalId: string): Promise<any>;
    /**
     * Lists active pending approvals awaiting human passkey authorization
     */
    listPendingApprovals(): Promise<{
        pendingApprovals: PendingApprovalItem[];
    }>;
}
//# sourceMappingURL=client.d.ts.map