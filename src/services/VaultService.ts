import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

export class VaultService {
  private static STORAGE_KEY = 'northveil_v3_active_seed';

  static getSeedPhrase(): string[] | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 12) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  }

  static saveSeedPhrase(seedPhrase: string[]): void {
    if (seedPhrase && seedPhrase.length >= 12) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seedPhrase));
    }
  }

  /**
   * Encrypts the seed phrase array into a secure Vault string.
   */
  static encryptSeedPhrase(seedPhrase: string[], password: string): string {
    const dataStr = JSON.stringify(seedPhrase);
    // Use AES encryption
    const encrypted = CryptoJS.AES.encrypt(dataStr, password).toString();
    this.saveSeedPhrase(seedPhrase);
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
      const parsed = JSON.parse(decryptedData) as string[];
      if (Array.isArray(parsed)) {
        this.saveSeedPhrase(parsed);
      }
      return parsed;
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
    const words = wallet.mnemonic!.phrase.split(' ');
    this.saveSeedPhrase(words);
    return words;
  }
}
