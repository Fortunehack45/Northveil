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
} from '../types';
import {
  SUPPORTED_CHAINS,
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
  INITIAL_STAKING_POSITIONS,
  INITIAL_GAS_ESTIMATES,
  MICROSERVICES_STATUS,
  DICTIONARY,
  MOCK_SEED_PHRASE,
} from '../data/initialData';

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
  // Multi-Wallet Sub-Account System
  subWallets: SubWalletAccount[];
  activeWalletId: string;
  activeSubWallet: SubWalletAccount;
  setActiveWalletId: (id: string) => void;
  createSubWallet: (name: string, colorTag?: string) => SubWalletAccount;
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
  t: (key: string) => string;
  totalNetWorthUsd: number;
  // Financial Actions
  executeSwap: (params: {
    fromAssetId: string;
    toAssetId: string;
    fromAmount: number;
    toAmount: number;
    isBridge: boolean;
    toNetwork?: NetworkId;
    gasFeeUsd: number;
  }) => Promise<void>;
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
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<CryptoAsset[]>(() => {
    const saved = localStorage.getItem('apex_dex_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('apex_dex_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>(() => {
    const saved = localStorage.getItem('apex_dex_staking');
    return saved ? JSON.parse(saved) : INITIAL_STAKING_POSITIONS;
  });

  const [activeChain, setActiveChain] = useState<NetworkId>('ethereum');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);
  const [biometricPromptReason, setBiometricPromptReason] = useState<string>('');
  const [pendingBiometricSuccess, setPendingBiometricSuccess] = useState<(() => void) | null>(null);

  // Multi-Wallet Sub-Account State
  const [subWallets, setSubWallets] = useState<SubWalletAccount[]>(() => {
    const saved = localStorage.getItem('apex_dex_subwallets');
    return saved ? JSON.parse(saved) : DEFAULT_SUB_WALLETS;
  });

  const [activeWalletId, setActiveWalletIdState] = useState<string>(() => {
    const saved = localStorage.getItem('apex_dex_active_subwallet');
    return saved || 'acc-0';
  });

  useEffect(() => {
    localStorage.setItem('apex_dex_subwallets', JSON.stringify(subWallets));
  }, [subWallets]);

  useEffect(() => {
    localStorage.setItem('apex_dex_active_subwallet', activeWalletId);
  }, [activeWalletId]);

  const activeSubWallet = useMemo(() => {
    return subWallets.find((w) => w.id === activeWalletId) || subWallets[0] || DEFAULT_SUB_WALLETS[0];
  }, [subWallets, activeWalletId]);

  // Derived effective assets calculated based on activeSubWallet balanceMultiplier
  const effectiveAssets = useMemo(() => {
    const mult = activeSubWallet ? activeSubWallet.balanceMultiplier : 1.0;
    return assets.map((asset) => ({
      ...asset,
      balance: Number((asset.balance * mult).toFixed(4)),
    }));
  }, [assets, activeSubWallet]);

  const setActiveWalletId = (id: string) => {
    if (subWallets.some((w) => w.id === id)) {
      setActiveWalletIdState(id);
    }
  };

  const createSubWallet = (name: string, colorTag: string = '#00f0ff'): SubWalletAccount => {
    const nextIndex = subWallets.length;
    const hexChars = '0123456789ABCDEF';
    let mockAddr = '0x';
    for (let i = 0; i < 40; i++) {
      mockAddr += hexChars[(nextIndex * 17 + i * 13 + 7) % 16];
    }

    const newWallet: SubWalletAccount = {
      id: `acc-${Date.now()}`,
      name: name.trim() || `Sub-Account #${nextIndex + 1}`,
      accountIndex: nextIndex,
      address: mockAddr,
      derivationPath: `m/44'/60'/0'/0/${nextIndex}`,
      colorTag: colorTag || '#00f0ff',
      createdAt: new Date().toISOString().split('T')[0],
      balanceMultiplier: Number((0.3 + (nextIndex % 4) * 0.2).toFixed(2)),
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
    const saved = localStorage.getItem('apex_dex_settings');
    if (saved) return JSON.parse(saved);
    return {
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
    };
  });

  const [gasEstimates, setGasEstimates] = useState<ChainGasEstimate[]>(INITIAL_GAS_ESTIMATES);
  const [systemMetrics] = useState<MicroserviceStatus[]>(MICROSERVICES_STATUS);
  const [seedPhrase] = useState<string[]>(MOCK_SEED_PHRASE);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('apex_dex_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('apex_dex_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('apex_dex_staking', JSON.stringify(stakingPositions));
  }, [stakingPositions]);

  useEffect(() => {
    localStorage.setItem('apex_dex_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Handle Theme class on body
  useEffect(() => {
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.theme]);

  // Real-time price simulation & pending staking reward increments
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate crypto prices subtly
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const deltaPercent = (Math.random() - 0.49) * 0.4; // subtle market move
          const newPrice = Math.max(0.0001, asset.priceUsd * (1 + deltaPercent / 100));
          return {
            ...asset,
            priceUsd: Number(newPrice.toFixed(2)),
            change24h: Number((asset.change24h + deltaPercent * 0.1).toFixed(2)),
          };
        })
      );

      // Increment pending staking rewards
      setStakingPositions((prevPositions) =>
        prevPositions.map((pos) => {
          const rewardIncrement = (pos.amountStaked * (pos.apy / 100)) / (365 * 24 * 3600); // per second
          return {
            ...pos,
            pendingRewards: Number((pos.pendingRewards + rewardIncrement * 3).toFixed(5)),
          };
        })
      );

      // Fluctuate gas fees
      setGasEstimates((prevGas) =>
        prevGas.map((item) => {
          const delta = (Math.random() - 0.5) * 2;
          const newBase = Math.max(1, Number((item.baseFee + delta).toFixed(1)));
          return {
            ...item,
            baseFee: newBase,
            tiers: item.tiers.map((tier) => ({
              ...tier,
              gweiOrUnit: Math.max(0.01, Number((tier.gweiOrUnit + delta * 0.2).toFixed(2))),
            })),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Total Net Worth Calculation
  const totalNetWorthUsd = useMemo(() => {
    const liquidValue = effectiveAssets.reduce((sum, asset) => sum + asset.balance * asset.priceUsd, 0);
    const stakedValue = stakingPositions.reduce((sum, pos) => {
      const asset = effectiveAssets.find((a) => a.id === pos.assetId || a.symbol === pos.assetSymbol);
      const price = asset ? asset.priceUsd : 0;
      return sum + (pos.amountStaked + pos.pendingRewards) * price;
    }, 0);
    return Number((liquidValue + stakedValue).toFixed(2));
  }, [effectiveAssets, stakingPositions]);

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

  const lockWallet = () => {
    setIsLocked(true);
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
  }: {
    fromAssetId: string;
    toAssetId: string;
    fromAmount: number;
    toAmount: number;
    isBridge: boolean;
    toNetwork?: NetworkId;
    gasFeeUsd: number;
  }) => {
    const sourceAsset = assets.find((a) => a.id === fromAssetId);
    const targetAsset = assets.find((a) => a.id === toAssetId);

    if (!sourceAsset || !targetAsset) return;

    // Deduct source asset balance, add target asset balance
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === fromAssetId) {
          return { ...asset, balance: Math.max(0, asset.balance - fromAmount) };
        }
        if (asset.id === toAssetId) {
          return { ...asset, balance: asset.balance + toAmount };
        }
        return asset;
      })
    );

    // Record Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      hash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: isBridge ? 'bridge' : 'swap',
      network: toNetwork || sourceAsset.network,
      fromAsset: sourceAsset.symbol,
      fromAmount,
      toAsset: targetAsset.symbol,
      toAmount,
      senderAddress: hardwareWallet.isConnected ? hardwareWallet.address! : '0x71C...392A',
      gasFeeUsd,
      timestamp: new Date().toISOString(),
      status: 'completed',
      costBasisUsd: fromAmount * sourceAsset.priceUsd,
      realizedGainUsd: toAmount * targetAsset.priceUsd - fromAmount * sourceAsset.priceUsd - gasFeeUsd,
    };

    setTransactions((prev) => [newTx, ...prev]);
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
    if (!targetAsset) return;

    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === assetId) {
          return { ...asset, balance: Math.max(0, asset.balance - amount) };
        }
        return asset;
      })
    );

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      hash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'send',
      network: targetAsset.network,
      fromAsset: targetAsset.symbol,
      fromAmount: amount,
      senderAddress: hardwareWallet.isConnected ? hardwareWallet.address! : '0x71C...392A',
      recipientAddress,
      gasFeeUsd,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
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
    const isValid = words.length === 12 && words.every((w) => w.trim().length > 0);
    if (isValid) {
      setAssets(INITIAL_ASSETS);
      setStakingPositions(INITIAL_STAKING_POSITIONS);
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
        assets: effectiveAssets,
        transactions,
        stakingPositions,
        activeChain,
        setActiveChain,
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
