import { ethers } from 'ethers';
import { WalletService } from './WalletService';

/**
 * Sanitizes any raw wallet address string.
 * If a seed phrase, mnemonic, or raw private key was mistakenly passed,
 * it automatically derives the actual on-chain 0x public address.
 */
export const sanitizeToValidAddress = (rawAddress?: string | null, accountIndex: number = 0): string => {
  if (!rawAddress) return '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const clean = rawAddress.trim();

  // 1. If it contains spaces or is a multi-word mnemonic seed phrase
  if (clean.includes(' ') || clean.split(/\s+/).length >= 12) {
    try {
      const words = clean.split(/\s+/).filter(Boolean);
      if (words.length >= 12) {
        const derived = WalletService.deriveEVMAddress(words, accountIndex);
        if (derived && derived.address && derived.address.startsWith('0x')) {
          return derived.address.toLowerCase();
        }
      }
    } catch {}
    return '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  }

  // 2. If it is an EVM private key (64 hex characters or 66 chars starting with 0x)
  if ((clean.startsWith('0x') && clean.length === 66) || (!clean.startsWith('0x') && clean.length === 64)) {
    try {
      const formatted = clean.startsWith('0x') ? clean : `0x${clean}`;
      const wallet = new ethers.Wallet(formatted);
      return wallet.address.toLowerCase();
    } catch {}
  }

  // 3. If it is already a valid EVM address (0x + 40 hex chars)
  if (clean.startsWith('0x') && clean.length === 42 && ethers.isAddress(clean)) {
    return clean.toLowerCase();
  }

  // 4. If it is a base58 Solana address (32-44 chars) or SegWit Bitcoin address (bc1...)
  if ((clean.length >= 32 && clean.length <= 44 && !clean.includes(' ')) || clean.startsWith('bc1')) {
    return clean;
  }

  return '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
};

/**
 * Formats an address into a short representation like 0x56f0...5417
 */
export const formatShortAddress = (rawAddr?: string | null, accountIndex: number = 0): string => {
  const addr = sanitizeToValidAddress(rawAddr, accountIndex);
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};
