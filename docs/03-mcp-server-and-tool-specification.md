# Volume 3: Model Context Protocol (MCP) & Signer Specification
**Northveil AI Non-Custodial Control Plane Architecture**

---

## 1. Architectural Model & Core Tenets

Northveil establishes a strict separation between model context, policy evaluation, and non-custodial cryptographic signing:

```
[ AI Agent / Claude / Cursor / ChatGPT ] ──(MCP JSON-RPC / SSE)──► [ Northveil Policy Engine & Fork Simulator ]
                                                                                │
                                                                   (Single-Use Approval Token)
                                                                                ▼
[ Blockchain RPC ] ◄──(Raw Tx Broadcast)── [ MPC Signer Enclave ] ◄── [ Human Biometric Passkey (WebAuthn) ]
```

### The 5 Immutable Axioms:
1. **"Agents operate wallets. They do not hold wallets."**
   - The AI agent never holds, sees, or extracts raw private keys or seed phrases.
2. **"Keys never enter the model context."**
   - No private key shares or signing credentials ever pass through prompts, tool arguments, or logs.
3. **"MCP requests. The signer signs. The agent never holds the key."**
   - MCP tools only request, stage, simulate, and prepare transactions. Non-custodial signers execute signatures.
4. **"Every approval is single-use and payload-bound."**
   - Approval tokens (`tok_...` / `req_...`) are cryptographically bound to the canonical hash of the transaction parameters (recipient, amount, calldata, chain ID, nonce) and expire after 10 minutes.
5. **"Autonomy is a grant, not a blank check."**
   - Agents operate strictly within user-configured policies (per-transaction caps, daily budgets, whitelisted contracts).

---

## 2. Policy Engine Evaluation Modes

The Northveil Policy Engine evaluates every staged transaction against the active agent grant:

### Mode 1: Always Approve (Default)
- **Behavior**: Every state-changing transaction (value transfer, contract call, swap, deploy) pauses execution and returns `decision: "needs_approval"` with a single-use token and human-readable preview.
- **Ceremony**: Requires user biometric confirmation via WebAuthn Passkey (Touch ID, Face ID, Windows Hello, FIDO2 key) before the MPC enclave signs and broadcasts.

### Mode 2: Approve Above Limit
- **Behavior**: In-scope transactions below `perTxUsd` and within `dailyBudgetUsd` to known contracts/destinations execute autonomously.
- **Gating**: Any transaction exceeding either cap pauses for human approval.

### Mode 3: Autonomous Within Policy
- **Behavior**: Agent operates autonomously across pre-approved actions and contract addresses.

### 🚫 Deterministic Hard Gates (Always Require Human Approval):
Regardless of the policy mode or grant limits, the following operations **ALWAYS** require human approval:
- 🚫 **Deploying Smart Contracts** (`operationType: 'deploy'`)
- 🚫 **First Transfer to Unseen Address** (`isKnownDestination: false`)
- 🚫 **Unlimited ERC-20 Allowances** (`denyUnlimitedApprovals`)
- 🚫 **`setApprovalForAll` NFT/Token Delegations** (`denySetApprovalForAll`)

---

## 3. Canonical 18 `northveil_*` MCP Tool Catalog

| Tool Name | Category | Policy Mode Gate | Description |
|---|---|---|---|
| `northveil_list_wallets` | Read | Autonomous | Lists authorized non-custodial vaults |
| `northveil_get_balances` | Read | Autonomous | Real-time multi-chain native & ERC-20 token balances |
| `northveil_get_portfolio` | Read | Autonomous | Aggregated multi-chain valuation and asset breakdown |
| `northveil_list_nfts` | Read | Autonomous | Verified digital collectibles gallery across EVM & Solana |
| `northveil_get_tx` | Read | Autonomous | Transaction request status and verified block explorer URL |
| `northveil_simulate_tx` | Simulate | Autonomous | Dry-run fork simulation with balance deltas & revert check |
| `northveil_estimate_gas` | Simulate | Autonomous | Calculates gas units, priority fees, and USD estimates |
| `northveil_inspect_contract` | Audit | Autonomous | Bytecode decompilation & verified source code inspection |
| `northveil_audit_contract` | Audit | Autonomous | Static AST security audit for honeypots & vulnerabilities |
| `northveil_prepare_transfer` | Action | Evaluated | Stages transfer payload, computes canonical hash, and enforces policy |
| `northveil_prepare_swap` | Action | Evaluated | Stages DEX swap route with slippage protection |
| `northveil_prepare_bridge` | Action | Evaluated | Stages cross-chain intent |
| `northveil_prepare_contract_call`| Action | Evaluated | Stages contract invocation calldata |
| `northveil_prepare_deploy` | Action | Hard Gate (Always Pauses) | Stages smart contract deployment |
| `northveil_request_signature` | Sign | Human Approval | Requests human passkey signing ceremony |
| `northveil_request_broadcast` | Broadcast | Enclave Hardware Signer | Broadcasts verified signed payload on-chain |
| `northveil_list_pending_approvals`| Approvals | Autonomous | Lists active requests awaiting human sign-off |
| `northveil_get_approval_status` | Approvals | Autonomous | Checks status of single-use approval token |

---

## 4. Control Plane REST API Endpoints

The Northveil Control Plane exposes dashboard and lifecycle management routes:

- `GET /api/v1/dashboard/clients` — Lists authorized agent clients and active grants.
- `POST /api/v1/dashboard/clients` — Registers a new agent client with granular initial grant.
- `POST /api/v1/dashboard/clients/:id/revoke` — Revokes an agent client's access immediately.
- `GET /api/v1/dashboard/approvals/pending` — Retrieves transactions awaiting human approval.
- `POST /api/v1/dashboard/approvals/:id/approve` — Validates passkey biometric assertion, signs, and broadcasts on-chain.
- `POST /api/v1/dashboard/approvals/:id/reject` — Voids and destroys the single-use token immediately.
- `GET /api/v1/dashboard/audit` — Immutable log trail of all agent intents, simulation results, approvals, and broadcasts.
- `POST /api/v1/dashboard/kill-switch` — Emergency lockout revoking all agent execution rights instantly.

---

## 5. Client Transports Supported

1. **HTTP JSON-RPC**: `POST /mcp`
2. **Server-Sent Events (SSE)**: `GET /sse?wallet_address=...` & `POST /message`
3. **OpenAPI 3.0**: `GET /openapi.json`
4. **OAuth 2.0 Flow**: `GET /oauth/authorize` & `POST /oauth/token`
