# Volume 1: Architecture & System Design

## 1. System Overview

The Northveil Protocol is structured as a non-custodial control plane and signing gateway designed for AI agents (Claude, Cursor, custom LLM agents) with zero-key exposure.

### Non-Custodial Invariant
The AI never holds keys. The server never holds a full key. The agent proposes an operation. A grant + policy engine decides if it can run. If approval is required, the user signs with a passkey. Signing happens by threshold MPC across isolated parties/TEEs. The agent only ever receives a derived result (tx hash, signature, scoped token) — never a private key, seed, or MPC share.

```
┌─────────────────────────────────────────────────────────────┐
│                 TIER 1: AI AGENT INTERFACE                  │
│       (Claude Desktop, Claude.ai, Cursor, Custom Agents)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON-RPC 2.0 / SSE / REST
                               │ (X-API-Key: nv_live_...)
┌──────────────────────────────▼──────────────────────────────┐
│             TIER 2: NORTHVEIL MCP GATEWAY ENGINE            │
│  - resolveContext (Hashed Client Key -> User -> Grant)      │
│  - Policy & Grant Engine (evaluateGrant, spend caps, scopes)│
│  - Single-Use Approval State Machine (10m TTL, Hash-Bound)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
(Always Ask / Out-of-Policy)     (Autonomous & Within Limits)
               │                              │
┌──────────────▼──────────────┐               │
│ TIER 3: WEBAUTHN PASSKEY RP │               │
│ Human Signs challenge =     │               │
│ sha256(canonicalUnsignedTx) │               │
└──────────────┬──────────────┘               │
               │                              │
               └──────────────┬───────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│        TIER 4: THRESHOLD MPC SIGNING FABRIC (TURNKEY TEE)   │
│  - Enclave partitions per user account                      │
│  - Server submits activity with policy & passkey evidence   │
│  - Zero raw keys or seeds reconstructed on server           │
└─────────────────────────────┬───────────────────────────────┘
                              │ Signed raw transaction
┌─────────────────────────────▼───────────────────────────────┐
│         TIER 5: RESILIENT MULTI-CHAIN BROADCAST MESH        │
│                Base (EIP-155:8453) │ Sepolia │ Ethereum      │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│             TIER 6: PERSISTENCE & AUDIT LOGGING             │
│          Supabase PostgreSQL (RLS) - Zero Private Keys      │
└─────────────────────────────────────────────────────────────┘
```

## 2. Serverless Edge Topology & Runtime Tuning

Northveil runs as an enterprise serverless microservice compatible with Vercel Serverless, AWS Lambda, and standalone Docker containers.

### Serverless Function Configuration
```json
{
  "version": 2,
  "functions": {
    "api/index.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### Key Security Tenets
1. **Zero Key Custody**: Neither private keys, seed phrases, nor MPC secret shares exist on the server, in memory as long-lived secrets, or in PostgreSQL.
2. **Server-Side Policy Enforcement**: Spending caps and recipient boundaries are enforced in deterministic server-side code, not in the LLM prompt.
3. **Passkey-Bound Approvals**: Challenges commit to `sha256(canonicalUnsignedTx)`. Any modification of recipient, amount, or calldata invalidates the assertion.
4. **Instant Revocation**: Pausing or revoking an agent client in the wallet dashboard immediately invalidates in-flight and future operations.
