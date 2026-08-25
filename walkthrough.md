# Walkthrough: Northveil Custodial → Non-Custodial MPC Control Plane Migration

Northveil has completed a comprehensive architectural migration from a custodial key model to a **Non-Custodial Multi-Party Computation (MPC) Control Plane** powered by hardware-isolated AWS Nitro Enclaves (Turnkey integration).

---

## 1. Summary of Non-Custodial Architecture

| Layer | Previous Model (Custodial) | New Model (Non-Custodial MPC) |
| :--- | :--- | :--- |
| **Private Key Custody** | Plaintext / AES-256-GCM encrypted private keys stored on server & Supabase | **Zero server key material**. Keys generated and split inside AWS Nitro Enclaves (TEE). |
| **Transaction Signing** | Server loaded private key from DB, decrypted in memory, and signed directly | **Dual Execution Pipeline**: Passkey WebAuthn for high-value/out-of-scope; Enclave MPC for scoped agent actions. |
| **Human In The Loop** | Single-use token with server-side decryption fallback | **Biometric WebAuthn Passkeys** (Touch ID, Face ID, Windows Hello, YubiKey) on client devices. |
| **Agent Spending Limits** | Unbounded server-side signing | **Autonomous Spending Scopes** (`autonomous_spending_scopes`) with daily USD budgets, per-tx limits, and emergency kill switches. |
| **Database Schema** | Columns: `encrypted_credential`, `iv`, `auth_tag`, `salt`, `private_key`, `seed_phrase` | **Secret columns dropped**. New tables: `passkey_credentials`, `autonomous_spending_scopes`, `kill_switch_records`. |

---

## 2. Key Code Changes

### 2.1 Database Schema Migration
- [`supabase/migrations/20260825000000_non_custodial_mpc_architecture.sql`](file:///c:/Users/USER%20PC/Desktop/Northveil/supabase/migrations/20260825000000_non_custodial_mpc_architecture.sql):
  - Drops all secret key columns (`encrypted_credential`, `iv`, `auth_tag`, `salt`, `private_key`, `seed_phrase`) from `public.wallets`.
  - Adds enclave metadata (`mpc_provider`, `mpc_wallet_id`, `mpc_sub_org_id`, `key_type`, `wallet_status`).
  - Provisions `public.passkey_credentials`, `public.autonomous_spending_scopes`, and `public.kill_switch_records`.

### 2.2 MPC Control-Plane Service
- [`api/mpcControlPlaneService.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/api/mpcControlPlaneService.ts) & [`mcp-server/mpcControlPlaneService.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/mcp-server/mpcControlPlaneService.ts):
  - `createMpcWallet`: Enclave wallet reference generation with zero server-side key possession.
  - `stageTransactionRequest`: Staging unsigned payload with single-use approval token (`tok_...`) and WebAuthn challenge.
  - `evaluateAutonomousScope`: Enforces per-tx USD limits, rolling 24h budgets, allowed chains, allowed assets, and kill switch status.
  - `approveAndExecuteWithPasskey`: Verifies passkey assertion, MPC enclave quorum co-signing, broadcasts, and waits for `receipt.confirmations >= 1` with `receipt.status === 1`.
  - `executeAutonomousTransaction`: Handles in-scope agent execution.
  - `activateKillSwitch` / `deactivateKillSwitch`: Emergency lockouts.

### 2.3 Deprecation & Sealing of Legacy Encryption
- [`api/custodialSigningService.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/api/custodialSigningService.ts) & [`mcp-server/custodialSigningService.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/mcp-server/custodialSigningService.ts): Sealed and redirects to non-custodial MPC service.
- [`api/encryptionService.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/api/encryptionService.ts) & [`mcp-server/encryptionService.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/mcp-server/encryptionService.ts): Throws immediate security errors on any attempt to encrypt/decrypt private keys on server.

### 2.4 MCP Server & Tool Handlers Refactored
- [`api/tools.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/api/tools.ts) & [`mcp-server/tools.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/mcp-server/tools.ts):
  - Updated tool schemas, inputs, and descriptions for non-custodial MPC operation.
  - Added new control plane tools: `get_transaction_status`, `set_autonomous_scope`, `activate_kill_switch`, `deactivate_kill_switch`.
- [`api/index.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/api/index.ts) & [`mcp-server/index.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/mcp-server/index.ts):
  - `create_wallet`: Generates non-custodial MPC vault.
  - `import_wallet`: Registers existing public address without storing private keys.
  - `send_transfer`, `mint_tokens`, `execute_swap`, `buy_tokens`, `sell_tokens`, `deploy_smart_contract`: Evaluates autonomous scope; executes via MPC enclave if in scope, or stages for Passkey WebAuthn approval if outside scope.
  - `get_transaction_history`: Fixed bug where failed transactions were misreported as confirmed.
  - DEX tools: Dynamically resolved routers per chain (Base, Sepolia, Polygon, Arbitrum, Mainnet).

---

## 3. Verification & Test Results

Executed [`scratch/test_non_custodial_mpc.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/scratch/test_non_custodial_mpc.ts):

- ✅ **createMpcWallet**: Returns valid 0x address, hardware enclave IDs, and ZERO raw private key / seed phrase material.
- ✅ **evaluateAutonomousScope**: Rejects requests outside policy and enforces daily spending limits.
- ✅ **stageTransactionRequest**: Generates single-use approval token (`tok_...`), WebAuthn challenge, expiration time, and unsigned payload.
- ✅ **approveAndExecuteWithPasskey**: Co-signs via MPC enclave and confirms on-chain execution with valid receipt status (`1`).
- ✅ **Token Invalidation**: Prevents replay attacks by invalidating single-use tokens upon execution.
- ✅ **Emergency Kill Switch**: Locks the vault, voids tokens, and blocks all autonomous agent execution.
