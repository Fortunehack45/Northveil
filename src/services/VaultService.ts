import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

export class VaultService {
  /**
   * Encrypts the seed phrase array into a secure Vault string.
   */
  static encryptSeedPhrase(seedPhrase: string[], password: string): string {
    const dataStr = JSON.stringify(seedPhrase);
    // Use AES encryption
    const encrypted = CryptoJS.AES.encrypt(dataStr, password).toString();
    return encrypted;
  }

  /**
   * Decrypts a secure Vault string back into the seed phrase array.
   */
  static decryptSeedPhrase(encryptedVault: string, password: string): string[] | null {
    if (!encryptedVault || !password) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedVault, password);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedData) return null; // Wrong password or corrupted
      return JSON.parse(decryptedData) as string[];
    } catch (e) {
      console.error('Failed to decrypt vault. Incorrect password or corrupted data.');
      return null;
    }
  }

  /**
   * Generates a new random BIP39 seed phrase
   */
  static generateNewSeedPhrase(): string[] {
    const wallet = ethers.Wallet.createRandom();
    return wallet.mnemonic!.phrase.split(' ');
  }
}
