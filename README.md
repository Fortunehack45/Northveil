# Northveil — Autonomous Web3, AI MCP & Non-Custodial Control Plane Ecosystem

[![Live dApp](https://img.shields.io/badge/Live%20dApp-northveil.xyz-blue.svg?style=flat-square)](https://northveil.xyz)
[![MCP Server](https://img.shields.io/badge/MCP%20Gateway-mcp.northveil.xyz-purple.svg?style=flat-square)](https://mcp.northveil.xyz)
[![npm SDK](https://img.shields.io/npm/v/northveil-sdk.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/northveil-sdk)
[![Developer CLI](https://img.shields.io/npm/v/northveil-cli.svg?style=flat-square&color=emerald)](https://www.npmjs.com/package/northveil-cli)
[![Python SDK](https://img.shields.io/badge/Python-northveil-yellow.svg?style=flat-square)](https://pypi.org/project/northveil/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Northveil is an enterprise decentralized infrastructure uniting an **AI-powered Multi-Chain Web3 dApp**, a **Universal 38-Tool Model Context Protocol (MCP) Server**, a **Non-Custodial MPC Control-Plane Architecture**, and an **Autonomous Travel & Airline Protocol**.

---

## 🏛️ Ecosystem Monorepo Architecture

```
Northveil/
├── src/                          # React 18 + Vite Web3 dApp & AI Wallet Interface
│   ├── components/               # Cyberpunk Glassmorphic Views (Travel, Hub, Wallet, Auditor)
│   ├── services/                 # On-Chain RPCs, Ethers.js, Supabase, AIService
│   └── data/                     # Token standards & network registries
├── mcp-server/                   # Universal MCP Gateway (HTTP, SSE, OpenAPI 3.0)
│   ├── index.ts                  # 38-tool execution engine & non-custodial dispatch
│   ├── tools.ts                  # Complete MCP tool schemas
│   └── mpcControlPlaneService.ts # Turnkey hardware TEE enclave MPC control plane
├── api/                          # Self-Contained Serverless REST Gateway for Vercel
├── sdk/                          # Official TypeScript / JavaScript Client (npm: northveil-sdk)
├── python-sdk/                   # Official Python Client Package (pip: northveil)
├── cli/                          # Official Developer Command-Line Tool (npm: northveil-cli)
└── supabase/                     # PostgreSQL Schema, Non-Custodial Migrations, RLS Policies
```

---

## 🔐 Non-Custodial MPC Control-Plane Architecture

Northveil employs a **Non-Custodial Hardware-Isolated TEE MPC Control Plane**:

1. **Zero Server-Side Private Key Storage**: No unencrypted or decryptable private key material is ever stored in databases, server memory, or backups. All keys exist solely as distributed threshold shards generated and isolated inside AWS Nitro Enclaves.
2. **WebAuthn Biometric Passkey Gating**: High-value or state-changing actions (contract deployments, large transfers, token mints, DEX swaps) generate unsigned transaction payloads and single-use approval tokens (`tok_...`) requiring user biometric authorization on client devices (Touch ID, Face ID, Windows Hello, YubiKey).
3. **Autonomous Agent Spending Scopes**: Users grant AI agents scoped operational budgets (`set_autonomous_scope`) with maximum per-transaction USD caps and rolling 24-hour daily limits. Transactions within budget execute autonomously via MPC enclave co-signing; transactions outside budget require passkey confirmation.
4. **Instant Emergency Kill Switch**: Invoking `activate_kill_switch` locks the vault, revokes agent execution permissions, and voids all outstanding approval tokens.

---

## ✈️ Autonomous Travel & Dynamic Crypto Fares

Northveil integrates an **Autonomous Travel Aggregation Engine**:
1. **Real IATA Routing & Schedules**: Computes flight distances, airline carriers (BA, Virgin, Delta, Emirates, Singapore Airlines), and cabin multipliers (Economy, Business, First).
2. **Live On-Chain Crypto Valuation**: Converts USD seat inventory into real-time crypto prices (ETH, SOL, USDC, USDT) via live Coinpaprika feeds.
3. **On-Chain Booking & PNR Issuance**: Generates verifiable 6-character airline PNR passes, recorded to Supabase ledger and verified via `get_booking_status`.

---

## 🛡️ Smart Contract Studio & AST Security Auditor

- **In-Browser & Non-Custodial Solidity Compilation**: Compiles Solc `^0.8.24` bytecode and ABIs for ERC-20, ERC-721, and Staking contracts with verified deterministic deployment.
- **AST Static Vulnerability Scanner**: Analyzes Solidity contracts for reentrancy vectors, unvalidated external calls, unindexed events, floating pragmas, and privilege escalation backdoors.
- **Automated Gas Optimization**: Provides Slither-grade suggestions for storage packing and calldata efficiency.

---

## 📚 Core Developer Documentation Suite

Explore our comprehensive technical specifications in [`docs/`](docs/):

- 📘 **[Core Engineering Master Guide & Developer Handbook](docs/CORE_ENGINEERING_MASTER_GUIDE.md)**: The 10-chapter technical encyclopedia detailing every layer of Northveil.
- 🔐 **[Non-Custodial MPC Control-Plane & Cryptography Specification](docs/CUSTODY_AND_CRYPTOGRAPHY_MANUAL.md)**: Hardware TEE Nitro Enclaves, WebAuthn Passkeys, autonomous spending scopes, and migration runbook.
- 🏗️ **[Architecture & System Design Manual](docs/ARCHITECTURE_AND_SYSTEM_DESIGN.md)**: System topography, monorepo layout, and execution pipelines.
- ✈️ **[Autonomous Travel & Airline Ticketing Specification](docs/AUTONOMOUS_TRAVEL_ENGINE_SPEC.md)**: IATA routing algorithms, cabin multipliers, and live crypto pricing math.
- 🛡️ **[Smart Contract Studio & AST Security Auditor](docs/SMART_CONTRACT_COMPILER_AND_AUDITOR.md)**: Solc compilation, AST vulnerability scanner rules, and honeypot detection.
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
