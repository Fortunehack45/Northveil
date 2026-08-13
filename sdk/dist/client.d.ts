import { NorthveilConfig, SwapParams, DeployContractParams, TransactionResult, TokenPrice, TrendingMemecoin, TokenAuditResult, TradeOrderParams, TradeOrder, WalletHealthResult, SecurityScanResult, SendTransferParams, MintTokensParams, MintTokensResult, ReserveTokensParams, ReserveTokensResult } from './types.js';
export declare class NorthveilClient {
    private baseUrl;
    private apiKey;
    private walletAddress;
    constructor(config?: NorthveilConfig);
    private request;
    private mcpCall;
    /** Get connected wallet address and details */
    getWalletInfo(chain?: string): Promise<any>;
    /** Get full portfolio with balances and USD valuations */
    getPortfolio(hideZeroBalances?: boolean): Promise<any>;
    /** Get balance for a specific token */
    getTokenBalance(symbol: string): Promise<any>;
    /** Get NFT gallery across 36+ blockchains */
    getNFTs(chain?: string): Promise<any>;
    /** Get transaction history */
    getTransactionHistory(limit?: number, type?: string): Promise<any>;
    /** Get gas estimates across all chains */
    getGasEstimate(chain?: string): Promise<any>;
    /** Execute a token swap via DEX aggregator */
    swapTokens(params: SwapParams): Promise<TransactionResult>;
    /** Buy tokens on DEX */
    buyTokens(token: string, amount: number, fromToken?: string): Promise<TransactionResult>;
    /** Sell tokens on DEX */
    sellTokens(token: string, amount: number, toToken?: string): Promise<TransactionResult>;
    /** Send a crypto transfer */
    sendTransfer(params: SendTransferParams): Promise<TransactionResult>;
    /** Get real-time prices for tokens (by symbol or contract address) */
    getRealtimePrices(symbols?: string[], contractAddresses?: string[], chain?: string): Promise<{
        prices: TokenPrice[];
        count: number;
    }>;
    /** Discover trending meme coins with safety audit scores */
    getTrendingMemecoins(chain?: string, limit?: number, minLiquidity?: number): Promise<{
        tokens: TrendingMemecoin[];
        count: number;
    }>;
    /** Deep security audit of a token contract */
    auditToken(contractAddress: string, chain?: string): Promise<TokenAuditResult>;
    /** Set a stop-loss or take-profit order */
    setTradeOrder(params: TradeOrderParams): Promise<TradeOrder>;
    /** List active trade orders */
    getActiveOrders(status?: string): Promise<{
        orders: TradeOrder[];
        count: number;
    }>;
    /** Cancel a trade order by ID */
    cancelTradeOrder(orderId: string): Promise<{
        orderId: string;
        status: string;
    }>;
    /** Comprehensive wallet health check (balances, gas, diversity) */
    checkWalletHealth(walletAddress?: string): Promise<WalletHealthResult>;
    /** Deep security scan (phishing, approvals, leaked data) */
    scanWalletSecurity(walletAddress?: string, deepScan?: boolean): Promise<SecurityScanResult>;
    /** Deploy a smart contract */
    deploySmartContract(params: DeployContractParams): Promise<TransactionResult>;
    /** Audit smart contract source code */
    auditSmartContract(code: string): Promise<any>;
    /** Verify and publish smart contract source code on block explorer */
    verifySmartContract(params: {
        contractAddress: string;
        contractName: string;
        sourceCode?: string;
        network?: string;
        compilerVersion?: string;
    }): Promise<any>;
    /** Mint new tokens from an ERC-20 contract */
    mintTokens(params: MintTokensParams): Promise<MintTokensResult>;
    /** Create a time-locked token reservation */
    reserveTokens(params: ReserveTokensParams): Promise<ReserveTokensResult>;
}
//# sourceMappingURL=client.d.ts.map