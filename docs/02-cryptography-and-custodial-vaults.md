# Volume 2: Cryptography & Non-Custodial MPC Control Plane

## 1. Architectural Model

Northveil operates strictly as a **non-custodial control plane**:
- **AI Agent (Claude / Cursor)** never holds private keys, seeds, or MPC shares.
- **MCP Server** never holds a full private key in memory, database, env vars, or code.
- **Signing** is threshold MPC across isolated TEE enclaves.
- **Passkey Ceremony**: Under Always Ask or when an intent exceeds autonomous limits, the user signs a WebAuthn biometric assertion with their hardware passkey. The challenge binds cryptographically to `sha256(canonicalUnsignedTx)`.

```
[Agent Client] ──(nv_prepare_transfer)──► [Grant & Policy Engine]
                                                  │
                            ┌─────────────────────┴─────────────────────┐
                            ▼                                           ▼
                    [Always Ask]                                  [Autonomous]
                            │                                           │
                    Pending Approval Ticket                   Inside Grant Limits?
                            │                                           │
                    User WebAuthn Passkey                               │
                            │                                           │
                            └─────────────────────┬─────────────────────┘
                                                  ▼
                                      [Threshold MPC Enclaves]
                                                  │
                                      [Broadcasted Transaction]
```

## 2. Invariants

1. **Zero Key Storage**: No private keys or seed phrases exist on the server or database.
2. **Deterministic Payload Hashing**: WebAuthn assertions commit to the exact transaction bytes.
3. **Single-Use Tickets**: Approval tokens expire in 10 minutes and cannot be replayed.
4. **Server Boot Invariant**: In production, `assertProductionSecurity()` will terminate immediately if `PRIVATE_KEY`, `SEPOLIA_PRIVATE_KEY`, or `ETH_PRIVATE_KEY` is present in the environment.
