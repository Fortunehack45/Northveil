import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';

const bip32 = BIP32Factory(ecc);

export class WalletService {
  /**
   * Generates a new 12-word seed phrase (mnemonic)
   */
  static generateSeedPhrase(): string[] {
    const wallet = ethers.Wallet.createRandom();
    return wallet.mnemonic!.phrase.split(' ');
  }

  /**
   * Validates a given seed phrase
   */
  static validateSeedPhrase(phrase: string[] | string): boolean {
    const mnemonic = Array.isArray(phrase) ? phrase.join(' ') : phrase;
    return bip39.validateMnemonic(mnemonic.trim());
  }

  /**
   * Derives an EVM address from a seed phrase and account index
   */
  static deriveEVMAddress(mnemonicWords: string[], accountIndex: number): { address: string, privateKey: string, path: string } {
    const mnemonic = mnemonicWords.join(' ');
    const path = `m/44'/60'/0'/0/${accountIndex}`;
    const wallet = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonic), path);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      path
    };
  }

  /**
   * Derives a Solana address from a seed phrase and account index
   */
  static deriveSolanaAddress(mnemonicWords: string[], accountIndex: number): { address: string, privateKey: string, path: string } {
    const mnemonic = mnemonicWords.join(' ');
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${accountIndex}'/0'`;
    
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    
    return {
      address: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey),
      path
    };
  }

  /**
   * Derives a Bitcoin address (Native SegWit / p2wpkh) from a seed phrase and account index
   */
  static deriveBitcoinAddress(mnemonicWords: string[], accountIndex: number): { address: string, privateKey: string, path: string } {
    const mnemonic = mnemonicWords.join(' ');
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
    
    // m/84'/0'/0'/0/accountIndex for Native Segwit
    const path = `m/84'/0'/0'/0/${accountIndex}`;
    const child = root.derivePath(path);
    
    const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: bitcoin.networks.bitcoin });
    
    return {
      address: address!,
      privateKey: child.toWIF(),
      path
    };
  }


  /**
   * Retrieves an ethers.Wallet instance connected to a provider
   * This is used securely in memory to sign transactions without exposing the private key to the UI.
   */
  static getEVMWallet(mnemonicWords: string[], accountIndex: number, provider: ethers.Provider): ethers.Wallet {
    const mnemonic = mnemonicWords.join(' ');
    const path = `m/44'/60'/0'/0/${accountIndex}`;
    return ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonic), path).connect(provider);
  }
}
