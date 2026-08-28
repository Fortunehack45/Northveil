# Security Policy

## Non-Custodial Architecture & Key Management

Northveil is designed to operate strictly as a non-custodial multi-party computation (MPC) and hardware Trusted Execution Environment (TEE) platform powered by Turnkey.

### Security Guarantees:
1. **Zero Server-Side Private Key Custody**: Private keys are neither generated nor stored in plain text on server disk or database. All cryptographic signatures are performed within Turnkey hardware enclaves.
2. **Turnkey Configuration Required by Default**: If Turnkey credentials (`TURNKEY_API_PUBLIC_KEY`, `TURNKEY_API_PRIVATE_KEY`, `TURNKEY_ORGANIZATION_ID`) are absent, the platform will refuse transaction signing and wallet provisioning with a `TurnkeyEnclaveError`.
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
