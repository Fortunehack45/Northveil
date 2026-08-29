# Security Policy

## Non-Custodial Architecture & Key Management

Northveil is designed to operate strictly as a non-custodial multi-party computation (MPC) and hardware Trusted Execution Environment (TEE) platform.

### Security Guarantees:
1. **Zero Server-Side Private Key Custody**: Private keys are neither stored in plain text on server disk nor in databases. All cryptographic signatures and operations are performed client-side or within Northveil hardware secure enclaves.
2. **Deterministic BIP-39 Vaults**: Users retain 100% self-sovereign ownership of their 12-word recovery seed phrases and passkey attestations.
3. **Demo Mode Isolation**: When `NORTHVEIL_DEMO_MODE=true` is enabled for local evaluation, generated wallets are explicitly marked `demo_unspendable` and signing operations return non-broadcast simulated results.

---

## ⚠️ Security Notice: Compromised Development Test Key

> **IMPORTANT ADVISORY**: A development test private key (previously committed in historical commits) has been completely excised and burned:
> - Because this key exists in public git history, **it must be treated as permanently compromised and burned**.
> - If this address or key was ever funded on Sepolia, Ethereum mainnet, or any other EVM/SVM network, any remaining assets should be swept immediately.
> - No server-side or custodial fallback keys are utilized anywhere in Northveil.

---

## Reporting Vulnerabilities

If you discover a potential security vulnerability within Northveil, please disclose it responsibly by contacting security@northveil.xyz.
