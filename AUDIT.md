# Northveil Non-Custodial Security & Key Material Audit (Follow-up 15)

## Executive Summary
This audit inspects the entire Northveil monorepo across all surfaces:
- **Wallet SPA** (`src/`)
- **MCP Server & Control Plane** (`mcp-server/`)
- **Developer CLI** (`cli/`)
- **TypeScript SDK** (`sdk/`)
- **Python SDK & Scripts** (`python-sdk/`, `sdk.py`)

The objective is to eliminate all client-side and server-side key custody risks, ensuring that no complete private key or mnemonic phrase is stored in Supabase, Vercel environment variables, MCP memory post-request, SPA `localStorage`, CLI configuration, or SDK runtime.

---

## 1. Inventory of Key Material & Custody Hits

| Area | File & Line | Pattern Found | Risk Classification | Remediation / Fix |
|---|---|---|---|---|
| **Wallet SPA** | `src/services/VaultService.ts:113` | `localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault))` | **HIGH (Local Storage Key Vault)**: Stored AES-encrypted mnemonic seed in browser `localStorage`. Vulnerable to XSS or client machine extraction. | Deprecate and remove from UI. Hydrate all wallets exclusively from `GET /wallet/me`. Vaults are Turnkey MPC enclaves only. |
| **Wallet SPA** | `src/services/VaultService.ts:193` | `localStorage.removeItem('northveil_v3_active_seed')` | **HIGH (Plaintext Seed Residue)**: Legacy cleanup for plaintext seed phrases. | Remove active seed logic. Ensure zero unencrypted seed ever touches `localStorage`. |
| **Wallet SPA** | `src/context/WalletContext.tsx:353-356` | `localStorage.getItem('northveil_vault_pk')`, `localStorage.getItem('northveil_seed')` | **HIGH (Local Storage Private Key)**: Attempted to load local private keys or seed phrases from browser storage. | Remove local storage key retrieval. User state is loaded only via authenticated session from `GET /wallet/me`. |
| **Wallet SPA** | `src/context/WalletContext.tsx:456` | `ethers.Wallet.createRandom()` in `createSubWallet` | **HIGH (Local Hot Key Generation)**: Generated hot private key in browser memory for sub-wallets. | Remove local hot wallet generation. All wallets are provisioned through Turnkey MPC enclave (`/wallet/create`). |
| **Wallet SPA** | `src/context/WalletContext.tsx:547` | `new ethers.Wallet(formattedKey)` in `importSubWallet` | **HIGH (Local Hot Key Import)**: Stored raw private key in `SubWalletAccount` in React state. | Remove hot key import. Wallet import is executed via browser-encrypted Turnkey import bundle. |
| **Wallet SPA** | `src/context/WalletContext.tsx:1021-1080` | `setupVault(password, mnemonic)` | **HIGH (Local Seed Derivation)**: Derived EVM, Solana, and Bitcoin addresses from local BIP39 seed phrase and saved encrypted vault. | Delete / hide `setupVault` from default UI. Wallets are provisioned via `/wallet/create` and Turnkey MPC. |
| **Wallet SPA** | `src/context/WalletContext.tsx:1583, 1601, 1723, 1741` | `new ethers.Wallet(cleanPk, provider)` | **HIGH (In-Browser Transaction Signing)**: Attempted to sign transactions locally with hot wallet. | Remove in-browser private key signing. All transactions follow MCP request lifecycle (`pending_approval` -> WebAuthn passkey -> Turnkey MPC). |
| **Wallet SPA** | `src/context/WalletContext.tsx:2234, 2302` | `localStorage.setItem('northveil_seed_phrase', ...)`, `localStorage.setItem('northveil_vault_pk', ...)` | **HIGH (Local Storage Secret Writes)**: Wrote seed words or private keys to `localStorage`. | Delete all secret writes to `localStorage`. Clear legacy keys on logout (`localStorage.removeItem`). |
| **Wallet SPA** | `src/services/WalletService.ts:25, 98, 117, 190, 208` | `bip39.generateMnemonic()`, `ethers.HDNodeWallet.fromPhrase()`, `new ethers.Wallet()` | **MEDIUM (Client-side Key Utilities)**: Library functions that construct raw `ethers.Wallet` and derive private keys. | Disconnect from active application flows. Default UI paths must never call local key derivation. |
| **Wallet SPA** | `src/services/MpcWalletService.ts:138-141` | `payload.mnemonic = cleanSecret`, `payload.privateKey = cleanSecret` in `importMpcVault` | **CRITICAL (Plaintext Mnemonic Transmission)**: Sent unencrypted mnemonic phrase or private key over network to `/wallet/import`. | Deprecate `importMpcVault`. Implement `importBegin` and `importFinish`. Encrypt mnemonic directly in browser with `@turnkey/crypto` `encryptWalletToBundle`. |
| **Wallet SPA** | `src/components/OnboardingAuthModal.tsx:537` | Calls `MpcWalletService.importMpcVault` with raw user input | **CRITICAL (Plaintext Mnemonic Transmission)**: Handled raw mnemonic in state and sent to server. | Switch to `@turnkey/crypto` in-page encryption. Zero mnemonic string in React state immediately after encryption. |
| **MCP Server** | `mcp-server/src/wallet/mpcAdapter.ts:228-232` | `ethers.HDNodeWallet.fromPhrase(cleanMnemonic)` in `turnkeyProvider().importWallet` | **CRITICAL (Server-Side Mnemonic Derivation)**: Derived address from plaintext mnemonic in Node.js server memory. | Remove `ethers.HDNodeWallet.fromPhrase` and `ethers.Wallet` from `mpcAdapter.ts`. Server must only handle `encryptedBundle` via Turnkey `importWallet`. |
| **MCP Server** | `mcp-server/src/wallet/mpcAdapter.ts:305` | `new ethers.Wallet('0x' + cleanKey)` in `turnkeyProvider().importWallet` | **HIGH (Server-Side Private Key Instantiation)**: Constructed `ethers.Wallet` from raw private key. | Remove raw key import. Enforce client-side bundle encryption only. |
| **MCP Server** | `mcp-server/src/wallet/mpcAdapter.ts:48-50` | `ALLOW_MOCK_SIGNER === '1'` | **MEDIUM (Test Signer Bypass)**: Development mock provider allowed when environment variable is set. | Verify that hosted environments (`NODE_ENV=production`, `VERCEL=1`, `NORTHVEIL_HOSTED=1`) strictly throw and fail closed. Add explicit boot log `signer=turnkey`. |
| **MCP Server** | `mcp-server/src/server.ts:1867-1873` | `POST /wallet/import` accepting `mnemonic` or `privateKey` | **HIGH (Raw Material Endpoint)**: Endpoint accepted plaintext mnemonic or private key over HTTP. | Guard/deprecate endpoint. Enforce `POST /wallet/import/finish` with check: reject with `400 RAW_MATERIAL_FORBIDDEN` if `mnemonic` or `privateKey` is provided. |
| **MCP Server** | `mcp-server/src/wallet/requestLifecycle.ts:563` | `await assertSignPermit(mpcWalletId, req.payload_hash)` inside `signAndAdvance` | **VERIFIED CLEAN**: `signAndAdvance` does **not** insert permits; it strictly consumes pre-existing permits. | Keep strict invariant: `signAndAdvance` only consumes permits. Permits are created exclusively in `/api/approvals/:id/complete` (passkey) or `submitIntent` (autonomous grant). |
| **CLI** | `cli/src/commands/wallet.ts:54-111` | `tx:prepare` and `tx:broadcast` accepting `--raw <signedHex>` | **HIGH (Local Client Signing Pattern)**: CLI promoted local raw transaction signing and broadcasting. | Remove `tx:prepare` and `tx:broadcast`. CLI must be a thin client to `https://mcp.northveil.xyz`. Implement `northveil tools` and `northveil call <tool>` via JSON-RPC. |
| **CLI** | `cli/src/utils.ts:10-15` | Fallback URLs include dead or local ports (`localhost:3001`, `northveil-mcp.vercel.app`) | **LOW (Functional URL Fragility)**: Multiple fallback URLs could mask routing issues. | Default base URL strictly to `https://mcp.northveil.xyz`. Store credentials in `~/.northveil/credentials` with mode `0o600`. |
| **SDK (TS)** | `sdk/src/client.ts` | Config options and parameter types | **LOW (API Cleanliness)**: Need to guarantee `privateKey` / `mnemonic` are explicitly rejected in constructor. | Add explicit check rejecting `privateKey` or `mnemonic` in constructor. Add `call(tool, args)` and `getRequest(requestId)`. Default baseUrl to `https://mcp.northveil.xyz`. |
| **SDK (Python)** | `sdk.py`, `python-sdk/northveil/client.py` | Scope violations: `search_flights`, `search_hotels`, `make_reservation`, "38 tools" claim | **HIGH (Rule 0.2 Scope Violation & Custodial Claims)**: Contained forbidden travel tools and claimed "Northveil Custodial Signing Service". | Strip all travel, flight, hotel, and reservation tools. Remove "38 tools" references. Implement clean JSON-RPC client calling MCP tools directly. Ensure no local key handling. |

---

## 2. Functional & Cross-Surface Bugs Identified

1. **`resources/list` Missing in MCP Server**:
   - MCP protocol clients (e.g. Claude Desktop, Claude.ai, or CLI inspection) query `resources/list`. Currently, `mcp-server/src/server.ts` returns `-32601 Method not found`.
   - **Fix**: Add `resources/list` returning `{ resources: [] }` in both `POST /mcp` (HTTP) and `POST /message` (SSE).

2. **Plaintext Mnemonic in `/wallet/import/finish`**:
   - If a caller inadvertently sends `{ mnemonic, encryptedBundle }` to `/wallet/import/finish`, the server should immediately reject the request.
   - **Fix**: Add explicit validation: `if (req.body.mnemonic || req.body.privateKey) return res.status(400).json({ error: "RAW_MATERIAL_FORBIDDEN" });`.

3. **In-Browser Encryption for Wallet Import**:
   - The SPA modal currently sends raw recovery phrases to the server.
   - **Fix**: Wire `@turnkey/crypto`'s `encryptWalletToBundle` directly in the SPA using `importBundle` and `turnkeyUserId` from `POST /wallet/import/begin`, then POST the ciphertext bundle to `/wallet/import/finish`. Zero the mnemonic in component state immediately.

4. **CLI Key & Credential Storage**:
   - Credentials should be saved to `~/.northveil/credentials` with file mode `0600` instead of arbitrary paths.
   - `northveil login` should instruct the user to open `wallet.northveil.xyz` to generate an agent client key.

5. **Error Normalization**:
   - Common error conditions (`NO_SIGN_PERMIT`, `SIGNER_NOT_BOUND`, `OTP_EXPIRED`, `WALLET_NOT_IN_GRANT`, `RAW_MATERIAL_FORBIDDEN`) must return clean JSON objects `{ error, message }` rather than leaking unhandled stack traces.

---

## 3. Implementation Verification Checklist

- [x] **Phase 1 (Wallet SPA)**:
  - [x] Delete dead `VaultService.ts` and `WalletService.ts` entirely.
  - [x] Remove unused imports and enforce CI lint check (`node scripts/check-no-custodial-keys.js`).
  - [x] Delete/hide `setupVault` from UI.
  - [x] Hydrate wallet state exclusively from `GET /wallet/me`.
  - [x] In-browser encryption via `@turnkey/crypto` for wallet import.
  - [x] Zero mnemonic string in React state.
- [x] **Phase 2 (MCP Custody & Auth)**:
  - [x] Add `RAW_MATERIAL_FORBIDDEN` guard in `/wallet/import/finish`.
  - [x] Remove `ethers.HDNodeWallet.fromPhrase` from `mpcAdapter.ts`.
  - [x] Hosted boot invariant check with `signer=turnkey` boot log.
  - [x] Verify no secret columns in database schema (`wallets` only has `mpc_wallet_id`).
  - [x] Fix WebAuthn COSE public key decoding (`unpackCredentialPublicKey`) to eliminate `"Length not supported or not well formed"`.
  - [x] Fix SSE CORS credentials + origin allow-list to adhere to Fetch specification.
  - [x] Disclose autonomous mode delegate key requirements honestly in `nv_set_autonomous_mode`.
- [x] **Phase 3 (CLI)**:
  - [x] Remove `tx:prepare` and `tx:broadcast`.
  - [x] Implement `northveil tools` and `northveil call <tool> [args]`.
  - [x] Store API key in `~/.northveil/credentials` (mode `0600`).
  - [x] Default URL to `https://mcp.northveil.xyz`.
- [x] **Phase 4 (SDK)**:
  - [x] TypeScript SDK: reject `privateKey`/`mnemonic`, implement `call()` and `getRequest()`.
  - [x] Python SDK: strip forbidden travel tools ("38 tools"), provide clean JSON-RPC client.
- [x] **Phase 5 (Cross-Surface Bugs)**:
  - [x] Add `resources/list` handler to MCP server.
  - [x] Ensure standard error mapping for lifecycle errors.
- [x] **Phase 6 (Tests & CI)**:
  - [x] Test `RAW_MATERIAL_FORBIDDEN` rejection.
  - [x] Test `NO_SIGN_PERMIT` enforcement.
  - [x] Zero secret hits across hosted paths.
  - [x] Add automated custody pattern linter in `npm run lint`.
- [ ] **Phase 7 (Pending Turnkey Dashboard Verification)**:
  - [ ] Confirm Turnkey dashboard policy denies root API key from direct `ACTIVITY_TYPE_SIGN_TRANSACTION_V2` on user sub-org wallets without user passkey authenticator.

