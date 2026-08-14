import { ethers } from 'ethers';
import { Connection, VersionedTransaction, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { ProviderService } from './ProviderService';

import { CryptoAsset } from '../types';

export interface SwapQuoteParams {
  fromAsset: CryptoAsset;
  toAsset: CryptoAsset;
  amount: number; // Human readable amount
  slippage: number; // Percentage e.g. 0.5
}

export interface SwapQuoteResult {
  estimatedToAmount: string; // In smallest unit
  priceImpact: number;
  gasFeeEstimated: number; // USD estimated
  routeParams: any; // Raw data needed for execution
}

export interface ExecuteSwapParams extends SwapQuoteParams {
  walletAddress: string;
  privateKey?: string; // Standard for our simplified demo wallet, used for Solana
  evmWallet?: ethers.Wallet; // Securely pass connected wallet for EVM
  quoteData: any; // The raw route data from quote
}

export class SwapService {
  // 1INCH API REQUIRES A KEY. Users must supply this in .env (VITE_1INCH_API_KEY)
  private static ONE_INCH_BASE_URL = 'https://api.1inch.dev/swap/v6.0';
  private static JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote';
  private static JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';

  /**
   * Fetches a swap quote from Jupiter (Solana) or 1inch (EVM).
   */
  public static async getQuote(params: SwapQuoteParams): Promise<SwapQuoteResult> {
    if (params.fromAsset.network === 'solana') {
      return this.getJupiterQuote(params);
    } else {
      return this.get1inchQuote(params);
    }
  }

  /**
   * Executes a swap on Jupiter (Solana) or 1inch (EVM).
   */
  public static async executeSwap(params: ExecuteSwapParams): Promise<string> {
    if (params.fromAsset.network === 'solana') {
      return this.executeJupiterSwap(params);
    } else {
      return this.execute1inchSwap(params);
    }
  }

  // ===================== HELPERS ===================== //

  private static resolveTokenAddress(networkId: string, address?: string, symbol?: string): string {
    if (networkId === 'solana') {
      if (!address || address === 'native' || symbol?.toUpperCase() === 'SOL') {
        return 'So11111111111111111111111111111111111111112';
      }
      return address;
    } else {
      if (!address || address === 'native' || symbol?.toUpperCase() === 'ETH' || symbol?.toUpperCase() === 'BNB' || symbol?.toUpperCase() === 'MATIC' || symbol?.toUpperCase() === 'AVAX') {
        return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
      }
      return address;
    }
  }

  // ===================== JUPITER (SOLANA) ===================== //

  private static async getJupiterQuote(params: SwapQuoteParams): Promise<SwapQuoteResult> {
    const fromAddress = this.resolveTokenAddress(params.fromAsset.network, params.fromAsset.contractAddress, params.fromAsset.symbol);
    const toAddress = this.resolveTokenAddress(params.toAsset.network, params.toAsset.contractAddress, params.toAsset.symbol);
    
    // Convert to lamports (6 decimals for SOL, varying for others, usually we'd need on-chain decimals but we assume 6 for SOL/USDC for demo)
    const amountLamports = Math.floor(params.amount * 10**6).toString();
    
    const url = `${this.JUPITER_QUOTE_API}?inputMint=${fromAddress}&outputMint=${toAddress}&amount=${amountLamports}&slippageBps=${params.slippage * 100}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Jupiter quote failed: ${await response.text()}`);
    }
    
    const data = await response.json();
    return {
      estimatedToAmount: (parseInt(data.outAmount) / 10**6).toString(),
      priceImpact: parseFloat(data.priceImpactPct || '0') * 100,
      gasFeeEstimated: 0.01,
      routeParams: data,
    };
  }

  private static async executeJupiterSwap(params: ExecuteSwapParams): Promise<string> {
    if (!params.privateKey) throw new Error("Private key required for signing transaction");

    // Get serialized transaction from Jupiter
    const swapReq = await fetch(this.JUPITER_SWAP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: params.quoteData,
        userPublicKey: params.walletAddress,
        wrapAndUnwrapSol: true,
      })
    });

    if (!swapReq.ok) {
      throw new Error(`Jupiter swap failed: ${await swapReq.text()}`);
    }

    const { swapTransaction } = await swapReq.json();
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const wallet = Keypair.fromSecretKey(bs58.decode(params.privateKey));
    
    transaction.sign([wallet]);
    const rawTransaction = transaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2
    });
    
    return txid;
  }

  // ===================== 1INCH (EVM) ===================== //

  private static getChainId(networkId: string): string {
    const map: Record<string, string> = {
      'ethereum': '1',
      'arbitrum': '42161',
      'polygon': '137',
      'bsc': '56',
      'avalanche': '43114',
      'base': '8453',
    };
    return map[networkId] || '1';
  }

  private static get1inchHeaders() {
    const apiKey = (import.meta as any).env.VITE_1INCH_API_KEY;
    if (!apiKey) {
      console.warn("Missing VITE_1INCH_API_KEY! 1inch calls will fail.");
    }
    return {
      'Authorization': `Bearer ${apiKey}`,
      'accept': 'application/json'
    };
  }

  private static async get1inchQuote(params: SwapQuoteParams): Promise<SwapQuoteResult> {
    const chainId = this.getChainId(params.fromAsset.network);
    const fromAddress = this.resolveTokenAddress(params.fromAsset.network, params.fromAsset.contractAddress, params.fromAsset.symbol);
    const toAddress = this.resolveTokenAddress(params.toAsset.network, params.toAsset.contractAddress, params.toAsset.symbol);
    
    // Standard EVM token decimal normalization (18 decimals)
    const amountWei = ethers.parseUnits(params.amount.toString(), 18).toString();
    
    const url = `${this.ONE_INCH_BASE_URL}/${chainId}/quote?src=${fromAddress}&dst=${toAddress}&amount=${amountWei}&slippage=${params.slippage}`;
    
    const response = await fetch(url, { headers: this.get1inchHeaders() });
    
    if (!response.ok) {
      throw new Error(`1inch quote failed: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      estimatedToAmount: ethers.formatUnits(data.toAmount, 18).toString(),
      priceImpact: 0,
      gasFeeEstimated: (parseInt(data.estimatedGas) * 1e-9), // Simplified dummy calc
      routeParams: data
    };
  }

  private static async execute1inchSwap(params: ExecuteSwapParams): Promise<string> {
    if (!params.evmWallet) throw new Error("EVM Wallet required");

    const chainId = this.getChainId(params.fromAsset.network);
    const wallet = params.evmWallet;

    const fromAddress = this.resolveTokenAddress(params.fromAsset.network, params.fromAsset.contractAddress, params.fromAsset.symbol);
    const toAddress = this.resolveTokenAddress(params.toAsset.network, params.toAsset.contractAddress, params.toAsset.symbol);
    const amountWei = ethers.parseUnits(params.amount.toString(), 18).toString();

    // 1. Get swap transaction payload
    const url = `${this.ONE_INCH_BASE_URL}/${chainId}/swap?src=${fromAddress}&dst=${toAddress}&amount=${amountWei}&from=${wallet.address}&slippage=${params.slippage}`;
    
    const response = await fetch(url, { headers: this.get1inchHeaders() });
    if (!response.ok) {
      throw new Error(`1inch swap failed: ${await response.text()}`);
    }
    
    const { tx } = await response.json();

    // 2. Send transaction
    const txResponse = await wallet.sendTransaction({
      to: tx.to,
      data: tx.data,
      value: tx.value,
      gasLimit: tx.gas,
    });

    return txResponse.hash;
  }
}
