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

export interface TokenPrice {
  symbol: string;
  name: string;
  priceUsd: number;
  change24h?: number;
  change7d?: number;
  change1h?: number;
  marketCap?: number;
  volume24h?: number;
  liquidity?: number;
  chain?: string;
  source: string;
}

export interface TrendingMemecoin {
  symbol: string;
  name: string;
  contractAddress: string;
  chain: string;
  priceUsd: number;
  change5m?: number;
  change1h?: number;
  change6h?: number;
  change24h?: number;
  volume24h: number;
  liquidity: number;
  audit?: TokenAuditResult;
}

export interface TokenAuditResult {
  score: number;
  verdict: string;
  isHoneypot: boolean;
  buyTax?: number;
  sellTax?: number;
  isMintable?: boolean;
  hiddenOwner?: boolean;
  isOpenSource?: boolean;
  canTakeBackOwnership?: boolean;
  ownerChangeBalance?: boolean;
  hasBlacklist?: boolean;
  transferPausable?: boolean;
  holderCount?: number;
  lpLocked?: number;
}

export interface TradeOrderParams {
  token: string;
  orderType: 'stop_loss' | 'take_profit';
  triggerPrice: number;
  amount: number;
  chain?: string;
}

export interface TradeOrder {
  orderId: string;
  token: string;
  orderType: 'stop_loss' | 'take_profit';
  triggerPrice: number;
  currentPrice?: number;
  amount: number;
  chain: string;
  status: 'ACTIVE' | 'TRIGGERED' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
}

export interface WalletHealthResult {
  healthScore: number;
  totalUsd: number;
  activeChains: number;
  balances: { chain: string; symbol: string; balance: number; valueUsd: number }[];
  tokenCount: number;
  dustTokens: number;
  gasWarnings: string[];
}

export interface SecurityScanResult {
  securityScore: number;
  verdict: string;
  threats: { severity: string; type: string; detail: string }[];
  summary: { critical: number; high: number; medium: number; low: number };
}

export interface SendTransferParams {
  token: string;
  amount: number;
  recipientAddress: string;
  chain?: string;
}

export interface GasEstimate {
  chain: string;
  baseFee: string;
  priorityFee: string;
  gasPrice: string;
}

export interface VerifyContractParams {
  contractAddress: string;
  contractName: string;
  sourceCode?: string;
  network?: string;
  compilerVersion?: string;
  optimizationUsed?: boolean;
  runs?: number;
}

export interface ContractVerificationResult {
  verified: boolean;
  contractAddress: string;
  contractName: string;
  network: string;
  compilerVersion: string;
  optimizationUsed: boolean;
  runs: number;
  explorerVerificationUrl: string;
  guid?: string;
  statusMessage: string;
}


