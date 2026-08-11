import { CryptoAsset, NFTAsset, PortfolioHistoryPoint, Transaction, NetworkId } from '../types';
import { ProviderService } from './ProviderService';
import { ethers } from 'ethers';

export class IndexerService {
  /**
   * Fetches all ERC20 tokens natively via Moralis API or Blockscout fallback for a given EVM chain.
   */
  static async fetchAllTokens(walletAddress: string, chainId: string, apiKey: string): Promise<CryptoAsset[]> {
    if (apiKey) {
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
        
        if (response.ok) {
          const data = await response.json();
          return data.map((token: any) => ({
            id: `${token.token_address}-${chainId}`,
            symbol: token.symbol,
            name: token.name,
            network: this.mapMoralisChainToNetwork(chainId),
            balance: parseInt(token.balance) / Math.pow(10, parseInt(token.decimals)),
            priceUsd: 0,
            change24h: 0,
            icon: (token.logo && !token.logo.includes('trustwallet')) ? token.logo : 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
            contractAddress: token.token_address,
          }));
        }
      } catch (e) {
        console.error(`Moralis fetchAllTokens failed for ${chainId}:`, e);
      }
    }

    // Zero-Key Blockscout v2 Fallback
    try {
      const domainMap: Record<string, string> = {
        eth: 'eth.blockscout.com',
        ethereum: 'eth.blockscout.com',
        sepolia: 'eth-sepolia.blockscout.com',
        polygon: 'polygon.blockscout.com',
        arbitrum: 'arbitrum.blockscout.com',
        base: 'base.blockscout.com',
        optimism: 'optimism.blockscout.com',
      };
      const domain = domainMap[chainId];
      if (domain) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(`https://${domain}/api/v2/addresses/${walletAddress}/token-balances`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            return data.map((item: any) => {
              const decimals = Number(item.token?.decimals || 18);
              const rawBal = Number(item.value || 0);
              return {
                id: `${item.token?.address}-${chainId}`,
                symbol: item.token?.symbol || 'TOKEN',
                name: item.token?.name || item.token?.symbol || 'Token',
                network: this.mapMoralisChainToNetwork(chainId),
                balance: rawBal / Math.pow(10, decimals),
                priceUsd: 0,
                change24h: 0,
                icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
                contractAddress: item.token?.address,
              };
            });
          }
        }
      }
    } catch (e) {
      console.warn(`Blockscout token fetch failed for ${chainId}:`, e);
    }

    return [];
  }

  /**
   * Fetches native (ETH/BNB/MATIC/etc) balance for a wallet address on a specific chain.
   */
  static async fetchNativeBalance(walletAddress: string, chainId: string, apiKey: string): Promise<number> {
    if (apiKey) {
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
        
        if (response.ok) {
          const data = await response.json();
          return parseInt(data.balance) / 1e18; // EVM natives have 18 decimals
        }
      } catch (e) {
        console.error(`Moralis fetchNativeBalance failed for ${chainId}:`, e);
      }
    }

    // Direct EVM RPC Provider Fallback for Native Balance (Works 100% Zero Key!)
    try {
      const network = this.mapMoralisChainToNetwork(chainId);
      const provider = ProviderService.getEVMProvider(network);
      const bal = await provider.getBalance(walletAddress);
      return Number(ethers.formatEther(bal));
    } catch (e) {
      console.warn(`Direct RPC native balance fallback failed for ${chainId}:`, e);
    }

    return 0;
  }

  /**
   * Fetches all NFTs via Moralis API or free public Blockscout API fallback.
   */
  static async fetchAllNFTs(walletAddress: string, chainId: string, apiKey: string): Promise<NFTAsset[]> {
    if (apiKey) {
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
        
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.result) && data.result.length > 0) {
            return data.result.map((nft: any) => {
              let metadata = null;
              if (nft.metadata) {
                try {
                  metadata = typeof nft.metadata === 'string' ? JSON.parse(nft.metadata) : nft.metadata;
                } catch (e) {}
              }
              
              let imageUrl = metadata?.image || nft.token_uri || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=60';
              if (typeof imageUrl === 'string' && imageUrl.startsWith('ipfs://')) {
                imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
              }

              return {
                id: `${nft.token_address}-${nft.token_id}`,
                name: metadata?.name || nft.name || `${nft.symbol || 'NFT'} #${nft.token_id}`,
                collection: nft.name || 'NFT Collection',
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
          }
        }
      } catch (e) {
        console.warn(`Moralis NFT fetch failed for ${chainId}:`, e);
      }
    }

    // Zero-Key Blockscout v2 NFT Fallback
    try {
      const network = this.mapMoralisChainToNetwork(chainId);
      let domain = 'eth.blockscout.com';
      if (network === 'base') domain = 'base.blockscout.com';
      else if (network === 'polygon') domain = 'polygon.blockscout.com';
      else if (network === 'arbitrum') domain = 'arbitrum.blockscout.com';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(`https://${domain}/api/v2/addresses/${walletAddress}/nft?type=ERC-721%2CERC-1155`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.items)) {
          return data.items.map((item: any) => {
            const nftToken = item.token || {};
            const metadata = item.metadata || nftToken.metadata || {};
            let imageUrl = metadata?.image || item.image_url || nftToken.icon_url || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=60';
            if (typeof imageUrl === 'string' && imageUrl.startsWith('ipfs://')) {
              imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }

            return {
              id: `${nftToken.address || 'nft'}-${item.id || Math.random()}`,
              name: metadata?.name || item.name || `${nftToken.name || 'NFT'} #${item.id || '1'}`,
              collection: nftToken.name || 'NFT Collection',
              image: imageUrl,
              tokenId: `#${String(item.id || '1').substring(0, 8)}`,
              network,
              floorPrice: 'N/A',
              estUsd: 'N/A',
              contract: nftToken.address ? `${nftToken.address.substring(0, 6)}...${nftToken.address.substring(38)}` : 'N/A',
              attributes: metadata?.attributes?.map((attr: any) => ({
                trait: attr.trait_type || 'Attribute',
                value: attr.value || 'N/A'
              })) || []
            };
          });
        }
      }
    } catch (e) {
      console.warn(`Blockscout NFT fallback failed for ${chainId}:`, e);
    }

    return [];
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
    const results: Transaction[] = [];
    const networkId = this.mapMoralisChainToNetwork(chainId) as NetworkId;
    const nativeSymbol = chainId === 'bsc' ? 'BNB' : chainId === 'polygon' ? 'POL' : 'ETH';

    // 1. Try Moralis if API key is present
    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        // Fetch Native & Contract Transactions
        const response = await fetch(`https://deep-index.moralis.io/api/v2.2/${walletAddress}?chain=${chainId}&order=DESC&limit=15`, {
          headers: { 'accept': 'application/json', 'X-API-Key': apiKey },
          signal: controller.signal
        });

        // Fetch ERC20 Token Transfers
        const erc20Response = await fetch(`https://deep-index.moralis.io/api/v2.2/${walletAddress}/erc20/transfers?chain=${chainId}&limit=15`, {
          headers: { 'accept': 'application/json', 'X-API-Key': apiKey },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const rawList = Array.isArray(data) ? data : (data?.result || []);
          rawList.forEach((tx: any) => {
            const val = parseFloat(tx.value || '0') / 1e18;
            const isReceive = tx.to_address?.toLowerCase() === walletAddress.toLowerCase();
            const method = (tx.decoded_call?.label || tx.method_name || '').toLowerCase();
            const isSwap = method.includes('swap') || method.includes('execute') || method.includes('trade');

            const gasUsed = parseFloat(tx.receipt_gas_used || '21000');
            const gasPriceGwei = parseFloat(tx.gas_price || '20000000000') / 1e9;
            const estimatedGasUsd = (gasUsed * gasPriceGwei * 0.000003);

            results.push({
              id: tx.hash,
              hash: tx.hash,
              type: isSwap ? 'swap' : (isReceive ? 'receive' : 'send'),
              network: networkId,
              fromAsset: nativeSymbol,
              fromAmount: Number(val.toFixed(6)),
              senderAddress: tx.from_address,
              recipientAddress: tx.to_address,
              gasFeeUsd: Number(estimatedGasUsd.toFixed(2)) || 0.45,
              timestamp: tx.block_timestamp,
              status: tx.receipt_status === '1' || tx.receipt_status === 1 ? 'completed' : 'failed'
            });
          });
        }

        if (erc20Response.ok) {
          const erc20Data = await erc20Response.json();
          const erc20List = erc20Data.result || [];
          erc20List.forEach((tx: any) => {
            const isReceive = tx.to_address?.toLowerCase() === walletAddress.toLowerCase();
            const symbol = tx.token_symbol || 'TOKEN';
            const decimals = parseInt(tx.token_decimals || '18', 10);
            const amount = tx.value_decimal ? parseFloat(tx.value_decimal) : (parseFloat(tx.value || '0') / Math.pow(10, decimals));

            const existingIdx = results.findIndex(r => r.hash === tx.transaction_hash);
            if (existingIdx >= 0) {
              results[existingIdx].fromAsset = symbol;
              results[existingIdx].fromAmount = Number(amount.toFixed(6));
              results[existingIdx].type = isReceive ? 'receive' : 'send';
            } else {
              results.push({
                id: `${tx.transaction_hash}-${tx.log_index || Math.random()}`,
                hash: tx.transaction_hash,
                type: isReceive ? 'receive' : 'send',
                network: networkId,
                fromAsset: symbol,
                fromAmount: Number(amount.toFixed(6)),
                senderAddress: tx.from_address,
                recipientAddress: tx.to_address,
                gasFeeUsd: 0.45,
                timestamp: tx.block_timestamp,
                status: 'completed'
              });
            }
          });
        }

        if (results.length > 0) return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } catch (e) {
        console.warn(`Moralis transaction fetch failed for ${chainId}, using Blockscout fallback`);
      }
    }

    // 2. Fallback to free public Blockscout API
    return this.fetchBlockscoutTxs(walletAddress, chainId);
  }

  private static async fetchBlockscoutTxs(walletAddress: string, chainId: string): Promise<Transaction[]> {
    const results: Transaction[] = [];
    const network = this.mapMoralisChainToNetwork(chainId) as NetworkId;
    let domain = 'eth.blockscout.com';
    if (network === 'base') domain = 'base.blockscout.com';
    else if (network === 'polygon') domain = 'polygon.blockscout.com';
    else if (network === 'arbitrum') domain = 'arbitrum.blockscout.com';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Fetch Native & Contract Transactions
      const response = await fetch(`https://${domain}/api/v2/addresses/${walletAddress}/transactions`, {
        headers: { 'accept': 'application/json' },
        signal: controller.signal
      });

      // Fetch Token Transfers
      const tokenResp = await fetch(`https://${domain}/api/v2/addresses/${walletAddress}/token-transfers`, {
        headers: { 'accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          const nativeSymbol = chainId === 'bsc' ? 'BNB' : chainId === 'polygon' ? 'POL' : 'ETH';
          data.items.slice(0, 15).forEach((item: any) => {
            const rawValue = parseFloat(item.value || '0') / 1e18;
            const isReceive = item.to?.hash?.toLowerCase() === walletAddress.toLowerCase();
            const method = (item.method || item.decoded_input?.method_call || '').toLowerCase();
            const isSwap = method.includes('swap') || method.includes('execute') || method.includes('trade');
            const feeUsd = item.fee?.value ? (parseFloat(item.fee.value) / 1e18) * 3450 : 0.45;

            results.push({
              id: item.hash,
              hash: item.hash,
              type: isSwap ? 'swap' : (isReceive ? 'receive' : 'send'),
              network,
              fromAsset: nativeSymbol,
              fromAmount: Number(rawValue.toFixed(6)),
              senderAddress: item.from?.hash || walletAddress,
              recipientAddress: item.to?.hash || walletAddress,
              gasFeeUsd: Number(feeUsd.toFixed(2)) || 0.45,
              timestamp: item.timestamp || new Date().toISOString(),
              status: item.status === 'ok' ? 'completed' : 'failed'
            });
          });
        }
      }

      if (tokenResp.ok) {
        const tokenData = await tokenResp.json();
        if (tokenData.items && Array.isArray(tokenData.items)) {
          tokenData.items.slice(0, 15).forEach((item: any) => {
            const txHash = item.tx_hash || item.hash;
            const isReceive = item.to?.hash?.toLowerCase() === walletAddress.toLowerCase();
            const symbol = item.token?.symbol || 'TOKEN';
            const decimals = parseInt(item.token?.decimals || '18', 10);
            const rawVal = parseFloat(item.total?.value || item.value || '0') / Math.pow(10, decimals);

            const existingIdx = results.findIndex(r => r.hash === txHash);
            if (existingIdx >= 0) {
              results[existingIdx].fromAsset = symbol;
              results[existingIdx].fromAmount = Number(rawVal.toFixed(6));
              results[existingIdx].type = isReceive ? 'receive' : 'send';
            } else {
              results.push({
                id: txHash || `token-${Math.random()}`,
                hash: txHash,
                type: isReceive ? 'receive' : 'send',
                network,
                fromAsset: symbol,
                fromAmount: Number(rawVal.toFixed(6)),
                senderAddress: item.from?.hash || walletAddress,
                recipientAddress: item.to?.hash || walletAddress,
                gasFeeUsd: 0.35,
                timestamp: item.timestamp || new Date().toISOString(),
                status: 'completed'
              });
            }
          });
        }
      }

      return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
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
      '0x2105': 'base',
      'sepolia': 'sepolia',
      '0xaa36a7': 'sepolia'
    };
    return map[chainId] || 'ethereum';
  }
}
