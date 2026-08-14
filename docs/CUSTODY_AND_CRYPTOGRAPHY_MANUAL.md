# Northveil Custody, Key Derivation & Cryptography Manual

## 1. Hardware-Grade AES-256-GCM Encryption Standard

Every private key and mnemonic seed phrase in the Northveil ecosystem is encrypted at rest using AES-256 in Galois/Counter Mode (GCM).

### Cryptographic Parameters
- **Algorithm**: `AES-256-GCM` (NIST SP 800-38D)
- **Key Derivation**: 256-bit entropy derived from `CRYPTO_SECRET` / `MASTER_ENCRYPTION_KEY`
- **IV / Nonce**: 96 bits (12 bytes), generated per-record using cryptographically secure random bytes (`crypto.randomBytes(12)`)
- **Authentication Tag**: 128 bits (16 bytes), mandatory verification on decryption to detect tampering.

## 2. Key Derivation Paths
- **EVM (Ethereum, Polygon, Arbitrum, Base)**: `m/44'/60'/0'/0/0`
- **Solana**: `m/44'/501'/0'/0'`
- **Bitcoin**: `m/84'/0'/0'/0/0` (Native SegWit Bech32)

## 3. Tenant Isolation & 403 Security Boundary
All incoming API requests undergo tenant validation:
1. API key resolves to a primary `wallet_address` and `allowed_wallets` array.
2. If `args.walletAddress` is provided, the server verifies `args.walletAddress.toLowerCase() == boundAddress`.
3. If unequal, execution halts immediately with `403 Forbidden`.
