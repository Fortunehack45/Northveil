/**
 * Northveil SDK Types
 * Strictly non-custodial agent-wallet client types. No private keys or seeds.
 */
export interface NorthveilConfig {
    baseUrl?: string;
    apiUrl?: string;
    clientKey?: string;
    walletAddress?: string;
    privateKey?: never;
    mnemonic?: never;
}
export interface PortfolioBalance {
    chain: string;
    symbol: string;
    balance: string;
    balanceRaw: string;
    usdEstimate: string;
}
export interface PortfolioResult {
    address: string;
    balances: PortfolioBalance[];
    markdownSummary: string;
    timestamp: string;
}
export interface PrepareTransferParams {
    to: string;
    amount: string;
    chain?: string;
    asset?: string;
    data?: string;
    walletAddress?: string;
}
export interface PrepareTransferResult {
    status: 'EXECUTED' | 'APPROVAL_REQUIRED' | 'DENIED' | 'EXECUTION_FAILED';
    txHash?: string;
    explorerUrl?: string;
    approvalId?: string;
    payloadHash?: string;
    approveUrl?: string;
    expiresAt?: string;
    summary?: Record<string, any>;
    reason?: string;
    agentNextStep?: string;
    error?: string;
}
export interface TransactionStatusResult {
    status: 'CONFIRMED' | 'PENDING' | 'REVERTED' | 'UNKNOWN' | 'ERROR';
    txHash: string;
    blockNumber?: number;
    gasUsed?: string;
    explorerUrl?: string;
    message?: string;
    error?: string;
}
export interface WalletInfoResult {
    address: string;
    chainFamily: string;
    grantMode: string;
    allowedChains: string[];
    allowedAssets: string[];
    maxWeiPerTx: string;
    maxWeiPerDay: string;
}
export interface PendingApprovalItem {
    id: string;
    payload_hash: string;
    canonical_tx: Record<string, any>;
    expires_at: string;
    used: boolean;
    created_at: string;
}
//# sourceMappingURL=types.d.ts.map