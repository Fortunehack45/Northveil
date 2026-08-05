export type NetworkId = string; // 'ethereum' | 'solana' | 'bitcoin' | 'arbitrum' | 'polygon' | 'bsc' | 'avalanche' | 'base'

export interface ChainInfo {
  id: NetworkId;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  rpcLatency: number; // in ms
  blockTime: number; // in sec
  gasUnit: string;
  nativeTokenPrice: number;
  explorerUrl: string;
  rpcUrl?: string; // added for custom networks
  chainId?: number; // added for custom networks
  isCustom?: boolean;
  isTestnet?: boolean;
}

export interface TokenSocials {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  whitepaper?: string;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  network: NetworkId;
  balance: number;
  priceUsd: number;
  change24h: number;
  icon: string;
  contractAddress?: string;
  isStakable?: boolean;
  apy?: number;
  marketCapUsd?: number;
  liquidityUsd?: number;
  volume24hUsd?: number;
  avgBuyPriceUsd?: number;
  isFavorite?: boolean;
  isCustom?: boolean;
  launchYear?: number;
  bio?: string;
  socials?: TokenSocials;
}

export interface NFTAttribute {
  trait?: string;
  trait_type?: string;
  value: string;
}

export interface NFTAsset {
  id: string;
  name: string;
  collection: string;
  image: string;
  tokenId: string;
  network: string;
  floorPrice: string;
  estUsd: string;
  contract: string;
  attributes: NFTAttribute[];
}

export interface PortfolioHistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isGreen: boolean;
}

export type TxType = 'swap' | 'bridge' | 'send' | 'receive' | 'stake' | 'unstake' | 'claim';

export interface Transaction {
  id: string;
  hash: string;
  type: TxType;
  network: NetworkId;
  fromAsset: string;
  fromAmount: number;
  toAsset?: string;
  toAmount?: number;
  senderAddress: string;
  recipientAddress?: string;
  gasFeeUsd: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  costBasisUsd?: number;
  realizedGainUsd?: number;
}

export interface StakingPosition {
  id: string;
  assetId: string;
  assetSymbol: string;
  network: NetworkId;
  amountStaked: number;
  apy: number;
  rewardsClaimed: number;
  pendingRewards: number;
  stakedDate: string;
  validatorName: string;
}

export interface GasFeeTier {
  speed: 'slow' | 'standard' | 'fast' | 'instant';
  gweiOrUnit: number;
  timeSeconds: number;
  feeUsd: number;
}

export interface ChainGasEstimate {
  network: NetworkId;
  networkName: string;
  gasUnit: string;
  baseFee: number;
  tiers: GasFeeTier[];
  congestionLevel: 'low' | 'moderate' | 'high';
}

export interface HardwareWalletState {
  isConnected: boolean;
  deviceType: 'ledger' | 'trezor' | 'gridplus' | null;
  deviceName: string | null;
  firmwareVersion: string | null;
  address: string | null;
}

export type AccountingMethod = 'FIFO' | 'LIFO' | 'HIFO';

export type LanguageCode = 'en' | 'es' | 'de' | 'ja' | 'zh' | 'fr';

export interface SubWalletAccount {
  id: string;
  name: string;
  accountIndex: number;
  address: string;
  derivationPath: string;
  solanaAddress?: string;
  solanaDerivationPath?: string;
  colorTag: string;
  isDefault?: boolean;
  createdAt: string;
  balanceMultiplier?: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  language: LanguageCode;
  biometricsEnabled: boolean;
  mfaEnabled: boolean;
  autoLockMinutes: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  hideLowBalances: boolean;
  slippageTolerance: number; // percentage, e.g. 0.5
  cloudBackupEnabled: boolean;
  lastBackupTimestamp?: string;
  moralisApiKey?: string;
}

export interface MicroserviceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'maintenance';
  latencyMs: number;
  uptimePercentage: number;
  description: string;
}

export interface TaxReportSummary {
  taxYear: number;
  accountingMethod: AccountingMethod;
  totalTransactions: number;
  totalVolumeUsd: number;
  totalCapitalGainsUsd: number;
  totalCapitalLossesUsd: number;
  netTaxableIncomeUsd: number;
  stakingRewardsIncomeUsd: number;
  totalGasFeesPaidUsd: number;
}
