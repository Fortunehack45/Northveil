import { NorthveilConfig, BalanceResult, TokenBalance, NFTItem, SwapParams, DeployContractParams, TransactionResult } from './types.js';
export declare class NorthveilClient {
    private baseUrl;
    private apiKey;
    private walletAddress;
    constructor(config?: NorthveilConfig);
    private request;
    /**
     * Get connected wallet address and details
     */
    getWalletAddress(): Promise<{
        address: string;
        chain: string;
    }>;
    /**
     * Get live native token balance for a wallet across EVM or 30+ blockchains
     */
    getBalance(chain?: string): Promise<BalanceResult>;
    /**
     * Get all ERC-20 token balances for a wallet
     */
    getTokenBalances(chain?: string): Promise<TokenBalance[]>;
    /**
     * Get NFT balances across 30+ blockchains
     */
    getNFTs(chain?: string): Promise<NFTItem[]>;
    /**
     * Execute token swap via DEX router
     */
    swapTokens(params: SwapParams): Promise<TransactionResult>;
    /**
     * Compile and deploy a Smart Contract with optional socials
     */
    deploySmartContract(params: DeployContractParams): Promise<TransactionResult>;
}
//# sourceMappingURL=client.d.ts.map