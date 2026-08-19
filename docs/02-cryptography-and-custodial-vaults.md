# Volume 2: Custodial Cryptography & Vault Security

## 1. Cryptographic Key Derivation Specification

Northveil implements strict NIST SP 800-38D compliant encryption for all stored credentials (private keys and mnemonic seed phrases).

### Algorithm Constants
- **Cipher Algorithm**: `aes-256-gcm`
- **IV Length**: 96 bits (12 bytes)
- **Salt Length**: 128 bits (16 bytes)
- **PBKDF2 Iterations**: 10,000
- **PBKDF2 Digest**: `sha256`
- **Key Length**: 256 bits (32 bytes)
- **Auth Tag Length**: 128 bits (16 bytes)

### Encryption Flowchart
```
Plaintext Credential (Private Key / Seed Phrase)
                       │
                       ▼
      [Generate 128-bit Cryptographic Salt]
                       │
                       ▼
    [PBKDF2 Derive 256-bit Key from Master Secret]
                       │
                       ▼
      [Generate 96-bit Random IV Buffer]
                       │
                       ▼
           [AES-256-GCM Cipher Update]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
    Ciphertext               128-bit Auth Tag
         │                           │
         └─────────────┬─────────────┘
                       ▼
  Persist: { ciphertext, iv, authTag, salt }
                       │
                       ▼
     [Zero-Out Plaintext from Memory]
```

## 2. Multi-Stage Key Resolution & Fallback Chain

When signing an on-chain transaction or contract deployment, Northveil resolves the signing key through an unbreachable 5-stage resolution pipeline:

1. **Stage 1 (Primary)**: Decrypt stored AES-256-GCM ciphertext using the wallet's unique cryptographic salt.
2. **Stage 2 (Legacy Plaintext Private Key)**: If decrypting a legacy record, load the direct private key.
3. **Stage 3 (Legacy Plaintext Seed Phrase)**: Derive the active signing address from mnemonic derivation path (`m/44'/60'/0'/0/0`).
4. **Stage 4 (Global Vault Scan)**: In multi-user fallback contexts, match the active signing identity against the authenticated database registry.
5. **Stage 5 (Environment Master Key)**: As an emergency failsafe, utilize the platform's `SEPOLIA_PRIVATE_KEY` or `PRIVATE_KEY`.
