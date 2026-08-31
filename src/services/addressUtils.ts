import { ethers } from 'ethers';

/**
 * Defensive address validator.
 * Validates on-chain public addresses (EVM 0x, Solana Base58, Bitcoin SegWit).
 * Rejects mnemonic phrases, raw private keys, arbitrary strings, and never
 * substitutes a dummy fallback address.
 */
export const sanitizeToValidAddress = (rawAddress?: string | null, _accountIndex?: number): string => {
  if (!rawAddress || typeof rawAddress !== 'string') return '';
  const clean = rawAddress.trim();
  if (!clean) return '';

  // 1. Strictly reject mnemonic phrases (containing spaces or words)
  if (clean.includes(' ') || clean.split(/\s+/).length > 1) {
    return '';
  }

  // 2. Strictly reject raw 64/66-char private keys
  if ((clean.startsWith('0x') && clean.length === 66) || (!clean.startsWith('0x') && clean.length === 64)) {
    return '';
  }

  // 3. Validate EVM address (0x + 40 hex chars)
  if (clean.startsWith('0x') && clean.length === 42) {
    if (ethers.isAddress(clean)) {
      try {
        return ethers.getAddress(clean);
      } catch {
        return clean.toLowerCase();
      }
    }
    return '';
  }

  // 4. Validate Solana base58 address (32-44 characters, base58 chars only)
  if (clean.length >= 32 && clean.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(clean)) {
    return clean;
  }

  // 5. Validate Bitcoin SegWit / Legacy address
  if (clean.startsWith('bc1') || clean.startsWith('1') || clean.startsWith('3')) {
    if (clean.length >= 26 && clean.length <= 62) {
      return clean;
    }
  }

  return '';
};

/**
 * Formats an address into a short representation like 0x56f0...5417
 */
export const formatShortAddress = (rawAddr?: string | null, _accountIndex?: number): string => {
  const addr = sanitizeToValidAddress(rawAddr);
  if (!addr) return '0x0000...0000';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

/**
 * Safely parses any crypto amount string, number, or exponential notation (e.g. 5e-7) into BigInt wei
 * without throwing "invalid FixedNumber string value".
 */
export const parseEtherSafe = (value: string | number | bigint | undefined | null): bigint => {
  if (value === undefined || value === null) return 0n;
  if (typeof value === 'bigint') return value;

  if (typeof value === 'number') {
    if (isNaN(value) || value <= 0) return 0n;
    const fixedStr = value.toLocaleString('en-US', {
      useGrouping: false,
      maximumFractionDigits: 18,
    });
    try {
      return ethers.parseEther(fixedStr);
    } catch {
      try {
        return ethers.parseUnits(value.toFixed(18), 18);
      } catch {
        return 0n;
      }
    }
  }

  const str = String(value).trim();
  if (!str || str === '0' || str === '0x' || str === '0x0') return 0n;

  if (str.startsWith('0x')) {
    try {
      return BigInt(str);
    } catch {
      return 0n;
    }
  }

  // If already a large integer (wei)
  if (/^\d+$/.test(str) && str.length > 12) {
    try {
      return BigInt(str);
    } catch {}
  }

  // Extract numerical substring (supports negative/positive integers, floats, scientific notation like 5e-7)
  const numMatch = str.match(/[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/);
  if (!numMatch) return 0n;

  const cleaned = numMatch[0];
  const num = Number(cleaned);
  if (num <= 0 || isNaN(num)) return 0n;

  const fixedStr = num.toLocaleString('en-US', {
    useGrouping: false,
    maximumFractionDigits: 18,
  });

  try {
    return ethers.parseEther(fixedStr);
  } catch {
    try {
      return ethers.parseUnits(num.toFixed(18), 18);
    } catch {
      return 0n;
    }
  }
};

/**
 * Formats any crypto balance (including microscopic amounts like 0.00000000007 or 7e-11)
 * with full mathematical precision without converting to 0 or scientific notation.
 */
export const formatCryptoBalance = (rawBalance: number | string | undefined | null, maxDecimals: number = 18): string => {
  if (rawBalance === undefined || rawBalance === null || rawBalance === '') return '0';
  
  const num = typeof rawBalance === 'number' ? rawBalance : Number(rawBalance);
  if (isNaN(num) || num === 0) return '0';

  let str = '';
  if (typeof rawBalance === 'string' && !rawBalance.includes('e') && !rawBalance.includes('E') && !isNaN(Number(rawBalance))) {
    str = rawBalance.trim();
  } else {
    // Convert scientific notation / float to full decimal string
    const expStr = num.toExponential();
    const [mantissa, exponent] = expStr.split('e');
    const exp = parseInt(exponent, 10);
    if (exp < 0) {
      const decimals = Math.abs(exp);
      const parts = mantissa.split('.');
      const cleanDigits = parts[0] + (parts[1] || '');
      str = '0.' + '0'.repeat(decimals - 1) + cleanDigits;
    } else if (exp > 0) {
      const parts = mantissa.split('.');
      const intDigits = parts[0];
      const fracDigits = parts[1] || '';
      if (fracDigits.length <= exp) {
        str = intDigits + fracDigits + '0'.repeat(exp - fracDigits.length);
      } else {
        str = intDigits + fracDigits.slice(0, exp) + '.' + fracDigits.slice(exp);
      }
    } else {
      str = mantissa;
    }
  }

  // Split integer and fractional parts
  const [intPart, fracPart] = str.split('.');
  const formattedInt = BigInt(intPart || '0').toLocaleString('en-US');
  
  if (!fracPart) return formattedInt;

  // Clean trailing zeros
  const cleanFrac = fracPart.replace(/0+$/, '');
  if (!cleanFrac) return formattedInt;

  const limitedFrac = cleanFrac.slice(0, maxDecimals);
  return `${formattedInt}.${limitedFrac}`;
};

/**
 * Formats a USD valuation cleanly, providing high-precision indicators for microscopic amounts.
 */
export const formatUsdValue = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '$0.00';
  const val = typeof num === 'number' ? num : Number(num);
  if (isNaN(val) || val === 0) return '$0.00';

  if (val > 0 && val < 0.01) {
    if (val < 0.000001) {
      return '< $0.000001';
    }
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  }

  return val.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

