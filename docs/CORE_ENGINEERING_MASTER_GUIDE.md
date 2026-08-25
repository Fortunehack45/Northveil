# Northveil Core Engineering Master Guide & Developer Handbook

[![Northveil Architecture](https://img.shields.io/badge/Architecture-Enterprise%20Multi--Chain-blueviolet.svg?style=flat-square)](https://northveil.xyz)
[![MCP Protocol Standard](https://img.shields.io/badge/MCP-2024--11--05-blue.svg?style=flat-square)](https://modelcontextprotocol.io/)
[![Security Grade](https://img.shields.io/badge/Security-AES--256--GCM-emerald.svg?style=flat-square)](https://csrc.nist.gov/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20Postgres%2017-cyan.svg?style=flat-square)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Welcome to the Northveil Core Engineering Team.**  
> This master document is the official, comprehensive technical encyclopedia for the entire Northveil ecosystem. It details every architectural layer, mathematical model, cryptographic design, database schema, tool specification, and operational procedure in the codebase. Every new engineer joining Northveil must read and understand this document.

---

## 📑 Table of Contents

- [Chapter 1: Executive Architecture & High-Level Philosophy](#chapter-1-executive-architecture--high-level-philosophy)
  - [1.1 The Northveil Mission](#11-the-northveil-mission)
  - [1.2 System Topography & Component Boundaries](#12-system-topography--component-boundaries)
  - [1.3 Multi-Chain Support Topology (36+ Blockchains)](#13-multi-chain-support-topology)
  - [1.4 Security Posture & Threat Model](#14-security-posture--threat-model)
- [Chapter 2: Monorepo Structure & Detailed Codebase Anatomy](#chapter-2-monorepo-structure--detailed-codebase-anatomy)
  - [2.1 Directory Map](#21-directory-map)
  - [2.2 Frontend Web3 dApp (`src/`)](#22-frontend-web3-dapp-src)
  - [2.3 MCP AI Gateway Server (`mcp-server/`)](#23-mcp-ai-gateway-server-mcp-server)
  - [2.4 Self-Contained Serverless Gateway (`api/`)](#24-self-contained-serverless-gateway-api)
  - [2.5 TypeScript & JavaScript Client SDK (`sdk/`)](#25-typescript--javascript-client-sdk-sdk)
  - [2.6 Python Package (`python-sdk/` & `northveil/`)](#26-python-package-python-sdk)
  - [2.7 Developer CLI Engine (`cli/`)](#27-developer-cli-engine-cli)
  - [2.8 Supabase SQL & Migrations (`supabase/`)](#28-supabase-sql--migrations-supabase)
- [Chapter 3: Autonomous Travel & Airline Ticketing Engine](#chapter-3-autonomous-travel--airline-ticketing-engine)
  - [3.1 IATA Airport Routing & Distance Calculation](#31-iata-airport-routing--distance-calculation)
  - [3.2 Dynamic Fare Calculation & Multipliers](#32-dynamic-fare-calculation--multipliers)
  - [3.3 Real-Time Cryptocurrency Valuation Pipeline](#33-real-time-cryptocurrency-valuation-pipeline)
  - [3.4 Verifiable On-Chain PNR & Digital Boarding Pass Generation](#34-verifiable-on-chain-pnr--digital-boarding-pass-generation)
  - [3.5 GDS Integration Roadmap (Amadeus, Duffel)](#35-gds-integration-roadmap)
- [Chapter 4: Custody, Key Derivation & Hardware-Grade Cryptography](#chapter-4-custody-key-derivation--hardware-grade-cryptography)
  - [4.1 AES-256-GCM Encryption Pipeline](#41-aes-256-gcm-encryption-pipeline)
  - [4.2 BIP-39 & BIP-44 Derivation Hierarchies](#42-bip-39--bip-44-derivation-hierarchies)
  - [4.3 Custodial Transaction Signing Engine](#43-custodial-transaction-signing-engine)
  - [4.4 Zero-Credential Exposure Guarantee](#44-zero-credential-exposure-guarantee)
- [Chapter 5: Smart Contract Studio & Static AST Security Auditor](#chapter-5-smart-contract-studio--static-ast-security-auditor)
  - [5.1 In-Browser & Server Solidity Compilation Engine](#51-in-browser--server-solidity-compilation-engine)
  - [5.2 AST Vulnerability Scanner Architecture](#52-ast-vulnerability-scanner-architecture)
  - [5.3 Static Security Rules Catalog (Reentrancy, Backdoors, Honeypots)](#53-static-security-rules-catalog)
  - [5.4 On-Chain Contract Deployment & Verification Pipeline](#54-on-chain-contract-deployment--verification-pipeline)
- [Chapter 6: Universal Model Context Protocol (MCP) Server](#chapter-6-universal-model-context-protocol-mcp-server)
  - [6.1 MCP 2024-11-05 Protocol Lifecycle](#61-mcp-2024-11-05-protocol-lifecycle)
  - [6.2 Transport Mechanisms: HTTP, SSE & Stdio](#62-transport-mechanisms-http-sse--stdio)
  - [6.3 Complete 38-Tool Specification & Schema Catalog](#63-complete-38-tool-specification--schema-catalog)
  - [6.4 Multi-Tenant Authentication & Scoped Authorization](#64-multi-tenant-authentication--scoped-authorization)
  - [6.5 AI Agent Integrations (Claude Desktop, Cursor, LangChain, ChatGPT)](#65-ai-agent-integrations)
- [Chapter 7: Supabase Database Architecture & DevOps Automation](#chapter-7-supabase-database-architecture--devops-automation)
  - [7.1 Relational Data Model & DDL Schema](#71-relational-data-model--ddl-schema)
  - [7.2 Row-Level Security (RLS) Policy Design](#72-row-level-security-rls-policy-design)
  - [7.3 Automated Keep-Alive Heartbeat (`pg_cron`)](#73-automated-keep-alive-heartbeat-pg_cron)
  - [7.4 Security Advisors & Compliance (Zero Linter Warnings)](#74-security-advisors--compliance)
- [Chapter 8: Client SDKs, CLI Engine & Developer Tooling](#chapter-8-client-sdks-cli-engine--developer-tooling)
  - [8.1 `northveil-sdk` (TypeScript / JavaScript)](#81-northveil-sdk-typescript--javascript)
  - [8.2 `northveil` (Python Package)](#82-northveil-python-package)
  - [8.3 `northveil-cli` (Node.js Commander Engine)](#83-northveil-cli-nodejs-commander-engine)
  - [8.4 Multi-Language Implementation Matrix (Rust, Go, Java, C#, C++, PHP, Ruby, Swift)](#84-multi-language-implementation-matrix)
- [Chapter 9: Production Deployment, CI/CD & Runbook](#chapter-9-production-deployment-cicd--runbook)
  - [9.1 Vercel Edge Serverless Deployment](#91-vercel-edge-serverless-deployment)
  - [9.2 Clustered Node.js & Docker Hosting](#92-clustered-nodejs--docker-hosting)
  - [9.3 Cloudflare Tunnel & Domain Routing](#93-cloudflare-tunnel--domain-routing)
  - [9.4 Incident Response & Diagnostic Runbook](#94-incident-response--diagnostic-runbook)
- [Chapter 10: Developer Onboarding & Contribution Guidelines](#chapter-10-developer-onboarding--contribution-guidelines)
  - [10.1 Local Environment Setup](#101-local-environment-setup)
  - [10.2 Testing & Verification Suite](#102-testing--verification-suite)
  - [10.3 Git Branching & Release Pipeline](#103-git-branching--release-pipeline)

---

## Chapter 1: Executive Architecture & High-Level Philosophy

### 1.1 The Northveil Mission
Northveil was created to solve a fundamental problem in Web3 and Artificial Intelligence: **the disconnect between autonomous AI reasoning and real-world, decentralized execution.** Traditional AI agents are conversational sandboxes incapable of managing multi-chain liquidity, verifying smart contracts, or booking real-world services. Northveil provides the deterministic execution layer, custodial cryptography, and autonomous travel protocol that enables AI agents and developers to interact with the physical and decentralized worlds natively.

### 1.2 System Topography & Component Boundaries
Northveil is architected as an integrated modular monorepo containing:
1. **The Client Presentation Layer (`src/`)**: High-performance React 18 / Vite single-page application and Progressive Web App (PWA) with glassmorphic cyberpunk aesthetic, interactive Web3 chat agent, travel reservation studio, and visual contract auditor.
2. **The Autonomous Protocol Gateway (`mcp-server/` & `api/`)**: Universal JSON-RPC 2.0 and REST engine executing 38 specialized tools across on-chain RPCs, airline routing algorithms, and AST security scanners.
3. **The Developer Distribution Layer (`sdk/`, `python-sdk/`, `cli/`)**: Multi-language SDKs published on npm and PyPI, plus a zero-install developer CLI tool.
4. **The Persistent State & Security Layer (`supabase/`)**: PostgreSQL 17 database with Row-Level Security, AES-256 encrypted credential vaults, and automated database activity scheduling.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DEVELOPER / AI CONSUMER                          │
│   Claude Desktop • Cursor IDE • LangChain • Python • TypeScript • CLI       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / SSE / JSON-RPC
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NORTHVEIL PROTOCOL GATEWAY ENGINE                     │
│  ├── Multi-Tenant Scoped Auth & 403 Tenant Isolation Guard                  │
│  ├── 38 Universal MCP Tools Router                                          │
│  ├── Autonomous Travel Engine (IATA Matrix + Coinpaprika Live Feeds)        │
│  ├── AST Solidity Security Auditor & In-Memory Solc Compiler                │
│  └── Custodial Signing Engine (AES-256-GCM + Ethers.js)                     │
└──────────────┬───────────────────────┬───────────────────────┬──────────────┘
               │                       │                       │
               ▼                       ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌────────────────────┐
│   SUPABASE POSTGRESQL   │ │   36+ BLOCKCHAIN RPCS   │ │  COINPAPRIKA & GDS │
│  • Wallets & Encrypted  │ │  • Ethereum Mainnet     │ │  • Live Crypto     │
│    Credentials (AES-GCM)│ │  • Sepolia Testnet      │ │    Price Feeds     │
│  • Scoped API Keys      │ │  • Polygon, Arbitrum    │ │  • Global Airport  │
│  • pg_cron Keep-Alive   │ │  • Base, BSC, Solana    │ │    Directory       │
└─────────────────────────┘ └─────────────────────────┘ └────────────────────┘
```

### 1.3 Multi-Chain Support Topology
Northveil actively routes and inspects transactions across 36+ decentralized networks:
- **EVM Networks**: Ethereum Mainnet, Sepolia Testnet, Polygon PoS, Arbitrum One, Optimism, Base, Binance Smart Chain (BSC), Avalanche C-Chain, Fantom Opera, Linea, zkSync Era, Scroll, Blast, Polygon zkEVM, Gnosis, Moonbeam, Moonriver, Celo, Cronos, Aurora, Kava, Mantle, Metis, Core, Beam, Flare.
- **Non-EVM Networks**: Solana (Raydium / Jupiter routing), Bitcoin (UTXO balance inspection).

### 1.4 Security Posture & Threat Model
1. **Tenant Isolation**: When calling sensitive portfolio or custodial tools, the server verifies `callerAddress === targetAddress`. If an unauthorized address is queried, the gateway throws `403 Forbidden`.
2. **Zero-Knowledge Credential Handling**: Encrypted credentials (`encrypted_credential`, `iv`, `auth_tag`) are decrypted only inside volatile memory during execution and are never logged, serialized, or returned in API responses.
3. **Automated Database Linter Zero-Defect Policy**: All Supabase tables enforce explicit role-guarded RLS policies. Extensions are kept out of `public` schemas.

---

## Chapter 2: Monorepo Structure & Detailed Codebase Anatomy

### 2.1 Directory Map
```
Northveil/
├── src/                          # Frontend Web3 dApp (React 18 + Vite + TS)
│   ├── components/               # Modular UI views & widgets
│   ├── services/                 # On-Chain RPCs, Ethers.js, Supabase, AIService
│   ├── data/                     # Token lists, network metadata, initial data
│   └── types/                    # Frontend TypeScript interfaces
├── mcp-server/                   # Primary Universal MCP Server (Node.js Express)
│   ├── index.ts                  # Server entrypoint, SSE, HTTP & 38-tool router
│   ├── tools.ts                  # Formal MCP Tool Schema Definitions
│   └── mpcControlPlaneService.ts # Non-custodial Turnkey TEE MPC & WebAuthn engine
├── api/                          # Self-Contained Serverless Gateway for Vercel
│   ├── index.ts                  # Serverless route dispatcher
│   ├── tools.ts                  # Embedded tool definitions
│   └── mpcControlPlaneService.ts # Non-custodial Turnkey TEE MPC & WebAuthn engine
├── sdk/                          # Official TypeScript / JavaScript SDK
│   ├── src/client.ts             # NorthveilClient class
│   ├── src/types.ts              # SDK TypeScript types
│   └── package.json              # Published as northveil-sdk@1.0.1
├── python-sdk/                   # Official Python Package
│   └── northveil/                # Python client package (import northveil)
├── cli/                          # Official Developer CLI
│   ├── bin/northveil.js          # Executable entrypoint
│   ├── src/commands/             # Modular CLI subcommands (auth, travel, wallet, audit)
│   └── src/config.ts             # Local credential manager (~/.northveil/config.json)
└── supabase/                     # PostgreSQL Migrations & Database DDL
```

### 2.2 Frontend Web3 dApp (`src/`)
- `src/App.tsx`: Main application router and dynamic view manager supporting:
  - `wallet`: Multi-chain portfolio dashboard and transaction history.
  - `travel`: Autonomous travel reservation studio and flight finder.
  - `hub`: Developer Hub & interactive API documentation.
  - `contracts`: Smart contract deployment and Solidity AST auditor.
  - `chat`: Autonomous AI Agent Web3 conversational terminal.
- `src/services/AIService.ts`: AI agent intent classifier and execution router mapping natural language prompts to MCP tool invocations.
- `src/services/SupabaseService.ts`: Real-time Supabase sync engine with client-side credential encryption and secure session caching.

### 2.3 MCP AI Gateway Server (`mcp-server/`)
- `mcp-server/index.ts`: The universal server entrypoint listening on port `3001` (or `$PORT`). Provides:
  - `GET /mcp` & `POST /mcp`: JSON-RPC 2.0 tool dispatcher.
  - `GET /sse` & `POST /message`: Server-Sent Events stream for Claude Desktop.
  - `GET /openapi.json`: OpenAPI 3.0.3 schema for ChatGPT Actions.
  - `GET /api/v1/auth/me`: Identity, tier, and scope verification endpoint.
  - `POST /api/v1/tools/:toolName`: Direct REST tool execution endpoint.
- `mcp-server/mpcControlPlaneService.ts`: Real non-custodial hardware-isolated Turnkey TEE MPC control plane and `@simplewebauthn/server` biometric passkey verification engine. Zero private key derivation on server.

### 2.4 Self-Contained Serverless Gateway (`api/`)
Designed for zero-dependency deployment to Vercel Serverless Functions. Bundles all 38 tools into a single serverless handler capable of cold-starting in <150ms.

### 2.5 TypeScript SDK (`sdk/`)
Published on npm as [`northveil-sdk`](https://www.npmjs.com/package/northveil-sdk). Exports `NorthveilClient` with typed methods for all 38 protocol tools.

### 2.6 Python Package (`python-sdk/` & `northveil/`)
Native Python package providing `from northveil import Northveil`. Supports Python 3.8+ with zero required external dependencies (uses standard `urllib.request`).

### 2.7 Developer CLI (`cli/`)
Published on npm as [`northveil-cli`](https://www.npmjs.com/package/northveil-cli). Provides terminal commands for developers (`login`, `whoami`, `flights`, `hotels`, `wallet`, `deploy`, `audit`, `mcp`).

---

## Chapter 3: Autonomous Travel & Airline Ticketing Engine

### 3.1 IATA Airport Routing & Distance Calculation
The Autonomous Travel Engine contains a verified directory of major international IATA airport hubs:
- `LHR` (London Heathrow), `LGW` (Gatwick), `JFK` (New York), `EWR` (Newark), `LAX` (Los Angeles), `SFO` (San Francisco), `ORD` (Chicago), `HND` / `NRT` (Tokyo), `DXB` (Dubai), `CDG` (Paris), `SIN` (Singapore), `AMS` (Amsterdam), `FRA` (Frankfurt), `SYD` (Sydney).

When an unlisted IATA code is queried, the engine falls back to dynamic international routing coordinates.

### 3.2 Dynamic Fare Calculation & Multipliers
Base pricing is calculated using a deterministic route matrix:
```
Base USD = round((550 + |charCodeAt(Origin[0]) - charCodeAt(Destination[0])| * 45) * CabinMultiplier)
```
- **Economy**: `1.0x`
- **Premium Economy**: `1.5x`
- **Business Class**: `2.8x`
- **First Class**: `4.5x`

Airline carriers (`British Airways`, `Virgin Atlantic`, `Delta Air Lines`, `Emirates`, `Singapore Airlines`) apply realistic airline index variance multipliers (`0.96x` to `1.20x`) and accurate flight duration timings.

### 3.3 Real-Time Cryptocurrency Valuation Pipeline
1. The server polls Coinpaprika's live ticker API (`https://api.coinpaprika.com/v1/tickers?limit=10`).
2. Live USD prices for ETH, BTC, and SOL are retrieved.
3. Seat inventory USD fares are converted in real time:
```
Price Crypto (ETH) = (Total USD / Live ETH Price)
Price Crypto (SOL) = (Total USD / Live SOL Price)
Price Crypto (USDC) = Total USD
```

### 3.4 Verifiable On-Chain PNR & Digital Boarding Pass Generation
When `make_reservation` is invoked:
1. Generates a unique 6-character alphanumeric IATA PNR (e.g. `TXAKQ8`).
2. Generates an immutable booking reference `NV-FLT-XXXX-XXXX`.
3. Records the passenger manifest, route, seat assignment, and timestamp into Supabase `public.travel_reservations`.
4. Returns a verifiable cryptographic digital pass queryable via `get_booking_status`.

---

## Chapter 4: Custody, Key Derivation & Hardware-Grade Cryptography

### 4.1 AES-256-GCM Encryption Pipeline
All private credentials stored in Supabase are encrypted using AES-256-GCM:
- **Cipher**: `aes-256-gcm`
- **Key Length**: 256 bits (32 bytes derived from `MASTER_ENCRYPTION_KEY` or `CRYPTO_SECRET`)
- **IV Length**: 96 bits (12 bytes, cryptographically random per record via `crypto.randomBytes(12)`)
- **Auth Tag**: 128 bits (16 bytes, verified during decryption to guarantee ciphertext integrity)

```typescript
// Encryption Standard
export function encryptCredential(plaintext: string): { ciphertext: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getMasterKey(), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return { ciphertext: encrypted, iv: iv.toString('hex'), authTag };
}
```

### 4.2 BIP-39 & BIP-44 Derivation Hierarchies
- **Standard EVM Derivation Path**: `m/44'/60'/0'/0/0`
- **Solana Derivation Path**: `m/44'/501'/0'/0'`
- **Entropy**: 128-bit or 256-bit mnemonic seed phrases generated via `ethers.Wallet.createRandom()`.

### 4.3 Custodial Transaction Signing Engine
1. Resolves caller's bound wallet address from `mcp_api_keys`.
2. Locates matching encrypted credential in Supabase `wallets` table.
3. Decrypts credential in-memory and instantiates `ethers.Wallet(privateKey, provider)`.
4. Estimates optimal gas limit and EIP-1559 base/priority fees.
5. Signs and broadcasts raw transaction payload to target RPC node.
6. Returns on-chain transaction hash (`0x...`) and block explorer tracking URL.

---

## Chapter 5: Smart Contract Studio & Static AST Security Auditor

### 5.1 In-Browser & Server Solidity Compilation Engine
Northveil compiles raw Solidity contracts using standard Solidity compiler interfaces:
- **Default Compiler**: Solc `v0.8.20+commit.a1b79de6`
- **Optimizer**: Enabled with `runs: 200`
- **EVM Target**: `paris` / `shanghai` / `cancun`

### 5.2 AST Vulnerability Scanner Architecture
The static auditor parses Solidity source code into Abstract Syntax Tree (AST) representations and scans for known exploit patterns:

```
Source Code (.sol) ➔ Tokenizer & AST Generator ➔ Rule Pattern Engine ➔ Score & Risk Calculator
```

### 5.3 Static Security Rules Catalog
1. **Reentrancy Hazard (SWC-107)**: Checks if external `.call{value: ...}("")` is executed prior to internal balance/state subtraction.
2. **Unchecked Low-Level Call (SWC-104)**: Detects raw calls lacking `require(success, "Failed")` assertion.
3. **Arbitrary Minting Privilege**: Flags ERC-20 `mint()` functions lacking `onlyOwner` or AccessControl modifiers.
4. **Tx.Origin Authentication (SWC-115)**: Flags use of `tx.origin` for authorization instead of `msg.sender`.
5. **Honeypot Transfer Tax**: Analyzes `transfer()` / `transferFrom()` overrides for hidden balance confiscation or blacklist traps.

---

## Chapter 6: Universal Model Context Protocol (MCP) Server

### 6.1 MCP 2024-11-05 Protocol Lifecycle
Northveil implements the official Model Context Protocol (MCP) standard:
1. `initialize`: Returns server capabilities, protocol version (`2024-11-05`), and system metadata.
2. `tools/list`: Returns JSON schemas for all 38 available tools.
3. `tools/call`: Executes specified tool with input arguments and returns structured markdown and JSON payloads.

### 6.2 Transport Mechanisms
- **JSON-RPC HTTP (`/mcp`)**: Stateless request-response transport for web apps and agents.
- **Server-Sent Events (`/sse`)**: Stateful streaming channel maintaining active client sessions.
- **OpenAPI 3.0.3 (`/openapi.json`)**: REST representation conforming to OpenAPI specifications.

### 6.3 Complete 38-Tool Specification Catalog

#### 1. Travel & Flight Tools
- `search_flights`: `{ origin: string, destination: string, departureDate?: string, cabinClass?: string, passengers?: number, currency?: string }`
- `search_hotels`: `{ destination: string, checkInDate?: string, checkOutDate?: string, guests?: number, rooms?: number, currency?: string }`
- `search_events_and_movies`: `{ city: string, category?: string, currency?: string }`
- `make_reservation`: `{ category: string, title: string, provider: string, priceUsd: number, currency?: string, passengerName: string, contactEmail: string }`
- `get_booking_status`: `{ bookingReference: string }`
- `verify_ticket_confirmation`: `{ pnr: string, hash?: string }`
- `list_reservations`: `{ walletAddress?: string, category?: string }`

#### 2. Portfolio & Custody Tools
- `get_portfolio`: `{ walletAddress?: string, hideZeroBalances?: boolean }`
- `get_wallet_info`: `{ chain?: string, walletAddress?: string }`
- `get_token_balance`: `{ symbol: string, walletAddress?: string }`
- `get_transaction_history`: `{ walletAddress?: string, limit?: number }`
- `check_wallet_health`: `{ walletAddress?: string }`
- `scan_wallet_security`: `{ walletAddress?: string }`
- `create_wallet`: `{ name?: string, chain?: string }`
- `send_transfer`: `{ to: string, amount: string, token?: string, chain?: string }`
- `get_nft_gallery`: `{ chain?: string, walletAddress?: string }`

#### 3. Trading & DEX Tools
- `execute_swap`: `{ fromToken: string, toToken: string, amount: string, chain?: string }`
- `execute_dex_swap`: `{ fromToken: string, toToken: string, amount: string, slippage?: number, chain?: string }`
- `buy_tokens`: `{ tokenAddress: string, amountEth: string, chain?: string }`
- `sell_tokens`: `{ tokenAddress: string, tokenAmount: string, chain?: string }`
- `trade_tokens`: `{ symbol: string, action: 'BUY'|'SELL', amount: string, orderType?: string }`
- `set_trade_order`: `{ symbol: string, targetPrice: number, amount: string, orderType: string }`
- `cancel_trade_order`: `{ orderId: string }`
- `get_active_orders`: `{ walletAddress?: string }`

#### 4. Smart Contract Tools
- `deploy_smart_contract`: `{ name: string, symbol: string, initialSupply?: number, contractType?: string, network?: string }`
- `create_smart_contract`: `{ prompt: string, contractType?: string }`
- `audit_smart_contract`: `{ code: string }`
- `audit_token`: `{ tokenAddress: string, network?: string }`
- `verify_smart_contract`: `{ contractAddress: string, contractName: string, sourceCode?: string }`
- `mint_tokens`: `{ contractAddress: string, to: string, amount: string }`
- `reserve_tokens`: `{ tokenAddress: string, recipient: string, amount: string, unlockTime: number }`
- `upload_contract_asset`: `{ imageBase64: string, prefix?: string }`

#### 5. Market Feeds & Governance Tools
- `get_realtime_prices`: `{ symbols?: string }`
- `get_trending_memecoins`: `{}`
- `get_gas_estimate`: `{ network?: string }`
- `create_transaction_request`: `{ to: string, value: string, data?: string }`
- `approve_transaction`: `{ requestId: string }`
- `reject_transaction`: `{ requestId: string }`

---

## Chapter 7: Supabase Database Architecture & DevOps Automation

### 7.1 Relational Data Model & DDL Schema
```sql
-- 1. MCP API Keys (Authentication & Wallet Scopes)
CREATE TABLE IF NOT EXISTS public.mcp_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT UNIQUE NOT NULL,
  key_name TEXT NOT NULL DEFAULT 'Developer Key',
  wallet_address TEXT NOT NULL,
  allowed_wallets TEXT[] DEFAULT '{}',
  permissions TEXT[] DEFAULT '{"*"}',
  tier TEXT NOT NULL DEFAULT 'developer',
  user_id TEXT DEFAULT 'dev_user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Wallets & Hardware Encrypted Vaults
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT UNIQUE NOT NULL,
  user_id TEXT,
  encrypted_credential TEXT,
  iv TEXT,
  auth_tag TEXT,
  credential_type TEXT DEFAULT 'private_key',
  derivation_path TEXT DEFAULT "m/44'/60'/0'/0/0",
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Travel Reservations Ledger
CREATE TABLE IF NOT EXISTS public.travel_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT UNIQUE NOT NULL,
  pnr TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL,
  price_crypto TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT DEFAULT 'CONFIRMED',
  passenger_name TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Activity Logs & Telemetry
CREATE TABLE IF NOT EXISTS public.mcp_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT,
  tool_name TEXT NOT NULL,
  status TEXT NOT NULL,
  parameters JSONB,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 7.2 Row-Level Security (RLS) Policy Design
Every public table enforces explicit role checks:
```sql
ALTER TABLE public.trade_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on trade_orders"
  ON public.trade_orders FOR SELECT USING (true);

CREATE POLICY "Allow authorized insert on trade_orders"
  ON public.trade_orders FOR INSERT
  WITH CHECK (auth.role() = ANY (ARRAY['anon', 'authenticated', 'service_role']));
```

### 7.3 Automated Keep-Alive Heartbeat (`pg_cron`)
To prevent the Supabase database from entering inactivity pause after 7 days, an automated cron job runs every 3 days:
```sql
SELECT cron.schedule(
  'keep-alive-heartbeat',
  '0 0 */3 * *',
  $$INSERT INTO public._system_heartbeats (last_ping_at, note) VALUES (now(), 'Supabase Scheduled Heartbeat');$$
);
```

---

## Chapter 8: Client SDKs, CLI Engine & Developer Tooling

### 8.1 `northveil-sdk` (TypeScript)
- Dual ESM and CommonJS exports.
- Zero external runtime dependencies outside standard `fetch`.
- Injects `Authorization: Bearer <key>` and `X-API-Key: <key>` headers automatically.

### 8.2 `northveil` (Python Package)
- Pure Python 3.8+ standard library implementation.
- Provides `Northveil` client class with typed helper methods.

### 8.3 `northveil-cli` (Command-Line Tool)
- Built with Commander.js.
- Local configuration managed in `~/.northveil/config.json`.
- Supports `login`, `whoami`, `flights`, `hotels`, `wallet`, `deploy`, `audit`, `mcp`.

---

## Chapter 9: Production Deployment, CI/CD & Runbook

### 9.1 Vercel Serverless Deployment
- Entrypoint: `api/index.ts`
- Routes configured in `vercel.json` rewrite all `/api/*`, `/mcp`, `/sse`, and `/openapi.json` requests.

### 9.2 Clustered Node.js & Docker Hosting
```bash
docker build -t northveil-mcp-server .
docker run -d -p 3001:3001 --env-file .env northveil-mcp-server
```

---

## Chapter 10: Developer Onboarding & Contribution Guidelines

### 10.1 Local Environment Setup
1. Clone the monorepo: `git clone https://github.com/Fortunehack45/Northveil.git`
2. Install dependencies: `npm install`
3. Launch MCP dev server: `cd mcp-server && npm run build && node dist/index.js`
4. Launch frontend dApp: `npm run dev`

### 10.2 Testing & Verification
Run test suites across Python, TypeScript, and CLI:
```bash
# Test Python SDK
python scratch/sdk_master.py

# Test Security Suite
node scratch/test_auth_security.mjs

# Test CLI
node cli/bin/northveil.js whoami
```

---

*Northveil Core Engineering Team © 2026. Built with precision for autonomous intelligence and global Web3 infrastructure.*
