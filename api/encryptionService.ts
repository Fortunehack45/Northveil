/**
 * DEPRECATED: Raw Key Encryption Service (Migrated to Hardware Enclave Non-Custodial Architecture)
 * In compliance with non-negotiable security requirements, Northveil never generates, stores, or
 * decrypts private key material on servers. This file is retained with security stubs to prevent
 * runtime import errors while permanently disabling key storage pathways.
 */

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  salt?: string;
}

export function encryptCredential(_plaintext: string, _customSalt?: string): EncryptedPayload {
  throw new Error('SECURITY VIOLATION: Server-side private key encryption is permanently disabled under the non-custodial MPC architecture.');
}

export function decryptCredential(_payload: EncryptedPayload, _legacySaltOrAddress?: string): string {
  throw new Error('SECURITY VIOLATION: Server-side private key decryption is permanently disabled. Private keys exist solely within hardware TEE enclaves.');
}
