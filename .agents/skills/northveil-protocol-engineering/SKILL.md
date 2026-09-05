---
name: northveil-protocol-engineering
description: Protocol engineering guidelines, security invariants, and implementation patterns for Northveil AI-agent non-custodial MPC wallet and MCP control plane. Use when modifying authentication, WebAuthn passkeys, Turnkey MPC signing, OAuth flows, and MCP tools.
---

# Northveil Protocol Engineering & Security Invariants

This skill provides the non-negotiable protocol rules, architectural patterns, and debugging guides for Northveil.

## 0. Non-Negotiable Security Invariants
- **No Private Keys / Seeds**: The AI agent, MCP server, Postgres/Supabase, environment variables, logs, and git must NEVER hold complete private keys, seed phrases, or unmasked MPC shares.
- **Hosted Default Gate**:
  - `isHosted()` returns true if `NODE_ENV === 'production' || VERCEL === '1' || NORTHVEIL_HOSTED === '1'`.
  - `allowOrgSign()` returns true ONLY in local development when `ALLOW_ORG_ROOT_SIGN === '1'`.
  - On hosted environments, calling `signAndBroadcast` directly MUST throw `ORG_ROOT_SIGN_FORBIDDEN`.
- **Decoupled User-Stamped Signing Flow**:
  1. `createSignActivity(req)` -> `{ activityId, organizationId, unsignedTransaction }`
  2. User stamps activity in browser/app via passkey.
  3. `submitStampedActivity({ activityId, stampedRequest })` -> `{ signedTransaction }`
  4. `broadcastSignedTx(chainId, signedTransaction)` -> `{ txHash }`
- **Single-Use Sign Permits**:
  - Approval generates a 10-minute permit in Supabase `sign_permits` with a valid UUID `id`.
  - Signing consumes the permit atomically (`assertSignPermit`). If missing, fails closed with `NO_SIGN_PERMIT`.
- **Autonomous Mode**: Strictly opt-in, requires biometric passkey step-up, daily spend caps, and a user-delegated Turnkey key. On hosted environments without a delegate key, returns `AUTONOMOUS_REQUIRES_DELEGATE_KEY`.
- **Zero Competitor Mentions**: No competitor wallet brands anywhere in code, docs, commit messages, or error strings.

## 1. WebAuthn Passkey Verification (@simplewebauthn/server v13)
- **Credential Object Requirement**:
  - `@simplewebauthn/server` v13 `verifyAuthenticationResponse` strictly requires `options.credential: WebAuthnCredential`:
    ```typescript
    credential: {
      id: credIDStr,
      publicKey: new Uint8Array(opts.storedAuthenticator.credentialPublicKey),
      counter: Number(opts.storedAuthenticator.counter || 0),
    }
    ```
  - Omitting `credential` causes a runtime `TypeError: Cannot read properties of undefined (reading 'counter')`. Always supply both `credential` and `authenticator` for forward/backward compatibility.
- **Credential Normalization**:
  - Use `asWebAuthnCredentialJSON(body)` to unwrap `{ response: full attResp }`.
  - Reject raw inner response `{ response: attResp.response }` with 400 `PASSKEY_RESPONSE_MALFORMED`.
- **RP Configuration**:
  - `rpID: "northveil.xyz"`, `userVerification: "preferred"`, 120s timeout.
  - Allowed origins: `wallet.northveil.xyz`, `northveil.xyz`, `apex.northveil.xyz`, and `localhost`.

## 2. MCP & OAuth 2.0 Connector Specification
- **Primary Endpoint**: `https://mcp.northveil.xyz/mcp` (primary for Claude and ChatGPT). `/sse` is legacy alias only.
- **Cookie Domain**:
  - Session cookie `nv_session` must use `domain: isHosted() ? '.northveil.xyz' : undefined` so that authentication is shared across `wallet.northveil.xyz` and `mcp.northveil.xyz`.
- **OAuth Popup & Next Resume**:
  - When Claude opens `/oauth/authorize`, unauthenticated requests redirect to `https://wallet.northveil.xyz/login?next=/oauth/authorize?...`.
  - Upon successful passkey unlock, the frontend must inspect `next` and immediately resume the OAuth flow back to `mcp.northveil.xyz/oauth/authorize`.
- **Multi-Wallet Ordering**:
  - Always query wallets ordered by `is_primary` descending:
    ```typescript
    .eq('user_id', id).eq('status', 'active').order('is_primary', { ascending: false })
    ```
  - Never call `.maybeSingle()` on wallets.
- **Timing-Safe Equal**:
  - Always verify `bufA.length === bufB.length` before calling `crypto.timingSafeEqual(bufA, bufB)`.

## 3. Regression Testing Invariants
Before pushing any release, the test suite (`test/followUp25.test.ts`) must pass 100%:
1. Passkey finish accepts full `attResp` and rejects malformed inner response with `400 PASSKEY_RESPONSE_MALFORMED`.
2. Hosted `signAndBroadcast` throws `ORG_ROOT_SIGN_FORBIDDEN`.
3. `signAndAdvance` without permit throws `NO_SIGN_PERMIT`.
4. `signAndAdvance` transitions to `pending_user_stamp` on hosted environments.
5. Plaintext mnemonic import returns `400 RAW_MATERIAL_FORBIDDEN`.
6. `/wallet/me` returns 200 with multi-wallet ordering (primary first).
7. OAuth tenant isolation verified (`portfolio(userA) !== portfolio(userB)`).
8. MCP `tools/list` exposes `nv_prepare_transfer`.
9. SDK constructor refuses private keys; CLI does not leak API keys in `--sse` queries; canonical connector is `https://mcp.northveil.xyz/mcp`.
