
# Northveil — Autonomous Web3, AI MCP & Decentralized Travel Ecosystem

[![Live dApp](https://img.shields.io/badge/Live%20dApp-northveil.xyz-blue.svg?style=flat-square)](https://northveil.xyz)
[![MCP Server](https://img.shields.io/badge/MCP%20Gateway-mcp.northveil.xyz-purple.svg?style=flat-square)](https://mcp.northveil.xyz)
[![npm SDK](https://img.shields.io/npm/v/northveil-sdk.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/northveil-sdk)
[![Developer CLI](https://img.shields.io/npm/v/northveil-cli.svg?style=flat-square&color=emerald)](https://www.npmjs.com/package/northveil-cli)
[![Python SDK](https://img.shields.io/badge/Python-northveil-yellow.svg?style=flat-square)](https://pypi.org/project/northveil/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Northveil is a next-generation decentralized ecosystem combining an **AI-powered Multi-Chain Web3 dApp**, a **Universal 38-Tool Model Context Protocol (MCP) Server**, an **Autonomous Travel & Airline Ticketing Protocol**, and an enterprise developer toolchain across **TypeScript, Python, and CLI**.

---

## 🏛️ Ecosystem Monorepo Architecture

```
Northveil/
├── src/                     # React 18 + Vite Web3 dApp & AI Wallet Interface
│   ├── components/          # Cyberpunk Glassmorphic Views (Travel, Hub, Wallet, Auditor)
│   ├── services/            # On-Chain RPCs, Ethers.js, Supabase, AIService
│   └── data/                # Token standards & network registries
├── mcp-server/              # Universal MCP Gateway (HTTP, SSE, OpenAPI 3.0)
│   ├── index.ts             # 38-tool execution engine & multi-tenant auth
│   ├── tools.ts             # Complete MCP tool schemas
│   └── encryptionService.ts # AES-256-GCM hardware key encryption
├── api/                     # Self-Contained Serverless REST Gateway for Vercel
├── sdk/                     # Official TypeScript / JavaScript Client (npm: northveil-sdk)
├── python-sdk/              # Official Python Client Package (pip: northveil)
├── cli/                     # Official Developer Command-Line Tool (npm: northveil-cli)
└── supabase/                # PostgreSQL Schema, RLS Policies, pg_cron Heartbeats
```

---

## ✈️ Autonomous Travel & Dynamic Crypto Fares

Northveil integrates an **Autonomous Travel Aggregation Engine**:
1. **Real IATA Routing & Schedules**: Computes flight distances, airline carriers (BA, Virgin, Delta, Emirates, Singapore Airlines), and cabin multipliers (Economy, Business, First).
2. **Live On-Chain Crypto Valuation**: Converts USD seat inventory into real-time crypto prices (ETH, SOL, USDC, USDT) via live Coinpaprika feeds.
3. **On-Chain Booking & PNR Issuance**: Generates verifiable 6-character airline PNR passes, recorded to Supabase ledger and verified via `get_booking_status`.

---

## 🛡️ Smart Contract AST Auditor & Compiler

- **In-Browser & Custodial Solidity Compilation**: Compiles Solc `^0.8.20` bytecode and ABIs for ERC-20, ERC-721, and Staking contracts.
- **AST Static Vulnerability Scanner**: Analyzes Solidity contracts for reentrancy vectors, unvalidated external calls, unindexed events, and privilege escalation backdoors.
- **Automated Gas Optimization**: Provides Slither-grade suggestions for storage packing and calldata efficiency.

---

## 🔒 Multi-Tenant Security & Supabase Architecture

- **Scoped API Keys**: Verified against Supabase table `public.mcp_api_keys`.
- **Tenant Isolation**: Strict cross-wallet protection rejecting unauthorized foreign queries with `403 Forbidden`.
- **Zero Credential Exposure**: Private keys and seed phrases are never returned in responses.
- **Automated Keep-Alive Heartbeat**: Uses `pg_cron` inside PostgreSQL to run a scheduled heartbeat every 3 days (`0 0 */3 * *`), guaranteeing the Supabase free database never pauses from inactivity.

---

## 📚 Core Developer Documentation Suite

New engineers and contributors joining Northveil should explore our in-depth architecture manuals in [`docs/`](docs/):

- 📘 **[Core Engineering Master Guide & Developer Handbook](docs/CORE_ENGINEERING_MASTER_GUIDE.md)**: The 10-chapter technical encyclopedia detailing every layer of Northveil.
- 🏗️ **[Architecture & System Design Manual](docs/ARCHITECTURE_AND_SYSTEM_DESIGN.md)**: System topography, monorepo layout, and execution pipelines.
- ✈️ **[Autonomous Travel & Airline Ticketing Specification](docs/AUTONOMOUS_TRAVEL_ENGINE_SPEC.md)**: IATA routing algorithms, cabin multipliers, and live crypto pricing math.
- 🛡️ **[Smart Contract Studio & AST Security Auditor](docs/SMART_CONTRACT_COMPILER_AND_AUDITOR.md)**: Solc compilation, AST vulnerability scanner rules, and honeypot detection.
- 🔐 **[Custody, Key Derivation & Cryptography Manual](docs/CUSTODY_AND_CRYPTOGRAPHY_MANUAL.md)**: AES-256-GCM hardware key encryption, BIP-39/BIP-44 derivation, and tenant boundaries.
- 🗄️ **[Database Schema & DevOps Manual](docs/DATABASE_SCHEMA_AND_DEV_OPERATIONS.md)**: PostgreSQL DDL schemas, Row-Level Security (RLS) policies, and `pg_cron` keepalive automation.

---

## 🚀 Quick Commands

```bash
# Run local dApp
npm run dev

# Run CLI
npx northveil-cli whoami

# Run Python SDK
python -c "import northveil; client = northveil.Northveil(); print(client.whoami())"
```

---

## 📄 License
MIT License © 2026 Northveil Protocol. Built with precision for autonomous intelligence and global Web3 infrastructure.



