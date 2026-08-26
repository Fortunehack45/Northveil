# Volume 10: Complete Canonical MCP Tool Catalog & API Reference
**Northveil AI Control Plane Specification**

---

## 1. Canonical 18 `northveil_*` MCP Tools

| # | Tool Name | Category | Policy Mode Gate | Description & Parameters |
|---|:---|:---|:---|:---|
| 1 | `northveil_list_wallets` | Read | Autonomous | Lists user-authorized non-custodial vaults (`userId`). |
| 2 | `northveil_get_balances` | Read | Autonomous | Real-time multi-chain native & ERC-20 token balances (`network`, `walletAddress`). |
| 3 | `northveil_get_portfolio` | Read | Autonomous | Comprehensive multi-chain valuation and asset breakdown (`walletAddress`). |
| 4 | `northveil_list_nfts` | Read | Autonomous | Digital collectibles gallery across 37+ chains (`network`, `walletAddress`). |
| 5 | `northveil_get_tx` | Read | Autonomous | Transaction request status and verified block explorer link (`requestId`, `txHash`). |
| 6 | `northveil_simulate_tx` | Simulate | Autonomous | Dry-run fork simulation with balance deltas & revert check (`network`, `from`, `to`, `value`, `data`). |
| 7 | `northveil_estimate_gas` | Simulate | Autonomous | Calculates gas units, base/priority fees, and USD estimates (`network`, `to`, `value`, `data`). |
| 8 | `northveil_inspect_contract` | Audit | Autonomous | Bytecode decompilation & verified source code inspection (`contractAddress`, `network`). |
| 9 | `northveil_audit_contract` | Audit | Autonomous | Static AST security audit for honeypots & vulnerabilities (`contractAddress`, `network`). |
| 10 | `northveil_prepare_transfer` | Action | Evaluated | Stages transfer payload, computes canonical hash, and enforces policy (`walletAddress`, `recipient`, `amount`, `asset`, `network`, `reason`). |
| 11 | `northveil_prepare_swap` | Action | Evaluated | Stages DEX swap route with slippage protection (`fromToken`, `toToken`, `amount`, `network`, `slippageTolerance`). |
| 12 | `northveil_prepare_bridge` | Action | Evaluated | Stages cross-chain bridge intent (`fromChain`, `toChain`, `asset`, `amount`, `recipient`). |
| 13 | `northveil_prepare_contract_call`| Action | Evaluated | Stages contract invocation calldata (`contractAddress`, `abi`, `method`, `args`, `value`, `network`). |
| 14 | `northveil_prepare_deploy` | Action | Hard Gate (Always Pauses) | Stages smart contract deployment (`contractName`, `sourceCode`, `constructorArgs`, `network`). |
| 15 | `northveil_request_signature` | Sign | Human Approval | Requests human passkey signing ceremony (`approvalToken`, `requestId`). |
| 16 | `northveil_request_broadcast` | Broadcast | Enclave Hardware Signer | Broadcasts verified signed payload on-chain (`rawTransaction`, `network`). |
| 17 | `northveil_list_pending_approvals`| Approvals | Autonomous | Lists active requests awaiting human sign-off (`userId`). |
| 18 | `northveil_get_approval_status` | Approvals | Autonomous | Checks status of single-use approval token (`approvalToken`, `requestId`). |

---

## 2. Universal Legacy Tool Aliases

For backwards compatibility with existing AI integrations, all 35 legacy tools remain fully supported:

- **Wallets & Balances**: `create_wallet`, `import_wallet`, `get_wallet_info`, `get_portfolio`, `get_token_balance`, `get_nft_gallery`, `check_wallet_health`, `scan_wallet_security`
- **Transactions & Staging**: `create_transaction_request`, `approve_transaction`, `reject_transaction`, `get_transaction_status`, `send_transfer`, `get_gas_estimate`, `get_transaction_history`
- **DEX & Trading**: `buy_tokens`, `sell_tokens`, `trade_tokens`, `execute_swap`, `set_trade_order`, `get_active_orders`, `cancel_trade_order`, `get_realtime_prices`, `get_trending_memecoins`, `audit_token`
- **Smart Contracts**: `deploy_smart_contract`, `create_smart_contract`, `audit_smart_contract`, `verify_smart_contract`, `upload_contract_asset`, `mint_tokens`, `reserve_tokens`
- **Passkeys & Control Plane**: `generate_passkey_registration_options`, `verify_passkey_registration`, `approve_transaction_with_passkey`, `set_autonomous_spending_scope`, `activate_kill_switch`, `deactivate_kill_switch`
- **Travel Primitives**: `search_flights`, `search_hotels`, `search_events_and_movies`, `make_reservation`, `get_booking_status`, `list_reservations`

---

## 3. Control Plane REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/dashboard/clients` | `GET` | Lists authorized agent clients and active grants |
| `/api/v1/dashboard/clients` | `POST` | Registers a new agent client with initial grant |
| `/api/v1/dashboard/clients/:id/revoke` | `POST` | Revokes agent client access immediately |
| `/api/v1/dashboard/approvals/pending` | `GET` | Retrieves transactions awaiting human approval |
| `/api/v1/dashboard/approvals/:id/approve` | `POST` | Validates passkey biometric assertion, signs, and broadcasts |
| `/api/v1/dashboard/approvals/:id/reject` | `POST` | Voids and burns the single-use token immediately |
| `/api/v1/dashboard/audit` | `GET` | Returns immutable audit log of all events |
| `/api/v1/dashboard/kill-switch` | `POST` | Emergency manual lockout |
