import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';

const bip32 = BIP32Factory(ecc);

export interface EncryptedVault {
  ciphertext: string;
  salt: string;
  iv: string;
  version: number;
}

export class WalletService {
  /**
   * Generates a new 12-word or 24-word seed phrase (mnemonic)
   */
  static generateSeedPhrase(wordCount: 12 | 24 = 12): string[] {
    const strength = wordCount === 24 ? 256 : 128;
    const mnemonic = bip39.generateMnemonic(strength);
    return mnemonic.split(' ');
  }

  /**
   * Validates a given seed phrase (supports 12, 15, 18, 21, 24 words)
   */
  static validateSeedPhrase(phrase: string[] | string): boolean {
    const mnemonic = Array.isArray(phrase) ? phrase.join(' ') : phrase;
    const words = mnemonic.trim().split(/\s+/);
    if (![12, 15, 18, 21, 24].includes(words.length)) {
      return false;
    }
    return bip39.validateMnemonic(mnemonic.trim());
  }

  /**
   * Validates private key format per chain
   */
  static validatePrivateKey(key: string, chain: 'ethereum' | 'solana' | 'bitcoin'): { valid: boolean; message?: string } {
    const cleanKey = key.trim();
    if (!cleanKey) return { valid: false, message: 'Private key cannot be empty' };

    if (chain === 'ethereum') {
      const formatted = cleanKey.startsWith('0x') ? cleanKey : `0x${cleanKey}`;
      const valid = ethers.isHexString(formatted, 32);
      return {
        valid,
        message: valid ? undefined : 'EVM private key must be a 64-character hex string (0x...)',
      };
    }

    if (chain === 'solana') {
      try {
        const decoded = bs58.decode(cleanKey);
        const valid = decoded.length === 64 || decoded.length === 32;
        return {
          valid,
          message: valid ? undefined : 'Solana private key must be base58 encoded 64-byte keypair',
        };
      } catch (e) {
        return { valid: false, message: 'Invalid base58 Solana private key format' };
      }
    }

    if (chain === 'bitcoin') {
      try {
        const root = bip32.fromBase58(cleanKey, bitcoin.networks.bitcoin);
        return { valid: true };
      } catch (e) {
        try {
          // Validate Bitcoin WIF format length
          return { valid: cleanKey.length >= 50 };
        } catch (err) {
          return { valid: cleanKey.length >= 50, message: 'Invalid Bitcoin WIF key format' };
        }
      }
    }

    return { valid: false, message: 'Unsupported chain for private key import' };
  }

  /**
   * Derives an EVM address from a seed phrase and account index (supports optional 25th word passphrase)
   */
  static deriveEVMAddress(mnemonicWords: string[], accountIndex: number = 0, passphrase?: string): { address: string; privateKey: string; path: string } {
    if (mnemonicWords.length === 1 && (mnemonicWords[0].startsWith('0x') || mnemonicWords[0].length === 64)) {
      const clean = mnemonicWords[0].startsWith('0x') ? mnemonicWords[0] : `0x${mnemonicWords[0]}`;
      if (accountIndex === 0) {
        const wallet = new ethers.Wallet(clean);
        return {
          address: wallet.address,
          privateKey: wallet.privateKey,
          path: 'imported_private_key',
        };
      }
      // For derived sub-accounts from single private key, generate deterministic sub-key
      const subKey = ethers.keccak256(ethers.toUtf8Bytes(`${clean}_subaccount_${accountIndex}`));
      const subWallet = new ethers.Wallet(subKey);
      return {
        address: subWallet.address,
        privateKey: subWallet.privateKey,
        path: `custom/sub/${accountIndex}`,
      };
    }
    const mnemonic = mnemonicWords.join(' ');
    const path = `m/44'/60'/0'/0/${accountIndex}`;
    const wallet = ethers.HDNodeWallet.fromMnemonic(
      ethers.Mnemonic.fromPhrase(mnemonic, passphrase),
      path
    );
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      path,
    };
  }

  /**
   * Derives a Solana address from a seed phrase and account index
   */
  static deriveSolanaAddress(mnemonicWords: string[], accountIndex: number = 0, passphrase?: string): { address: string; privateKey: string; path: string } {
    if (mnemonicWords.length === 1) {
      return { address: '', privateKey: '', path: '' };
    }
    const mnemonic = mnemonicWords.join(' ');
    const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
    const path = `m/44'/501'/${accountIndex}'/0'`;
    
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    
    return {
      address: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey),
      path,
    };
  }

  /**
   * Derives a Bitcoin address (Native SegWit / p2wpkh) from a seed phrase and account index
   */
  static deriveBitcoinAddress(mnemonicWords: string[], accountIndex: number = 0, passphrase?: string): { address: string; privateKey: string; path: string } {
    if (mnemonicWords.length === 1) {
      return { address: '', privateKey: '', path: '' };
    }
    const mnemonic = mnemonicWords.join(' ');
    const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
    const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
    
    const path = `m/84'/0'/0'/0/${accountIndex}`;
    const child = root.derivePath(path);
    
    const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: bitcoin.networks.bitcoin });
    
    return {
      address: address!,
      privateKey: child.toWIF(),
      path,
    };
  }

  /**
   * Cryptographically signs an EIP-191 message using the derived EVM wallet
   */
  static async signMessage(mnemonicWords: string[], accountIndex: number, message: string, passphrase?: string): Promise<string> {
    if (mnemonicWords.length === 1 && (mnemonicWords[0].startsWith('0x') || mnemonicWords[0].length === 64)) {
      const clean = mnemonicWords[0].startsWith('0x') ? mnemonicWords[0] : `0x${mnemonicWords[0]}`;
      const wallet = new ethers.Wallet(clean);
      return wallet.signMessage(message);
    }
    const mnemonic = mnemonicWords.join(' ');
    const path = `m/44'/60'/0'/0/${accountIndex}`;
    const hdNode = ethers.HDNodeWallet.fromMnemonic(
      ethers.Mnemonic.fromPhrase(mnemonic, passphrase),
      path
    );
    const wallet = new ethers.Wallet(hdNode.privateKey);
    return wallet.signMessage(message);
  }

  /**
   * Retrieves an ethers.Wallet instance connected to a provider securely in memory
   */
  static getEVMWallet(mnemonicWords: string[], accountIndex: number, provider: ethers.Provider, passphrase?: string): ethers.Wallet {
    if (mnemonicWords.length === 1 && (mnemonicWords[0].startsWith('0x') || mnemonicWords[0].length === 64)) {
      const clean = mnemonicWords[0].startsWith('0x') ? mnemonicWords[0] : `0x${mnemonicWords[0]}`;
      return new ethers.Wallet(clean, provider);
    }
    const mnemonic = mnemonicWords.join(' ');
    const path = `m/44'/60'/0'/0/${accountIndex}`;
    const hdNode = ethers.HDNodeWallet.fromMnemonic(
      ethers.Mnemonic.fromPhrase(mnemonic, passphrase),
      path
    );
    return new ethers.Wallet(hdNode.privateKey, provider);
  }

  /**
   * AES-256-GCM Vault Encryption at rest via PBKDF2 Web Crypto API
   */
  static async encryptVault(plaintextData: string, passcode: string): Promise<EncryptedVault> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passcode),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      encoder.encode(plaintextData)
    );

    return {
      ciphertext: Buffer.from(ciphertextBuffer).toString('base64'),
      salt: Buffer.from(salt).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      version: 1,
    };
  }

  /**
   * Decrypts ciphertext vault using passcode
   */
  static async decryptVault(vault: EncryptedVault, passcode: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const salt = Buffer.from(vault.salt, 'base64');
    const iv = Buffer.from(vault.iv, 'base64');
    const ciphertext = Buffer.from(vault.ciphertext, 'base64');

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passcode),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      ciphertext
    );

    return decoder.decode(decryptedBuffer);
  }
}
