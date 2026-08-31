import { ethers, FallbackProvider, JsonRpcProvider, WebSocketProvider } from 'ethers';
import { Connection } from '@solana/web3.js';

export class ProviderService {
  private static evmProviders: Map<string, ethers.AbstractProvider> = new Map();
  private static wsProviders: Map<string, WebSocketProvider> = new Map();
  private static solanaConnection: Connection | null = null;

  static getEVMProvider(network: string, customRpcUrl?: string): ethers.AbstractProvider {
    if (this.evmProviders.has(network)) {
      return this.evmProviders.get(network)!;
    }

    if (customRpcUrl) {
      const provider = new JsonRpcProvider(customRpcUrl);
      this.evmProviders.set(network, provider);
      return provider;
    }

    // Failover RPCs to ensure reliability (100% free open public nodes without API key blocks)
    const rpcUrls = ProviderService.getRpcUrls(network);

    // Use primary high-reliability RPC provider with staticNetwork optimization
    const primaryUrl = rpcUrls[0] || 'https://ethereum-rpc.publicnode.com';
    const cacheKey = `${network}_${primaryUrl}`;

    if (!this.evmProviders.has(cacheKey)) {
      this.evmProviders.set(cacheKey, new JsonRpcProvider(primaryUrl, undefined, { staticNetwork: true }));
    }
    return this.evmProviders.get(cacheKey)!;
  }

  static getRpcUrls(network: string): string[] {
    switch (network) {
      case 'ethereum':
        return ['https://ethereum-rpc.publicnode.com', 'https://1rpc.io/eth', 'https://rpc.payload.de', 'https://eth.drpc.org'];
      case 'sepolia':
        return [
          'https://ethereum-sepolia-rpc.publicnode.com',
          'https://1rpc.io/sepolia',
          'https://gateway.tenderly.co/public/sepolia',
          'https://eth-sepolia.public.blastapi.io',
        ];
      case 'polygon':
        return ['https://polygon-bor-rpc.publicnode.com', 'https://1rpc.io/matic', 'https://polygon.drpc.org'];
      case 'polygon_amoy':
        return ['https://polygon-amoy-bor-rpc.publicnode.com', 'https://1rpc.io/amoy', 'https://rpc-amoy.polygon.technology'];
      case 'arbitrum':
        return ['https://arb1.arbitrum.io/rpc', 'https://arbitrum-one-rpc.publicnode.com', 'https://1rpc.io/arb'];
      case 'arbitrum_sepolia':
        return ['https://sepolia-rollup.arbitrum.io/rpc', 'https://arbitrum-sepolia-rpc.publicnode.com'];
      case 'bsc':
        return ['https://bsc-dataseed1.defibit.io', 'https://bsc-rpc.publicnode.com', 'https://1rpc.io/bnb'];
      case 'bsc_testnet':
        return ['https://bsc-testnet-rpc.publicnode.com', 'https://data-seed-prebsc-1-s1.binance.org:8545/'];
      case 'avalanche':
        return ['https://api.avax.network/ext/bc/C/rpc', 'https://avalanche-c-chain-rpc.publicnode.com', 'https://1rpc.io/avax/c'];
      case 'base':
        return ['https://mainnet.base.org', 'https://1rpc.io/base', 'https://base-rpc.publicnode.com'];
      case 'base_sepolia':
        return ['https://sepolia.base.org', 'https://base-sepolia-rpc.publicnode.com'];
      case 'abstract':
        return ['https://api.mainnet.abs.xyz', 'https://abstract.rpc.subquery.network/public'];
      case 'apechain':
        return ['https://apechain.calderachain.xyz/http'];
      case 'berachain':
        return ['https://rpc.berachain.com'];
      case 'celo':
        return ['https://forno.celo.org', 'https://celo-rpc.publicnode.com', 'https://1rpc.io/celo'];
      case 'linea':
        return ['https://rpc.linea.build', 'https://linea-rpc.publicnode.com'];
      case 'mantle':
        return ['https://rpc.mantle.xyz', 'https://mantle-rpc.publicnode.com'];
      case 'optimism':
        return ['https://mainnet.optimism.io', 'https://optimism-rpc.publicnode.com', 'https://1rpc.io/op'];
      case 'scroll':
        return ['https://rpc.scroll.io', 'https://scroll-rpc.publicnode.com'];
      case 'sei':
        return ['https://evm-rpc.sei-apis.com'];
      case 'sonic':
        return ['https://rpc.soniclabs.com', 'https://sonic-rpc.publicnode.com'];
      case 'zksync':
        return ['https://mainnet.era.zksync.io', 'https://zksync-era-rpc.publicnode.com'];
      case 'zora':
        return ['https://rpc.zora.energy'];
      case 'opbnb':
        return ['https://opbnb-mainnet-rpc.bnbchain.org'];
      case 'blast':
        return ['https://rpc.blast.io', 'https://blast-rpc.publicnode.com'];
      case 'gnosis':
        return ['https://rpc.gnosischain.com', 'https://gnosis-rpc.publicnode.com'];
      case 'cronos':
        return ['https://evm.cronos.org'];
      case 'kava':
        return ['https://evm.kava.io'];
      case 'moonbeam':
        return ['https://rpc.api.moonbeam.network'];
      case 'moonriver':
        return ['https://rpc.api.moonriver.moonbeam.network'];
      case 'metis':
        return ['https://andromeda.metis.io/?owner=1088'];
      case 'core':
        return ['https://rpc.coredao.org'];
      case 'taiko':
        return ['https://rpc.mainnet.taiko.xyz'];
      case 'mode':
        return ['https://mainnet.mode.network'];
      case 'worldchain':
        return ['https://worldchain-mainnet.g.alchemy.com/public'];
      case 'arbitrum_nova':
        return ['https://nova.arbitrum.io/rpc'];
      case 'polygon_zkevm':
        return ['https://zkevm-rpc.com'];
      case 'aurora':
        return ['https://mainnet.aurora.dev'];
      case 'telos':
        return ['https://mainnet.telos.net/evm'];
      case 'flare':
        return ['https://flare-api.flare.network/ext/C/rpc'];
      default:
        return ['https://ethereum-rpc.publicnode.com', 'https://1rpc.io/eth'];
    }
  }

  /**
   * Executes an async operation with automatic RPC failover across candidate RPC endpoints.
   */
  static async executeWithFailover<T>(network: string, operation: (provider: ethers.JsonRpcProvider) => Promise<T>): Promise<T> {
    const urls = this.getRpcUrls(network);
    let lastError: any = null;

    for (const url of urls) {
      try {
        const provider = new JsonRpcProvider(url, undefined, { staticNetwork: true });
        return await operation(provider);
      } catch (err: any) {
        lastError = err;
        console.warn(`[RPC Failover] RPC ${url} returned error for ${network}, trying next...`, err.message || err);
      }
    }

    throw lastError || new Error(`All RPC endpoints failed for network ${network}`);
  }

  static getEVMWebSocketProvider(network: string): WebSocketProvider | null {
    if (this.wsProviders.has(network)) {
      return this.wsProviders.get(network)!;
    }

    let wsUrl = '';
    switch (network) {
      case 'ethereum':
        wsUrl = 'wss://eth.llamarpc.com';
        break;
      case 'polygon':
        wsUrl = 'wss://polygon-bor-rpc.publicnode.com';
        break;
      case 'arbitrum':
        wsUrl = 'wss://arbitrum-one-rpc.publicnode.com';
        break;
      // WSS for other networks can be added here
    }

    if (!wsUrl) return null;

    try {
      const wsProvider = new WebSocketProvider(wsUrl);
      this.wsProviders.set(network, wsProvider);
      return wsProvider;
    } catch (e) {
      console.warn(`Failed to connect to WebSocket for ${network}:`, e);
      return null;
    }
  }

  static getSolanaConnection(networkType?: string): Connection {
    const url = networkType === 'devnet' 
      ? 'https://api.devnet.solana.com' 
      : (process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
      
    if (!this.solanaConnection || networkType === 'devnet') {
      return new Connection(url, 'confirmed');
    }
    return this.solanaConnection;
  }
}
