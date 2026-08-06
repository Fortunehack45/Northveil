/**
 * Northveil Vault Service v3.0 — Production-Grade Seed Phrase Encryption
 *
 * Uses Web Crypto API with:
 * - PBKDF2 key derivation (100,000 iterations + SHA-256)
 * - AES-256-GCM authenticated encryption
 * - Random 16-byte salt + 12-byte IV per encryption operation
 *
 * SECURITY INVARIANT: Unencrypted seed phrases NEVER touch localStorage,
 * Supabase, logs, or any HTTP response body. Only ciphertext + salt + iv
 * are persisted. Decryption requires the user's passcode every time.
 */

export interface EncryptedVault {
  ciphertext: string;   // Base64-encoded AES-256-GCM ciphertext
  salt: string;         // Base64-encoded 16-byte PBKDF2 salt
  iv: string;           // Base64-encoded 12-byte GCM nonce
  version: number;      // Schema version for future migration
}

const VAULT_STORAGE_KEY = 'northveil_v3_encrypted_vault';
const VAULT_VERSION = 3;
const PBKDF2_ITERATIONS = 100_000;

// ─── Encoding Helpers ───────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── Key Derivation ─────────────────────────────────────────────────

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ─── VaultService Class ─────────────────────────────────────────────

export class VaultService {
  /**
   * Encrypts a seed phrase array with the user's passcode and stores
   * ONLY the encrypted vault in localStorage. No plaintext is ever stored.
   *
   * @returns The encrypted vault object (also persisted to localStorage)
   */
  static async encryptAndSave(seedPhrase: string[], password: string): Promise<EncryptedVault> {
    if (!seedPhrase || seedPhrase.length === 0) {
      throw new Error('Invalid vault payload: cannot be empty');
    }
    if (!password || password.length < 1) {
      throw new Error('Password is required to encrypt the vault');
    }

    const encoder = new TextEncoder();
    const plaintext = encoder.encode(JSON.stringify(seedPhrase));

    // Generate cryptographically random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive AES-256-GCM key from password via PBKDF2
    const key = await deriveKey(password, salt);

    // Encrypt with AES-256-GCM (provides both confidentiality and integrity)
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      plaintext
    );

    const vault: EncryptedVault = {
      ciphertext: arrayBufferToBase64(ciphertextBuffer),
      salt: arrayBufferToBase64(salt.buffer),
      iv: arrayBufferToBase64(iv.buffer),
      version: VAULT_VERSION,
    };

    // Store ONLY the encrypted vault — never plaintext
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));

    return vault;
  }

  /**
   * Decrypts the stored vault using the user's passcode.
   * Returns null if password is wrong, vault is corrupted, or no vault exists.
   *
   * This is the ONLY way to retrieve seed phrase data — there is no
   * plaintext fallback or bypass.
   */
  static async decrypt(password: string): Promise<string[] | null> {
    if (!password) return null;

    const stored = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!stored) return null;

    try {
      const vault: EncryptedVault = JSON.parse(stored);

      if (!vault.ciphertext || !vault.salt || !vault.iv) {
        console.error('[VaultService] Corrupted vault structure');
        return null;
      }

      const salt = new Uint8Array(base64ToArrayBuffer(vault.salt));
      const iv = new Uint8Array(base64ToArrayBuffer(vault.iv));
      const ciphertext = base64ToArrayBuffer(vault.ciphertext);

      // Re-derive the same key from password + stored salt
      const key = await deriveKey(password, salt);

      // Decrypt — AES-GCM will throw if password is wrong (auth tag mismatch)
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      const json = decoder.decode(decryptedBuffer);
      const words = JSON.parse(json) as string[];

      if (!Array.isArray(words) || words.length < 12) {
        console.error('[VaultService] Decrypted data is not a valid seed phrase');
        return null;
      }

      return words;
    } catch (e) {
      // AES-GCM throws OperationError on wrong password (auth tag failure)
      console.error('[VaultService] Decryption failed — wrong password or corrupted vault');
      return null;
    }
  }

  /**
   * Checks whether an encrypted vault exists in storage.
   * Does NOT reveal any plaintext data.
   */
  static hasVault(): boolean {
    const stored = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!stored) return false;
    try {
      const vault = JSON.parse(stored);
      return !!(vault.ciphertext && vault.salt && vault.iv);
    } catch {
      return false;
    }
  }

  /**
   * Permanently deletes the encrypted vault from storage.
   * This is irreversible — if the user hasn't backed up their seed phrase,
   * their funds are unrecoverable.
   */
  static clearVault(): void {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    // Also clear any legacy plaintext storage from old versions
    localStorage.removeItem('northveil_v3_active_seed');
  }

  /**
   * Migrates a legacy plaintext-stored seed phrase to the new encrypted format.
   * Called once during app startup if legacy data is detected.
   * After migration, the plaintext entry is deleted.
   */
  static async migrateLegacyVault(password: string): Promise<boolean> {
    const legacyKey = 'northveil_v3_active_seed';
    const legacy = localStorage.getItem(legacyKey);
    if (!legacy) return false;

    try {
      const words = JSON.parse(legacy) as string[];
      if (Array.isArray(words) && words.length >= 12) {
        await this.encryptAndSave(words, password);
        // Remove the plaintext entry permanently
        localStorage.removeItem(legacyKey);
        console.log('[VaultService] Legacy plaintext vault migrated to AES-256-GCM');
        return true;
      }
    } catch (e) {
      console.error('[VaultService] Legacy migration failed:', e);
    }
    return false;
  }
}
