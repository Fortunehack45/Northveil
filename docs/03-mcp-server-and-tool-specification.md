# Volume 3: Model Context Protocol (MCP) & Signer Specification
**Northveil Control Plane Architecture**

---

## 1. Architectural Model

```
[ AI Agent / Claude / ChatGPT ] ──(MCP JSON-RPC)──► [ Northveil Policy Engine ] ──► [ MPC Signer Enclave ] ──► [ Blockchain RPC ]
```

- **MCP is the bus**: The model uses MCP tools to read balances, inspect state, and propose transactions.
- **MPC is the signer**: No raw keys, mnemonic seed phrases, or private key shares are ever exposed to the agent or MCP logs.
- **Payload-bound single-use approvals**: Every state-changing transaction requires single-use cryptographic approval tokens bound to the canonical hash of the transaction parameters.

---

## 2. Core Security & Policy Rules

1. **Deny by Default for Value Movement**: Value transfers require explicit human approval via WebAuthn biometric passkey unless covered by an active Autonomous Grant within sub-cap limits.
2. **Re-checked on Every Call**: Grant parameters (daily budget, per-tx ceiling, target allowlist, chain whitelist) are evaluated dynamically on every single tool execution.
3. **Simulation Pre-Flight**: Value-moving contract calls and token transfers are dry-run via fork simulation before an approval card is presented to the user.
4. **Token Invalidation**: Approval tokens expire after 10 minutes. If rejected, the token is burned immediately with zero retries.

---

## 3. Tool Catalog Reference

### Read Tools (Zero Signing Authority)
- `list_wallets`: Lists user-authorized non-custodial vaults.
- `get_portfolio`: Multi-chain portfolio dashboard across EVM and Solana with USD valuations.
- `get_token_balance`: Direct on-chain balance query for specific tokens.
- `list_nfts`: Queries 37+ EVM and Solana chains for digital collectibles.
- `simulate_transaction`: Fork simulation with balance delta and revert diagnostics.
- `audit_smart_contract`: Automated static AST security audit for Solidity contracts.

### Write Tools (Gated by Policy Engine)
- `prepare_transfer`: Prepares transfer payload, calculates fees, checks policy, and generates approval tokens.
- `approve_transaction`: Consumes approval token with Passkey assertion, triggers enclave threshold signature, and broadcasts on-chain.
- `reject_transaction`: Invalidate and burn an outstanding approval token.
- `prepare_swap`: Generates DEX swap route (Uniswap v3 / Aerodrome / 1inch).
- `prepare_deploy`: Compiles Solidity source code with solc v0.8.24 and stages deployment request.
- `set_autonomous_scope`: Configures time-boxed spend caps ($25/tx, $100/day default).
- `activate_kill_switch`: Immediate emergency revocation of all agent grants and freezing of signing.

---

For full architecture details, data schemas, sequence diagrams, and threat models, refer to [NORTHVEIL_TARGET_ARCHITECTURE_SPEC.md](file:///c:/Users/USER%20PC/Desktop/Northveil/docs/NORTHVEIL_TARGET_ARCHITECTURE_SPEC.md).
