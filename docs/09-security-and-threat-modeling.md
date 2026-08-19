# Volume 9: Security Architecture & Threat Modeling

## 1. Threat Model & Attack Vectors

| Attack Vector | Threat Level | Northveil Mitigation Strategy |
| :--- | :--- | :--- |
| **Prompt Injection Key Extraction** | 🔴 CRITICAL | Private keys are **never loaded into LLM context**. AI only receives high-level wallet addresses and balances. |
| **Memory Dump / Cold-Boot Attack** | 🔴 CRITICAL | Ephemeral key buffers are zero-filled (`fill(0)`) immediately after cryptographic signing. |
| **Token Replay Attack** | 🔴 CRITICAL | Single-use approval tokens are atomically marked as used (`token_used = true`) upon first verification. |
| **Multi-Tenant Cross-Access** | 🔴 CRITICAL | API keys are bound to authorized wallet addresses. Scoped guard rejects cross-wallet requests with HTTP 403. |
| **RPC Interception / Man-in-the-Middle** | 🟡 HIGH | All upstream RPC connections utilize TLS 1.3 with failover validation across public trusted nodes. |
| **Reentrancy Exploitation** | 🟡 HIGH | Static AST auditor checks and flags reentrancy patterns prior to deployment. |

## 2. Audit Trail & Non-Repudiation

All actions (wallet creations, signing requests, deployments, rejections) produce immutable audit records in `wallet_audit_logs`. Sensitive secrets (keys, seed phrases) are automatically stripped before logging.
