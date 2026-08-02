import { CryptoAsset, NFTAsset, PortfolioHistoryPoint, Transaction, NetworkId } from '../types';

export class IndexerService {
  /**
   * Fetches all ERC20 tokens natively via Moralis API for a given EVM chain.
   */
  static async fetchAllTokens(walletAddress: string, chainId: string, apiKey: string): Promise<CryptoAsset[]> {
    if (!apiKey) return [];
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`https://deep-index.moralis.io/api/v2.2/${walletAddress}/erc20?chain=${chainId}`, {
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Moralis API returned ' + response.status);
      
      const data = await response.json();
      
      return data.map((token: any) => ({
        id: `${token.token_address}-${chainId}`,
        symbol: token.symbol,
        name: token.name,
        network: this.mapMoralisChainToNetwork(chainId),
        balance: parseInt(token.balance) / Math.pow(10, parseInt(token.decimals)),
        priceUsd: 0, // Would require another endpoint to fetch live pricing for obscure tokens
        change24h: 0,
        icon: (token.logo && !token.logo.includes('trustwallet')) ? token.logo : 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        contractAddress: token.token_address,
      }));
    } catch (e) {
      console.error(`Failed to fetch tokens for ${chainId}:`, e);
      return [];
    }
  }

  /**
   * Fetches native (ETH/BNB/MATIC/etc) balance for a wallet address on a specific chain.
   */
  static async fetchNativeBalance(walletAddress: string, chainId: string, apiKey: string): Promise<number> {
    if (!apiKey) return 0;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`https://deep-index.moralis.io/api/v2.2/${walletAddress}/balance?chain=${chainId}`, {
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) return 0;
      
      const data = await response.json();
      return parseInt(data.balance) / 1e18; // EVM natives have 18 decimals
    } catch (e) {
      console.error(`Failed to fetch native balance for ${chainId}:`, e);
      return 0;
    }
  }

  /**
   * Fetches all NFTs via Moralis API.
   */
  static async fetchAllNFTs(walletAddress: string, chainId: string, apiKey: string): Promise<NFTAsset[]> {
    if (!apiKey) return [];
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`https://deep-index.moralis.io/api/v2.2/${walletAddress}/nft?chain=${chainId}&format=decimal&disable_spam_filter=true`, {
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Moralis NFT API returned ' + response.status);
      
      const data = await response.json();
      
      return data.result.map((nft: any) => {
        let metadata = null;
        if (nft.metadata) {
          try {
            metadata = JSON.parse(nft.metadata);
          } catch (e) {}
        }
        
        let imageUrl = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=60';
        if (metadata?.image) {
          imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        return {
          id: `${nft.token_address}-${nft.token_id}`,
          name: metadata?.name || nft.name || `${nft.symbol} #${nft.token_id}`,
          collection: nft.name || 'Unknown Collection',
          image: imageUrl,
          tokenId: `#${nft.token_id.substring(0, 8)}`,
          network: this.mapMoralisChainToNetwork(chainId),
          floorPrice: 'N/A',
          estUsd: 'N/A',
          contract: `${nft.token_address.substring(0, 6)}...${nft.token_address.substring(38)}`,
          attributes: metadata?.attributes?.map((attr: any) => ({
            trait: attr.trait_type || 'Attribute',
            value: attr.value || 'N/A'
          })) || []
        };
      });
    } catch (e) {
      console.error(`Failed to fetch NFTs for ${chainId}:`, e);
      return [];
    }
  }

  static async fetchPortfolioHistory(walletAddress: string, apiKey: string): Promise<PortfolioHistoryPoint[]> {
    if (!apiKey) return [];
    
    // In a real implementation, you'd ping an API like Covalent `v1/{chain_id}/address/{address}/portfolio_v2/`
    // We return an empty array to ensure only real data is shown, avoiding demo data in production.
    return [];
  }

  /**
   * Fetches real on-chain transaction history for a given wallet address via Moralis.
   */
  static async fetchTransactionHistory(walletAddress: string, chainId: string, apiKey: string): Promise<Transaction[]> {
    if (!apiKey) return [];
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`https://deep-index.moralis.io/api/v2.2/${walletAddress}?chain=${chainId}&order=DESC&limit=10`, {
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Moralis Transaction API returned ' + response.status);
      
      const data = await response.json();
      
      return data.result.map((tx: any) => {
        const isReceive = tx.to_address?.toLowerCase() === walletAddress.toLowerCase();
        
        return {
          id: tx.hash,
          hash: tx.hash,
          type: isReceive ? 'receive' : 'send',
          network: this.mapMoralisChainToNetwork(chainId) as NetworkId,
          fromAsset: 'NATIVE', // Simplified; parsing all ERC20 transfers requires token-transfers endpoint
          fromAmount: parseInt(tx.value) / 1e18, // Assumes 18 decimals for EVM natives
          senderAddress: tx.from_address,
          recipientAddress: tx.to_address,
          gasFeeUsd: 0, // Would require price conversion for (gas_price * receipt_gas_used)
          timestamp: tx.block_timestamp,
          status: tx.receipt_status === '1' ? 'completed' : 'failed'
        };
      });
    } catch (e) {
      console.error(`Failed to fetch transactions for ${chainId}:`, e);
      return [];
    }
  }

  private static mapMoralisChainToNetwork(chainId: string): string {
    const map: Record<string, string> = {
      'eth': 'ethereum',
      '0x1': 'ethereum',
      'polygon': 'polygon',
      '0x89': 'polygon',
      'bsc': 'bsc',
      '0x38': 'bsc',
      'arbitrum': 'arbitrum',
      '0xa4b1': 'arbitrum',
      'avalanche': 'avalanche',
      '0xa86a': 'avalanche',
      'base': 'base',
      '0x2105': 'base'
    };
    return map[chainId] || 'ethereum';
  }
}
