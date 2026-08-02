import { ethers } from 'ethers';
import { PublicKey } from '@solana/web3.js';
import { ProviderService } from './ProviderService';
import { BitcoinService } from './BitcoinService';
import { CryptoAsset } from '../types';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)'
];

export class TokenService {
  static async fetchLiveBalancesAndPrices(assets: CryptoAsset[], walletAddress: string, solanaAddress: string, bitcoinAddress?: string): Promise<CryptoAsset[]> {
    const updatedAssets: CryptoAsset[] = [];
    
    // Fetch prices from CoinGecko
    const cgIds = assets.map(a => this.getCoinGeckoId(a.symbol)).filter(id => id !== '').join(',');
    let prices: Record<string, { usd: number, usd_24h_change: number }> = {};
    try {
      if (cgIds) {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd&include_24hr_change=true`);
        prices = await response.json();
      }
    } catch (e) {
      console.error('Failed to fetch prices', e);
    }

    // Fetch balances
    for (const asset of assets) {
      let liveBalance = asset.balance; 
      
      try {
        if (asset.network === 'solana') {
          if (solanaAddress) {
            const conn = ProviderService.getSolanaConnection();
            const lamports = await conn.getBalance(new PublicKey(solanaAddress));
            liveBalance = lamports / 1e9;
          }
        } else if (asset.network === 'bitcoin') {
          if (bitcoinAddress) {
            liveBalance = await BitcoinService.fetchBalance(bitcoinAddress);
          } else {
            liveBalance = 0; 
          }
        } else {
          // EVM Chain
          if (walletAddress) {
            const provider = ProviderService.getEVMProvider(asset.network);
            const isNative = !asset.contractAddress || 
                             asset.contractAddress === '0x0000000000000000000000000000000000000000' || 
                             asset.contractAddress === '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
                             
            if (isNative) {
              const bal = await provider.getBalance(walletAddress);
              liveBalance = Number(ethers.formatEther(bal));
            } else {
              // ERC20
              const contract = new ethers.Contract(asset.contractAddress, ERC20_ABI, provider);
              const bal = await contract.balanceOf(walletAddress);
              const decimals = await contract.decimals();
              liveBalance = Number(ethers.formatUnits(bal, decimals));
            }
          }
        }
      } catch (e) {
        console.error(`Failed to fetch balance for ${asset.symbol} on ${asset.network}`, e);
        // keep old balance on fail
      }

      const cgId = this.getCoinGeckoId(asset.symbol);
      let priceUsd = prices[cgId]?.usd || asset.priceUsd;
      
      // Fallback to static known prices if CoinGecko fails and it's 0
      if (priceUsd === 0) {
        if (asset.symbol === 'ETH' || asset.symbol === 'WETH') priceUsd = 3450.20;
        else if (asset.symbol === 'BTC' || asset.symbol === 'WBTC') priceUsd = 65000.00;
        else if (asset.symbol === 'SOL') priceUsd = 182.40;
        else if (asset.symbol === 'BNB') priceUsd = 590.50;
        else if (asset.symbol === 'USDC' || asset.symbol === 'USDT' || asset.symbol === 'DAI') priceUsd = 1.00;
        else if (asset.symbol === 'ARB') priceUsd = 1.15;
        else if (asset.symbol === 'POL' || asset.symbol === 'MATIC') priceUsd = 0.75;
        else if (asset.symbol === 'AVAX') priceUsd = 35.20;
        else if (asset.symbol === 'LINK') priceUsd = 14.50;
        else if (asset.symbol === 'UNI') priceUsd = 7.80;
      }
      
      const change24h = prices[cgId]?.usd_24h_change || asset.change24h;

      updatedAssets.push({
        ...asset,
        balance: liveBalance,
        priceUsd: priceUsd,
        change24h: change24h
      });
    }

    return updatedAssets;
  }

  private static getCoinGeckoId(symbol: string): string {
    const map: Record<string, string> = {
      'ETH': 'ethereum',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'DAI': 'dai',
      'WETH': 'weth',
      'WBTC': 'wrapped-bitcoin',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'PEPE': 'pepe',
      'SHIB': 'shiba-inu',
      'SOL': 'solana',
      'BTC': 'bitcoin',
      'ARB': 'arbitrum',
      'POL': 'matic-network',
      'BNB': 'binancecoin',
      'AVAX': 'avalanche-2'
    };
    return map[symbol.toUpperCase()] || '';
  }

  /**
   * Resolves a custom ERC-20 token from a contract address on a given network.
   * Queries the blockchain directly for name(), symbol(), decimals(), and balanceOf().
   */
  static async resolveCustomToken(
    contractAddress: string, 
    networkId: string, 
    walletAddress: string
  ): Promise<CryptoAsset | null> {
    try {
      const provider = ProviderService.getEVMProvider(networkId);
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);

      // Fetch on-chain metadata in parallel
      const [name, symbol, decimals, balanceRaw] = await Promise.all([
        contract.name().catch(() => 'Unknown Token'),
        contract.symbol().catch(() => '???'),
        contract.decimals().catch(() => 18),
        walletAddress ? contract.balanceOf(walletAddress).catch(() => BigInt(0)) : Promise.resolve(BigInt(0)),
      ]);

      const balance = Number(ethers.formatUnits(balanceRaw, decimals));

      // Try to get a price from CoinGecko by contract address
      let priceUsd = 0;
      let change24h = 0;
      try {
        const platformMap: Record<string, string> = {
          'ethereum': 'ethereum', 'polygon': 'polygon-pos', 'arbitrum': 'arbitrum-one',
          'bsc': 'binance-smart-chain', 'avalanche': 'avalanche', 'base': 'base',
        };
        const platform = platformMap[networkId];
        if (platform) {
          const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd&include_24hr_change=true`
          );
          const data = await res.json();
          const tokenData = data[contractAddress.toLowerCase()];
          if (tokenData) {
            priceUsd = tokenData.usd || 0;
            change24h = tokenData.usd_24h_change || 0;
          }
        }
      } catch (e) {
        console.warn('Could not fetch price for custom token', e);
      }

      const asset: CryptoAsset = {
        id: `custom-${networkId}-${contractAddress.toLowerCase().slice(0, 10)}-${Date.now()}`,
        symbol: symbol,
        name: name,
        network: networkId,
        balance,
        priceUsd,
        change24h,
        icon: '', // No icon for custom tokens initially
        contractAddress: contractAddress,
        isCustom: true,
        isFavorite: false,
      };

      return asset;
    } catch (e) {
      console.error('Failed to resolve custom token:', e);
      return null;
    }
  }
  private static marketDataCache = new Map<string, { data: any, timestamp: number }>();

  static async fetchTokenMarketData(symbol: string, contractAddress?: string, platformId?: string, days: string = '7') {
    const cacheKey = `${symbol}-${days}`;
    const cached = this.marketDataCache.get(cacheKey);
    // Cache for 2 minutes to prevent rapid clicking from triggering 429 rate limit
    if (cached && Date.now() - cached.timestamp < 120000) {
      return cached.data;
    }

    try {
      const cgId = this.getCoinGeckoId(symbol);
      let endpoint = '';
      
      if (cgId) {
        endpoint = `https://api.coingecko.com/api/v3/coins/${cgId}`;
      } else if (contractAddress && platformId) {
        const platformMap: Record<string, string> = {
          'ethereum': 'ethereum', 'polygon': 'polygon-pos', 'arbitrum': 'arbitrum-one',
          'bsc': 'binance-smart-chain', 'avalanche': 'avalanche', 'base': 'base',
        };
        const p = platformMap[platformId];
        if (p) {
          endpoint = `https://api.coingecko.com/api/v3/coins/${p}/contract/${contractAddress.toLowerCase()}`;
        }
      }

      if (!endpoint) return null;

      // Fetch both coin details (for market cap, volume, bio) and chart data in parallel
      const [detailsRes, chartRes] = await Promise.all([
        fetch(endpoint),
        fetch(cgId 
          ? `https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=${days}` 
          : `${endpoint}/market_chart?vs_currency=usd&days=${days}`)
      ]);

      const details = await detailsRes.json();
      const chart = await chartRes.json();

      const result = {
        currentPrice: details?.market_data?.current_price?.usd,
        priceChange24h: details?.market_data?.price_change_percentage_24h,
        marketCap: details?.market_data?.market_cap?.usd,
        volume24h: details?.market_data?.total_volume?.usd,
        circulatingSupply: details?.market_data?.circulating_supply,
        ath: details?.market_data?.ath?.usd,
        description: details?.description?.en,
        icon: details?.image?.large || details?.image?.small,
        prices: chart?.prices || [] // [timestamp, price][]
      };

      // Special Binance Fallback for TRUE "ALL" time historical data
      if (days === 'max' && ['ETH', 'BTC', 'SOL', 'BNB', 'AVAX', 'ARB'].includes(symbol.toUpperCase())) {
        try {
          const binanceSymbol = `${symbol.toUpperCase()}USDT`;
          const klineRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1w&limit=1000`);
          if (klineRes.ok) {
            const klines = await klineRes.json();
            if (klines && klines.length > 0) {
              result.prices = klines.map((k: any) => [k[0], parseFloat(k[4])]); // Map to [timestamp, closePrice]
            }
          }
        } catch (e) {
          console.warn('Failed to fetch ALL time from Binance:', e);
        }
      }

      // Only cache if we actually got valid data (prevent caching error states)
      if (result.prices.length > 0) {
        this.marketDataCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      return result;
    } catch (e) {
      console.warn('Failed to fetch market data:', e);
      return null;
    }
  }
}
