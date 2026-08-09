export interface NorthveilConfig {
    baseUrl?: string;
    apiKey?: string;
    walletAddress?: string;
}
export interface BalanceResult {
    chain: string;
    address: string;
    balanceNative: string;
    balanceUsd: number;
    symbol: string;
}
export interface TokenBalance {
    symbol: string;
    name: string;
    balance: string;
    priceUsd: number;
    valueUsd: number;
    contractAddress?: string;
    icon?: string;
}
export interface NFTItem {
    id: string;
    contractAddress: string;
    tokenId: string;
    name: string;
    collectionName: string;
    imageUrl: string;
    chain: string;
}
export interface SwapParams {
    fromToken: string;
    toToken: string;
    amount: string;
    slippagePercent?: number;
    chain?: string;
}
export interface DeployContractParams {
    contractType: 'erc20' | 'erc721' | 'erc1155' | 'staking' | 'vault';
    contractName: string;
    symbol: string;
    totalSupply?: number;
    network?: string;
    websiteUrl?: string;
    twitterUrl?: string;
    telegramUrl?: string;
    discordUrl?: string;
}
export interface TransactionResult {
    success: boolean;
    txHash: string;
    explorerUrl: string;
    message: string;
}
//# sourceMappingURL=types.d.ts.map