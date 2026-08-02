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

    // Failover RPCs to ensure reliability
    const rpcUrls: string[] = [];
    switch (network) {
      case 'ethereum':
        rpcUrls.push('https://eth.llamarpc.com', 'https://cloudflare-eth.com');
        break;
      case 'polygon':
        rpcUrls.push('https://polygon-rpc.com', 'https://rpc-mainnet.maticvigil.com');
        break;
      case 'arbitrum':
        rpcUrls.push('https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum');
        break;
      case 'bsc':
        rpcUrls.push('https://bsc-dataseed.binance.org', 'https://bsc-dataseed1.defibit.io');
        break;
      case 'avalanche':
        rpcUrls.push('https://api.avax.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche');
        break;
      case 'base':
        rpcUrls.push('https://mainnet.base.org', 'https://developer-access-mainnet.base.org');
        break;
      default:
        rpcUrls.push('https://eth.llamarpc.com');
    }

    // Create FallbackProvider using ethers v6 FallbackProvider syntax
    const providers = rpcUrls.map(url => new JsonRpcProvider(url));
    const fallbackProvider = new FallbackProvider(providers);
    
    this.evmProviders.set(network, fallbackProvider);
    return fallbackProvider;
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

  static getSolanaConnection(): Connection {
    if (!this.solanaConnection) {
      // Setup failover connections or just a robust primary for Solana
      this.solanaConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    }
    return this.solanaConnection;
  }
}
