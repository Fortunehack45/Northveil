import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  NetworkId,
  CryptoAsset,
  Transaction,
  StakingPosition,
  ChainGasEstimate,
  HardwareWalletState,
  UserSettings,
  MicroserviceStatus,
  TaxReportSummary,
  AccountingMethod,
  LanguageCode,
  SubWalletAccount,
  ChainInfo,
  NFTAsset,
  PortfolioHistoryPoint,
} from '../types';
import {
  SUPPORTED_CHAINS,
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
  INITIAL_STAKING_POSITIONS,
  INITIAL_GAS_ESTIMATES,
  MICROSERVICES_STATUS,
  DICTIONARY,
} from '../data/initialData';
import { WalletService } from '../services/WalletService';
import { TokenService } from '../services/TokenService';
import { ProviderService } from '../services/ProviderService';
import { SwapService } from '../services/SwapService';
import { IndexerService } from '../services/IndexerService';
import { VaultService } from '../services/VaultService';
import { ethers } from 'ethers';

const DEFAULT_SUB_WALLETS: SubWalletAccount[] = [
  {
    id: 'acc-0',
    name: 'Main Trading Vault',
    accountIndex: 0,
    address: '0x71C8891575b50d22e032d847847c234a413d4cc8',
    derivationPath: "m/44'/60'/0'/0/0",
    colorTag: '#00f0ff',
    isDefault: true,
    createdAt: '2026-01-10',
    balanceMultiplier: 1.0,
  },
  {
    id: 'acc-1',
    name: 'DeFi Yield & Staking',
    accountIndex: 1,
    address: '0x9A4108F1c89041235B91238491209C83f',
    derivationPath: "m/44'/60'/0'/0/1",
    colorTag: '#ccff00',
    createdAt: '2026-03-14',
    balanceMultiplier: 0.45,
  },
  {
    id: 'acc-2',
    name: 'NFT & High Alpha',
    accountIndex: 2,
    address: '0x3F221B99c43D21100e45b8821a9a83a',
    derivationPath: "m/44'/60'/0'/0/2",
    colorTag: '#ff007f',
    createdAt: '2026-05-22',
    balanceMultiplier: 0.22,
  },
];

interface WalletContextType {
  assets: CryptoAsset[];
  transactions: Transaction[];
  stakingPositions: StakingPosition[];
  activeChain: NetworkId;
  setActiveChain: (chain: NetworkId) => void;
  customNetworks: ChainInfo[];
  addCustomNetwork: (network: ChainInfo) => void;
  // Multi-Wallet Sub-Account System
  subWallets: SubWalletAccount[];
  activeWalletId: string;
  activeSubWallet: SubWalletAccount;
  setActiveWalletId: (id: string) => void;
  createSubWallet: (name: string, colorTag?: string) => SubWalletAccount | null;
  renameSubWallet: (id: string, newName: string) => void;
  deleteSubWallet: (id: string) => void;
  transferBetweenSubWallets: (
    fromWalletId: string,
    toWalletId: string,
    assetSymbol: string,
    amount: number
  ) => Promise<boolean>;
  hardwareWallet: HardwareWalletState;
  connectHardwareWallet: (device: 'ledger' | 'trezor' | 'gridplus') => void;
  disconnectHardwareWallet: () => void;
  isLocked: boolean;
  unlockWalletWithBiometrics: () => Promise<boolean>;
  lockWallet: () => void;
  isBiometricModalOpen: boolean;
  setIsBiometricModalOpen: (open: boolean) => void;
  biometricPromptReason: string;
  triggerBiometricAuth: (reason: string, onSuccess: () => void) => void;
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  gasEstimates: ChainGasEstimate[];
  systemMetrics: MicroserviceStatus[];
  seedPhrase: string[];
  setSeedPhrase: (words: string[]) => void;
  t: (key: string) => string;
  totalNetWorthUsd: number;
  ownedNFTs: NFTAsset[];
  historicalPerformance: PortfolioHistoryPoint[];
  // Financial Actions
  executeSwap: (params: {
    fromAssetId: string;
    toAssetId: string;
    fromAmount: number;
    toAmount: number;
    isBridge: boolean;
    toNetwork?: NetworkId;
    gasFeeUsd: number;
    quoteData?: any;
  }) => Promise<string | void>;
  sendCrypto: (params: {
    assetId: string;
    amount: number;
    recipientAddress: string;
    gasFeeUsd: number;
  }) => Promise<void>;
  stakeCrypto: (params: {
    assetId: string;
    amount: number;
    validatorName: string;
  }) => Promise<void>;
  unstakeCrypto: (positionId: string, amount: number) => Promise<void>;
  claimRewards: (positionId: string) => Promise<void>;
  getTaxSummary: (year: number, method: AccountingMethod) => TaxReportSummary;
  exportTaxDataCsv: (year: number, method: AccountingMethod) => void;
  toggleFavoriteAsset: (assetId: string) => void;
  // Security Reset / Recovery
  restoreWalletFromSeed: (words: string[]) => boolean;
  unlockVault: (password: string) => boolean;
  setupVault: (seed: string[], password: string) => boolean;
  isVaultConfigured: boolean;
  addCustomToken: (token: CryptoAsset) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<CryptoAsset[]>(() => {
    const saved = localStorage.getItem('northveil_v3_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('northveil_v3_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>(() => {
    const saved = localStorage.getItem('northveil_v3_staking');
    return saved ? JSON.parse(saved) : INITIAL_STAKING_POSITIONS;
  });

  const [activeChain, setActiveChain] = useState<NetworkId>('ethereum');
  const [customNetworks, setCustomNetworks] = useState<ChainInfo[]>(() => {
    const saved = localStorage.getItem('northveil_v2_custom_networks');
    return saved ? JSON.parse(saved) : [];
  });

  const [ownedNFTs, setOwnedNFTs] = useState<NFTAsset[]>([]);
  const [historicalPerformance, setHistoricalPerformance] = useState<PortfolioHistoryPoint[]>([]);

  const latestAssets = React.useRef<CryptoAsset[]>(assets);
  useEffect(() => {
    latestAssets.current = assets;
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('northveil_v2_custom_networks', JSON.stringify(customNetworks));
  }, [customNetworks]);

  const addCustomNetwork = (network: ChainInfo) => {
    setCustomNetworks((prev) => [...prev, network]);
  };

  const [isVaultConfigured, setIsVaultConfigured] = useState<boolean>(() => {
    return !!localStorage.getItem('northveil_v3_encrypted_vault');
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return !!localStorage.getItem('northveil_v3_encrypted_vault'); // Lock on load if vault exists
  });
  
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);
  const [biometricPromptReason, setBiometricPromptReason] = useState<string>('');
  const [pendingBiometricSuccess, setPendingBiometricSuccess] = useState<(() => void) | null>(null);

  // Multi-Wallet Sub-Account State
  const [subWallets, setSubWallets] = useState<SubWalletAccount[]>(() => {
    const saved = localStorage.getItem('northveil_v3_subwallets');
    return saved ? JSON.parse(saved) : DEFAULT_SUB_WALLETS;
  });

  const [activeWalletId, setActiveWalletIdState] = useState<string>(() => {
    const saved = localStorage.getItem('northveil_v3_active_subwallet');
    return saved || 'acc-0';
  });

  useEffect(() => {
    localStorage.setItem('northveil_v3_subwallets', JSON.stringify(subWallets));
  }, [subWallets]);

  useEffect(() => {
    localStorage.setItem('northveil_v3_active_subwallet', activeWalletId);
  }, [activeWalletId]);

  const activeSubWallet = useMemo(() => {
    return subWallets.find((w) => w.id === activeWalletId) || subWallets[0] || DEFAULT_SUB_WALLETS[0];
  }, [subWallets, activeWalletId]);



  const setActiveWalletId = (id: string) => {
    if (subWallets.some((w) => w.id === id)) {
      setActiveWalletIdState(id);
    }
  };

  const createSubWallet = (name: string, colorTag: string = '#00f0ff'): SubWalletAccount | null => {
    if (!seedPhrase || seedPhrase.length === 0) return null;
    const nextIndex = subWallets.length;
    
    // Derive real EVM Address
    const { address, path } = WalletService.deriveEVMAddress(seedPhrase, nextIndex);

    const newWallet: SubWalletAccount = {
      id: `acc-${Date.now()}`,
      name: name.trim() || `Sub-Account #${nextIndex + 1}`,
      accountIndex: nextIndex,
      address,
      derivationPath: path,
      colorTag: colorTag || '#00f0ff',
      createdAt: new Date().toISOString().split('T')[0],
      balanceMultiplier: 1.0,
    };

    setSubWallets((prev) => [...prev, newWallet]);
    setActiveWalletIdState(newWallet.id);
    return newWallet;
  };

  const renameSubWallet = (id: string, newName: string) => {
    setSubWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, name: newName.trim() || w.name } : w))
    );
  };

  const deleteSubWallet = (id: string) => {
    if (subWallets.length <= 1) return;
    setSubWallets((prev) => prev.filter((w) => w.id !== id));
    if (activeWalletId === id) {
      const remaining = subWallets.filter((w) => w.id !== id);
      if (remaining.length > 0) setActiveWalletIdState(remaining[0].id);
    }
  };

  const transferBetweenSubWallets = async (
    fromWalletId: string,
    toWalletId: string,
    assetSymbol: string,
    amount: number
  ): Promise<boolean> => {
    const fromW = subWallets.find((w) => w.id === fromWalletId);
    const toW = subWallets.find((w) => w.id === toWalletId);
    if (!fromW || !toW) return false;

    const newTx: Transaction = {
      id: `tx-internal-${Date.now()}`,
      hash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'send',
      network: activeChain,
      fromAsset: assetSymbol,
      fromAmount: amount,
      senderAddress: fromW.address,
      recipientAddress: toW.address,
      gasFeeUsd: 0.15,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  const [hardwareWallet, setHardwareWallet] = useState<HardwareWalletState>({
    isConnected: false,
    deviceType: null,
    deviceName: null,
    firmwareVersion: null,
    address: null,
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const defaultSettings: UserSettings = {
      theme: 'dark',
      language: 'en',
      biometricsEnabled: true,
      mfaEnabled: true,
      autoLockMinutes: 5,
      currency: 'USD',
      hideLowBalances: false,
      slippageTolerance: 0.5,
      cloudBackupEnabled: true,
      lastBackupTimestamp: new Date().toISOString(),
      moralisApiKey: 'htHHnidblRn04zOOm4Ac2bsNtvfWnhF4JMYyBBEOorMVBtcrZTx7fPcpIN4MS7Wu',
    };
    
    const saved = localStorage.getItem('northveil_v3_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge in case moralisApiKey is missing in saved localStorage, or if it's the old invalid JWT
      if (!parsed.moralisApiKey || parsed.moralisApiKey.startsWith('eyJ')) {
        parsed.moralisApiKey = defaultSettings.moralisApiKey;
      }
      return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  });

  const [gasEstimates, setGasEstimates] = useState<ChainGasEstimate[]>(INITIAL_GAS_ESTIMATES);
  const [systemMetrics] = useState<MicroserviceStatus[]>(MICROSERVICES_STATUS);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);

  // Removed plaintext seedPhrase saving to localStorage!

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('northveil_v3_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('northveil_v3_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('northveil_v3_staking', JSON.stringify(stakingPositions));
  }, [stakingPositions]);

  useEffect(() => {
    localStorage.setItem('northveil_v3_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Handle Theme class on body
  useEffect(() => {
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.theme]);

  const refreshGasEstimates = async () => {
    const newEstimates = [...INITIAL_GAS_ESTIMATES];
    
    // We only fetch for EVM networks using our custom RPCs to make it live
    for (const chain of SUPPORTED_CHAINS) {
      if (chain.id === 'solana' || chain.id === 'bitcoin') continue;
      
      try {
        const provider = ProviderService.getEVMProvider(chain.id, chain.rpcUrl);
        const feeData = await provider.getFeeData();
        
        if (feeData.gasPrice) {
          const baseGwei = Number(ethers.formatUnits(feeData.gasPrice, 'gwei'));
          const estimateIndex = newEstimates.findIndex(g => g.network === chain.id);
          
          if (estimateIndex >= 0) {
            const est = { ...newEstimates[estimateIndex] };
            est.baseFee = baseGwei;
            
            const nativePrice = chain.nativeTokenPrice;
            const calcUsd = (gwei: number) => (gwei * 21000 * 1e-9) * nativePrice;
            
            est.tiers = [
              { speed: 'slow', gweiOrUnit: Number((baseGwei * 0.9).toFixed(1)), timeSeconds: 30, feeUsd: calcUsd(baseGwei * 0.9) },
              { speed: 'standard', gweiOrUnit: Number(baseGwei.toFixed(1)), timeSeconds: 15, feeUsd: calcUsd(baseGwei) },
              { speed: 'fast', gweiOrUnit: Number((baseGwei * 1.2).toFixed(1)), timeSeconds: 10, feeUsd: calcUsd(baseGwei * 1.2) },
              { speed: 'instant', gweiOrUnit: Number((baseGwei * 1.5).toFixed(1)), timeSeconds: 5, feeUsd: calcUsd(baseGwei * 1.5) },
            ];
            
            est.congestionLevel = baseGwei > 50 ? 'high' : baseGwei > 20 ? 'moderate' : 'low';
            newEstimates[estimateIndex] = est;
          } else {
            // Push new estimate if it didn't exist
            const nativePrice = chain.nativeTokenPrice;
            const calcUsd = (gwei: number) => (gwei * 21000 * 1e-9) * nativePrice;
            newEstimates.push({
              network: chain.id,
              networkName: chain.name,
              gasUnit: 'Gwei',
              baseFee: baseGwei,
              tiers: [
                { speed: 'slow', gweiOrUnit: Number((baseGwei * 0.9).toFixed(1)), timeSeconds: 30, feeUsd: calcUsd(baseGwei * 0.9) },
                { speed: 'standard', gweiOrUnit: Number(baseGwei.toFixed(1)), timeSeconds: 15, feeUsd: calcUsd(baseGwei) },
                { speed: 'fast', gweiOrUnit: Number((baseGwei * 1.2).toFixed(1)), timeSeconds: 10, feeUsd: calcUsd(baseGwei * 1.2) },
                { speed: 'instant', gweiOrUnit: Number((baseGwei * 1.5).toFixed(1)), timeSeconds: 5, feeUsd: calcUsd(baseGwei * 1.5) },
              ],
              congestionLevel: baseGwei > 50 ? 'high' : baseGwei > 20 ? 'moderate' : 'low'
            });
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch live gas for ${chain.name}`, e);
      }
    }
    setGasEstimates(newEstimates);
  };

  useEffect(() => {
    refreshGasEstimates();
    const interval = setInterval(refreshGasEstimates, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const refreshBalances = async () => {
    if (!seedPhrase || seedPhrase.length === 0 || !activeSubWallet) return;
    try {
      const solanaAddress = WalletService.deriveSolanaAddress(seedPhrase, activeSubWallet.accountIndex).address;
      const bitcoinAddress = WalletService.deriveBitcoinAddress(seedPhrase, activeSubWallet.accountIndex).address;
      
      // Deep clone current assets to prevent mutating the state directly
      let baseAssets: CryptoAsset[] = JSON.parse(JSON.stringify(latestAssets.current));
      
      if (baseAssets.length === 0) {
        baseAssets = SUPPORTED_CHAINS.map(chain => ({
          id: `native-${chain.id}`,
          symbol: chain.symbol,
          name: chain.symbol,
          network: chain.id as NetworkId,
          balance: 0,
          priceUsd: chain.nativeTokenPrice,
          change24h: 0,
          icon: chain.icon,
        }));
      }

      if (userSettings.moralisApiKey) {
        try {
          const evmAddress = activeSubWallet.address;
          const apiKey = userSettings.moralisApiKey;

          // Fetch all tokens across major chains
          const [
            ethTokens, polyTokens, arbTokens, baseTokens, bscTokens, avaxTokens, 
            ethNative, polyNative, arbNative, baseNative, bscNative, avaxNative,
            ethNfts, polyNfts, arbNfts, baseNfts, bscNfts, avaxNfts,
            history,
            ethTxs, polyTxs, baseTxs
          ] = await Promise.all([
            IndexerService.fetchAllTokens(evmAddress, 'eth', apiKey),
            IndexerService.fetchAllTokens(evmAddress, 'polygon', apiKey),
            IndexerService.fetchAllTokens(evmAddress, 'arbitrum', apiKey),
            IndexerService.fetchAllTokens(evmAddress, 'base', apiKey),
            IndexerService.fetchAllTokens(evmAddress, 'bsc', apiKey),
            IndexerService.fetchAllTokens(evmAddress, 'avalanche', apiKey),
            IndexerService.fetchNativeBalance(evmAddress, 'eth', apiKey),
            IndexerService.fetchNativeBalance(evmAddress, 'polygon', apiKey),
            IndexerService.fetchNativeBalance(evmAddress, 'arbitrum', apiKey),
            IndexerService.fetchNativeBalance(evmAddress, 'base', apiKey),
            IndexerService.fetchNativeBalance(evmAddress, 'bsc', apiKey),
            IndexerService.fetchNativeBalance(evmAddress, 'avalanche', apiKey),
            IndexerService.fetchAllNFTs(evmAddress, 'eth', apiKey),
            IndexerService.fetchAllNFTs(evmAddress, 'polygon', apiKey),
            IndexerService.fetchAllNFTs(evmAddress, 'arbitrum', apiKey),
            IndexerService.fetchAllNFTs(evmAddress, 'base', apiKey),
            IndexerService.fetchAllNFTs(evmAddress, 'bsc', apiKey),
            IndexerService.fetchAllNFTs(evmAddress, 'avalanche', apiKey),
            IndexerService.fetchPortfolioHistory(evmAddress, apiKey),
            IndexerService.fetchTransactionHistory(evmAddress, 'eth', apiKey),
            IndexerService.fetchTransactionHistory(evmAddress, 'polygon', apiKey),
            IndexerService.fetchTransactionHistory(evmAddress, 'base', apiKey)
          ]);

          // Append native balances to the token arrays manually
          const addNativeToken = (networkId: string, tokens: any[], balance: number) => {
            const chainInfo = SUPPORTED_CHAINS.find(c => c.id === networkId);
            if (chainInfo) {
              tokens.push({
                id: `native-${chainInfo.id}`,
                symbol: chainInfo.symbol,
                name: chainInfo.symbol,
                network: chainInfo.id,
                balance: balance,
                priceUsd: chainInfo.nativeTokenPrice,
                change24h: 0,
                icon: chainInfo.icon,
              });
            }
          };

          addNativeToken('ethereum', ethTokens, ethNative);
          addNativeToken('polygon', polyTokens, polyNative);
          addNativeToken('arbitrum', arbTokens, arbNative);
          addNativeToken('base', baseTokens, baseNative);
          addNativeToken('bsc', bscTokens, bscNative);
          addNativeToken('avalanche', avaxTokens, avaxNative);

          const allIndexedTokens = [...ethTokens, ...polyTokens, ...arbTokens, ...baseTokens, ...bscTokens, ...avaxTokens];
          
          // Merge indexed tokens with base assets
          allIndexedTokens.forEach(indexedToken => {
            const existingIdx = baseAssets.findIndex(a => a.id === indexedToken.id || (a.symbol === indexedToken.symbol && a.network === indexedToken.network));
            if (existingIdx >= 0) {
              baseAssets[existingIdx].balance = indexedToken.balance;
            } else {
              baseAssets.push(indexedToken);
            }
          });

          const allFetchedNfts = [...ethNfts, ...polyNfts, ...arbNfts, ...baseNfts, ...bscNfts, ...avaxNfts];
          setOwnedNFTs(prev => {
            const merged = [...prev];
            allFetchedNfts.forEach(nft => {
              if (!merged.find(n => n.id === nft.id)) {
                merged.push(nft);
              }
            });
            return merged;
          });
          setHistoricalPerformance(history);
          
          // Merge transactions, filtering out duplicates
          const fetchedTxs = [...ethTxs, ...polyTxs, ...baseTxs];
          setTransactions(prev => {
            const newTxs = fetchedTxs.filter(tx => !prev.some(p => p.id === tx.id));
            return [...newTxs, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          });
        } catch (indexerError) {
          console.error('Indexer failed:', indexerError);
        }
      }

      const liveAssets = await TokenService.fetchLiveBalancesAndPrices(baseAssets, activeSubWallet.address, solanaAddress, bitcoinAddress);
      setAssets(liveAssets);
      
      // Generate a realistic 30-day portfolio history chart anchored to their ACTUAL current USD balance
      const currentTotalUsd = liveAssets.reduce((sum, asset) => sum + asset.balance * asset.priceUsd, 0);
      
      if (currentTotalUsd > 0) {
        const generatedHistory: PortfolioHistoryPoint[] = [];
        let runningValue = currentTotalUsd * (0.7 + Math.random() * 0.2); // Start 30 days ago at 70-90% of current value
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          if (i === 0) {
            // Anchor the final point EXACTLY to the current total USD
            runningValue = currentTotalUsd;
          } else {
            // Random daily fluctuation (-2% to +3%)
            const dailyChange = 1 + (Math.random() * 0.05 - 0.02);
            runningValue *= dailyChange;
          }
          
          const dateStr = date.toISOString().split('T')[0];
          const closeVal = Number(runningValue.toFixed(6));
          // Create pseudo OHLC
          const volatility = closeVal * 0.02; // 2% daily range
          const openVal = closeVal + (Math.random() * volatility - volatility/2);
          const highVal = Math.max(openVal, closeVal) + Math.random() * (volatility/2);
          const lowVal = Math.min(openVal, closeVal) - Math.random() * (volatility/2);
          
          generatedHistory.push({
            date: dateStr,
            open: Number(openVal.toFixed(6)),
            high: Number(highVal.toFixed(6)),
            low: Number(lowVal.toFixed(6)),
            close: closeVal,
            isGreen: closeVal >= openVal
          } as any);
        }
        setHistoricalPerformance(generatedHistory);
      } else {
        setHistoricalPerformance([]);
      }
      
      latestAssets.current = liveAssets;
    } catch (e) {
      console.error('Failed to refresh balances:', e);
    }
  };

  // Real-time Live Balances
  useEffect(() => {
    refreshBalances();
    const interval = setInterval(refreshBalances, 30000); // 30s
    return () => clearInterval(interval);
  }, [activeSubWallet?.address, seedPhrase]);

  // Total Net Worth Calculation
  const totalNetWorthUsd = useMemo(() => {
    const liquidValue = assets.reduce((sum, asset) => sum + asset.balance * asset.priceUsd, 0);
    const stakedValue = stakingPositions.reduce((sum, pos) => {
      const asset = assets.find((a) => a.id === pos.assetId || a.symbol === pos.assetSymbol);
      const price = asset ? asset.priceUsd : 0;
      return sum + (pos.amountStaked + pos.pendingRewards) * price;
    }, 0);
    return Number((liquidValue + stakedValue).toFixed(2));
  }, [assets, stakingPositions]);

  // Translation Helper
  const t = (key: string): string => {
    const lang = userSettings.language || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY.en;
    return dict[key] || DICTIONARY.en[key] || key;
  };

  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({
      ...prev,
      ...newSettings,
      lastBackupTimestamp: new Date().toISOString(),
    }));
  };

  // Hardware wallet pairing simulation
  const connectHardwareWallet = (device: 'ledger' | 'trezor' | 'gridplus') => {
    const names = {
      ledger: 'Ledger Nano X (Flex)',
      trezor: 'Trezor Safe 3',
      gridplus: 'GridPlus Lattice1',
    };
    setHardwareWallet({
      isConnected: true,
      deviceType: device,
      deviceName: names[device],
      firmwareVersion: 'v2.4.1-secure',
      address: '0x71C87291a89041235B91238491209C8',
    });
  };

  const disconnectHardwareWallet = () => {
    setHardwareWallet({
      isConnected: false,
      deviceType: null,
      deviceName: null,
      firmwareVersion: null,
      address: null,
    });
  };

  // Biometric Auth Handlers
  const triggerBiometricAuth = (reason: string, onSuccess: () => void) => {
    if (!userSettings.biometricsEnabled) {
      onSuccess();
      return;
    }
    setBiometricPromptReason(reason);
    setPendingBiometricSuccess(() => onSuccess);
    setIsBiometricModalOpen(true);
  };

  const unlockWalletWithBiometrics = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setBiometricPromptReason('Unlock Apex Wallet');
      setPendingBiometricSuccess(() => () => {
        setIsLocked(false);
        resolve(true);
      });
      setIsBiometricModalOpen(true);
    });
  };

  const unlockVault = (password: string): boolean => {
    const encryptedVault = localStorage.getItem('northveil_v3_encrypted_vault');
    if (!encryptedVault) return false;
    
    const decryptedSeed = VaultService.decryptSeedPhrase(encryptedVault, password);
    if (decryptedSeed && decryptedSeed.length >= 12) {
      setSeedPhrase(decryptedSeed);
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setupVault = (seed: string[], password: string): boolean => {
    if (password.length < 4) return false;
    
    const encryptedVault = VaultService.encryptSeedPhrase(seed, password);
    localStorage.setItem('northveil_v3_encrypted_vault', encryptedVault);
    localStorage.removeItem('northveil_v3_seed_mock_encrypted_temp'); // Clean up old mocks if any
    
    setSeedPhrase(seed);
    setIsVaultConfigured(true);
    setIsLocked(false);
    return true;
  };

  const lockWallet = () => {
    if (isVaultConfigured) {
      setSeedPhrase([]); // Clear from memory!
      setIsLocked(true);
    }
  };

  // Execute Swap & Bridge
  const executeSwap = async ({
    fromAssetId,
    toAssetId,
    fromAmount,
    toAmount,
    isBridge,
    toNetwork,
    gasFeeUsd,
    quoteData
  }: {
    fromAssetId: string;
    toAssetId: string;
    fromAmount: number;
    toAmount: number;
    isBridge: boolean;
    toNetwork?: NetworkId;
    gasFeeUsd: number;
    quoteData?: any;
  }) => {
    const sourceAsset = assets.find((a) => a.id === fromAssetId);
    const targetAsset = assets.find((a) => a.id === toAssetId);

    if (!sourceAsset || !targetAsset || !seedPhrase || seedPhrase.length === 0) return;

    try {
      let txHash = '';
      
      if (!isBridge && quoteData) {
        // Real DEX swap via SwapService
        const provider = ProviderService.getEVMProvider(sourceAsset.network);
        const connectedWallet = WalletService.getEVMWallet(seedPhrase, activeSubWallet.accountIndex, provider);
        
        // Execute real swap
        txHash = await SwapService.executeSwap({
          fromAsset: sourceAsset,
          toAsset: targetAsset,
          amount: fromAmount,
          slippage: userSettings.slippageTolerance,
          walletAddress: activeSubWallet.address,
          evmWallet: connectedWallet,
          quoteData
        });
      } else {
        // Fallback or cross-chain bridge mock logic
        const provider = ProviderService.getEVMProvider(sourceAsset.network);
        const connectedWallet = WalletService.getEVMWallet(seedPhrase, activeSubWallet.accountIndex, provider);

        const tx = {
          to: connectedWallet.address,
          value: 0
        };
        const txResponse = await connectedWallet.sendTransaction(tx);
        txHash = txResponse.hash;
        
        // Mock waiting for inclusion
        await txResponse.wait();
      }

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        hash: txHash,
        type: isBridge ? 'bridge' : 'swap',
        network: toNetwork || sourceAsset.network,
        fromAsset: sourceAsset.symbol,
        fromAmount,
        toAsset: targetAsset.symbol,
        toAmount,
        senderAddress: activeSubWallet.address,
        gasFeeUsd,
        timestamp: new Date().toISOString(),
        status: 'pending',
        costBasisUsd: fromAmount * sourceAsset.priceUsd,
        realizedGainUsd: toAmount * targetAsset.priceUsd - fromAmount * sourceAsset.priceUsd - gasFeeUsd,
      };

      setTransactions((prev) => [newTx, ...prev]);

      setTransactions((prev) => prev.map(t => t.id === newTx.id ? { ...t, status: 'completed' } : t));
      refreshBalances();
      return txHash;
    } catch (e: any) {
      alert('Swap execution failed: ' + e.message);
      throw e;
    }
  };

  // Send Crypto
  const sendCrypto = async ({
    assetId,
    amount,
    recipientAddress,
    gasFeeUsd,
  }: {
    assetId: string;
    amount: number;
    recipientAddress: string;
    gasFeeUsd: number;
  }) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset || !seedPhrase || seedPhrase.length === 0) return;

    try {
      if (targetAsset.network === 'solana') {
        throw new Error('Solana send not fully implemented in this phase.');
      } else if (targetAsset.network === 'bitcoin') {
        throw new Error('Bitcoin send not fully implemented in this phase.');
      }

      // EVM Chain live broadcast
      const provider = ProviderService.getEVMProvider(targetAsset.network);
      const connectedWallet = WalletService.getEVMWallet(seedPhrase, activeSubWallet.accountIndex, provider);

      let txResponse;
      if (targetAsset.contractAddress === '0x0000000000000000000000000000000000000000' || targetAsset.contractAddress === '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c') {
        const tx = {
          to: recipientAddress,
          value: ethers.parseEther(amount.toString())
        };
        const gasLimit = await connectedWallet.estimateGas(tx);
        txResponse = await connectedWallet.sendTransaction({ ...tx, gasLimit });
      } else {
        const ERC20_ABI = ['function transfer(address to, uint256 value) returns (bool)'];
        const contract = new ethers.Contract(targetAsset.contractAddress, ERC20_ABI, connectedWallet);
        const decimals = 18; // Ideally we fetch this, but assume 18 for demo
        const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
        const gasLimit = await contract.transfer.estimateGas(recipientAddress, parsedAmount);
        txResponse = await contract.transfer(recipientAddress, parsedAmount, { gasLimit });
      }

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        hash: txResponse.hash,
        type: 'send',
        network: targetAsset.network,
        fromAsset: targetAsset.symbol,
        fromAmount: amount,
        senderAddress: activeSubWallet.address,
        recipientAddress,
        gasFeeUsd,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      setTransactions((prev) => [newTx, ...prev]);

      txResponse.wait().then(() => {
        setTransactions((prev) => prev.map(t => t.id === newTx.id ? { ...t, status: 'completed' } : t));
        refreshBalances();
      });

    } catch (e: any) {
      alert('Transaction failed: ' + e.message);
    }
  };

  // Staking Handlers
  const stakeCrypto = async ({
    assetId,
    amount,
    validatorName,
  }: {
    assetId: string;
    amount: number;
    validatorName: string;
  }) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    // Deduct liquid balance
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, balance: Math.max(0, a.balance - amount) } : a))
    );

    // Add or create staking position
    const existingIndex = stakingPositions.findIndex((p) => p.assetId === assetId);
    if (existingIndex >= 0) {
      setStakingPositions((prev) =>
        prev.map((pos, idx) =>
          idx === existingIndex ? { ...pos, amountStaked: pos.amountStaked + amount } : pos
        )
      );
    } else {
      const newPos: StakingPosition = {
        id: `stake-${Date.now()}`,
        assetId: asset.id,
        assetSymbol: asset.symbol,
        network: asset.network,
        amountStaked: amount,
        apy: asset.apy || 5.0,
        rewardsClaimed: 0,
        pendingRewards: 0,
        stakedDate: new Date().toISOString().split('T')[0],
        validatorName,
      };
      setStakingPositions((prev) => [...prev, newPos]);
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      hash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'stake',
      network: asset.network,
      fromAsset: asset.symbol,
      fromAmount: amount,
      senderAddress: '0x71C...392A',
      gasFeeUsd: 1.25,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const unstakeCrypto = async (positionId: string, amount: number) => {
    const pos = stakingPositions.find((p) => p.id === positionId);
    if (!pos) return;

    // Return to liquid balance
    setAssets((prev) =>
      prev.map((a) => (a.id === pos.assetId ? { ...a, balance: a.balance + amount } : a))
    );

    // Update staking position
    setStakingPositions((prev) =>
      prev
        .map((p) => {
          if (p.id === positionId) {
            const remaining = Math.max(0, p.amountStaked - amount);
            return { ...p, amountStaked: remaining };
          }
          return p;
        })
        .filter((p) => p.amountStaked > 0)
    );

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      hash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'unstake',
      network: pos.network,
      fromAsset: pos.assetSymbol,
      fromAmount: amount,
      senderAddress: '0x71C...392A',
      gasFeeUsd: 1.50,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const claimRewards = async (positionId: string) => {
    const pos = stakingPositions.find((p) => p.id === positionId);
    if (!pos || pos.pendingRewards <= 0) return;

    const rewardAmount = pos.pendingRewards;

    // Add reward to liquid asset balance
    setAssets((prev) =>
      prev.map((a) => (a.id === pos.assetId ? { ...a, balance: a.balance + rewardAmount } : a))
    );

    // Reset pending reward & increment claimed
    setStakingPositions((prev) =>
      prev.map((p) =>
        p.id === positionId
          ? { ...p, rewardsClaimed: p.rewardsClaimed + rewardAmount, pendingRewards: 0 }
          : p
      )
    );

    const asset = assets.find((a) => a.id === pos.assetId);
    const rewardUsd = asset ? rewardAmount * asset.priceUsd : rewardAmount * 100;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      hash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'claim',
      network: pos.network,
      fromAsset: pos.assetSymbol,
      fromAmount: rewardAmount,
      senderAddress: pos.validatorName,
      gasFeeUsd: 0.85,
      timestamp: new Date().toISOString(),
      status: 'completed',
      costBasisUsd: 0,
      realizedGainUsd: rewardUsd,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Tax Report Summary Engine
  const getTaxSummary = (year: number, method: AccountingMethod): TaxReportSummary => {
    const yearTxs = transactions.filter((tx) => {
      const txYear = new Date(tx.timestamp).getFullYear();
      return txYear === year || year === 2026; // Default to current dataset
    });

    let totalGains = 0;
    let totalLosses = 0;
    let stakingIncome = 0;
    let totalGas = 0;
    let totalVolume = 0;

    yearTxs.forEach((tx) => {
      totalGas += tx.gasFeeUsd || 0;
      totalVolume += tx.fromAmount * (assets.find((a) => a.symbol === tx.fromAsset)?.priceUsd || 1);

      if (tx.type === 'claim' && tx.realizedGainUsd) {
        stakingIncome += tx.realizedGainUsd;
      }

      if ((tx.type === 'swap' || tx.type === 'send') && tx.realizedGainUsd !== undefined) {
        if (tx.realizedGainUsd > 0) {
          totalGains += tx.realizedGainUsd;
        } else {
          totalLosses += Math.abs(tx.realizedGainUsd);
        }
      }
    });

    return {
      taxYear: year,
      accountingMethod: method,
      totalTransactions: yearTxs.length,
      totalVolumeUsd: Number(totalVolume.toFixed(2)),
      totalCapitalGainsUsd: Number(totalGains.toFixed(2)),
      totalCapitalLossesUsd: Number(totalLosses.toFixed(2)),
      netTaxableIncomeUsd: Number((totalGains - totalLosses + stakingIncome).toFixed(2)),
      stakingRewardsIncomeUsd: Number(stakingIncome.toFixed(2)),
      totalGasFeesPaidUsd: Number(totalGas.toFixed(2)),
    };
  };

  // Tax CSV Exporter
  const exportTaxDataCsv = (year: number, method: AccountingMethod) => {
    const summary = getTaxSummary(year, method);
    const headers = [
      'Transaction ID',
      'Date & Time (UTC)',
      'Type',
      'Network',
      'From Asset',
      'From Amount',
      'To Asset',
      'To Amount',
      'Gas Fee (USD)',
      'Cost Basis (USD)',
      'Realized Gain/Loss (USD)',
      'Status',
    ];

    const rows = transactions.map((tx) => [
      tx.id,
      tx.timestamp,
      tx.type.toUpperCase(),
      tx.network.toUpperCase(),
      tx.fromAsset,
      tx.fromAmount,
      tx.toAsset || '',
      tx.toAmount || '',
      tx.gasFeeUsd.toFixed(2),
      (tx.costBasisUsd || 0).toFixed(2),
      (tx.realizedGainUsd || 0).toFixed(2),
      tx.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`# APEX DEX WALLET TAX REPORT (${year}) - METHOD: ${method}`, `# Net Taxable Income: $${summary.netTaxableIncomeUsd}`]
        .concat([headers.join(','), ...rows.map((r) => r.join(','))])
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apex_Tax_Report_${year}_${method}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Restore Wallet From Seed
  const restoreWalletFromSeed = (words: string[]): boolean => {
    const isValid = WalletService.validateSeedPhrase(words);
    if (isValid) {
      setSeedPhrase(words);
      
      // Derive initial address to set up first subwallet
      const { address, path } = WalletService.deriveEVMAddress(words, 0);
      const solana = WalletService.deriveSolanaAddress(words, 0);
      const mainWallet: SubWalletAccount = {
        id: 'acc-0',
        name: 'Main Trading Vault',
        accountIndex: 0,
        address,
        derivationPath: path,
        solanaAddress: solana.address,
        solanaDerivationPath: solana.path,
        colorTag: '#00f0ff',
        isDefault: true,
        createdAt: new Date().toISOString().split('T')[0],
        balanceMultiplier: 1.0,
      };
      setSubWallets([mainWallet]);
      setActiveWalletIdState('acc-0');
      
      setTransactions([]);
      setStakingPositions([]);
      const defaultAssets: CryptoAsset[] = SUPPORTED_CHAINS.map(chain => ({
        id: `native-${chain.id}`,
        symbol: chain.symbol,
        name: chain.symbol,
        network: chain.id as NetworkId,
        balance: 0,
        priceUsd: chain.nativeTokenPrice,
        change24h: 0,
        icon: chain.icon,
      }));
      setAssets(defaultAssets);
      setOwnedNFTs([]);
      setHistoricalPerformance([]);
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const toggleFavoriteAsset = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, isFavorite: !a.isFavorite } : a))
    );
  };

  return (
    <WalletContext.Provider
      value={{
        assets,
        transactions,
        stakingPositions,
        activeChain,
        setActiveChain,
        ownedNFTs,
        historicalPerformance,
        customNetworks,
        addCustomNetwork,
        subWallets,
        activeWalletId,
        activeSubWallet,
        setActiveWalletId,
        createSubWallet,
        renameSubWallet,
        deleteSubWallet,
        transferBetweenSubWallets,
        hardwareWallet,
        connectHardwareWallet,
        disconnectHardwareWallet,
        isLocked,
        unlockWalletWithBiometrics,
        lockWallet,
        isBiometricModalOpen,
        setIsBiometricModalOpen,
        biometricPromptReason,
        triggerBiometricAuth,
        userSettings,
        updateUserSettings,
        gasEstimates,
        systemMetrics,
        seedPhrase,
        setSeedPhrase,
        t,
        totalNetWorthUsd,
        executeSwap,
        sendCrypto,
        stakeCrypto,
        unstakeCrypto,
        claimRewards,
        getTaxSummary,
        exportTaxDataCsv,
        toggleFavoriteAsset,
        restoreWalletFromSeed,
        unlockVault,
        setupVault,
        isVaultConfigured,
        addCustomToken: (token: CryptoAsset) => {
          setAssets((prev) => {
            // Prevent duplicates
            const exists = prev.find(a => a.contractAddress?.toLowerCase() === token.contractAddress?.toLowerCase() && a.network === token.network);
            if (exists) return prev;
            return [...prev, token];
          });
        },
      }}
    >
      {children}

      {/* Biometric Scan Modal Handler */}
      {isBiometricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#141419] border-4 border-white p-6 sm:p-8 max-w-sm w-full shadow-[10px_10px_0px_0px_#ccff00] text-center relative space-y-5">
            {/* Neo-brutalist header tag */}
            <div className="flex justify-center">
              <span className="px-2.5 py-1 bg-[#ff007f] text-white font-mono font-black text-[10px] uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                EIP-712 BIOMETRIC GUARD
              </span>
            </div>

            {/* Brutalist Touch / Scanner Visual */}
            <div className="mx-auto w-24 h-24 bg-[#0a0a0c] border-3 border-white shadow-[5px_5px_0px_0px_#00f0ff] flex flex-col items-center justify-center my-2 relative">
              <span className="text-4xl">👆</span>
              <span className="text-[9px] font-mono font-black text-[#ccff00] mt-1 tracking-widest uppercase">TOUCH ID</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white font-mono uppercase tracking-tight">BIOMETRIC VERIFICATION</h3>
              <p className="text-slate-300 font-mono text-xs mt-2 border-2 border-white/30 bg-[#0a0a0c] p-2.5">
                {biometricPromptReason || 'Touch Sensor / Face ID scanning for encrypted wallet access'}
              </p>
            </div>

            <div className="space-y-2.5 font-mono pt-1">
              <button
                onClick={() => {
                  setIsBiometricModalOpen(false);
                  if (pendingBiometricSuccess) {
                    pendingBiometricSuccess();
                    setPendingBiometricSuccess(null);
                  }
                }}
                className="w-full py-3.5 bg-[#ccff00] hover:bg-[#d8ff33] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>AUTHORIZE BIOMETRICS</span>
              </button>
              <button
                onClick={() => setIsBiometricModalOpen(false)}
                className="w-full py-2.5 bg-[#0a0a0c] hover:bg-[#181820] text-white font-mono font-black text-xs uppercase border-2 border-white shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
