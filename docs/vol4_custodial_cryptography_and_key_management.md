# Northveil Technical Encyclopedia — Volume IV: Custodial Cryptography & Key Management

## 1. AES-256-GCM Hardware-Grade Key Encryption Pipeline

Northveil enforces Galois/Counter Mode (GCM) symmetric authenticated encryption compliant with NIST SP 800-38D.

```
Plaintext Credential (Private Key / Seed)
              │
              ├───► Random 96-bit IV (crypto.randomBytes(12))
              ├───► 256-bit Master Key (AES-256)
              ▼
    [AES-GCM Cipher Engine]
              │
              ├───► Ciphertext (Hex encoded)
              └───► 128-bit Authentication Tag (Hex encoded)
```

## 2. Cryptographic Implementation Details
- **Cipher**: `aes-256-gcm`
- **Key Length**: 32 bytes (256 bits)
- **IV / Nonce**: 12 bytes (96 bits), unique per encryption operation.
- **Auth Tag**: 16 bytes (128 bits), verified on decryption. Any tampering with ciphertext throws an immediate decryption error.

## 3. Multi-Tenant Wallet Isolation Security
1. When calling sensitive methods (`get_portfolio`, `send_transfer`, `mint_tokens`), the gateway checks:
   $$	ext{CallerAddress} == 	ext{TargetAddress}$$
2. If the caller passes a foreign address not in `allowed_wallets`, the gateway halts execution and returns:
   ```json
   {
     "error": "🔒 403 Forbidden: Unauthorized access. Your API Key is scoped to wallet 0x56f0... and cannot access or manipulate private resources for foreign wallet."
   }
   ```
