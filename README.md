# Northveil Protocol — Autonomous Web3, AI MCP & Global Crypto Travel Suite

[![NPM SDK](https://img.shields.io/npm/v/northveil-sdk.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/northveil-sdk)
[![CLI Tool](https://img.shields.io/npm/v/northveil-cli.svg?style=flat-square&color=emerald)](https://www.npmjs.com/package/northveil-cli)
[![MCP Protocol](https://img.shields.io/badge/MCP-38%20Tools-blueviolet.svg?style=flat-square)](https://modelcontextprotocol.io/)
[![Blockchains](https://img.shields.io/badge/Blockchains-36%2B%20Supported-purple.svg?style=flat-square)](https://ethereum.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Northveil is an enterprise Web3 platform, Model Context Protocol (MCP) AI ecosystem, and autonomous travel protocol enabling AI agents and developers to execute real on-chain transactions, search and book airline flights in cryptocurrency, audit smart contracts, and manage multi-chain custodial wallets across 36+ blockchains.**

---

## 📑 Ecosystem Components

| Component | Location | Description | Links |
|---|---|---|---|
| **Web3 dApp & AI Wallet** | `src/` | Interactive Vite + React dApp with AI Agent Chat & Visualizer | [Live dApp](https://northveil.xyz) |
| **Model Context Protocol Server** | `mcp-server/` | Universal 38-tool MCP Gateway (HTTP, SSE & OpenAPI 3.0) | [Northveil-MCP](https://github.com/Fortunehack45/Northveil-MCP) |
| **Serverless API Gateway** | `api/` | Zero-dependency Serverless REST Tool Gateway | [Vercel API](https://northveil-mcp.vercel.app) |
| **TypeScript / JavaScript SDK** | `sdk/` | Official client library for Node.js, Web, and Agent builders | [npm: northveil-sdk](https://www.npmjs.com/package/northveil-sdk) |
| **Python SDK Package** | `python-sdk/` | Native Python integration package (`import northveil`) | [Python Guide](sdk/README.md#2-python-38) |
| **Developer CLI Tool** | `cli/` | Multi-modular CLI with flight search, contract deploy & login | [npm: northveil-cli](https://www.npmjs.com/package/northveil-cli) |

---

## 🚀 Quick Installation

### Global Developer CLI
```bash
npx northveil-cli --help
# or install globally
npm install -g northveil-cli
```

### TypeScript / JavaScript SDK
```bash
npm install northveil-sdk
```

### Python Package
```bash
pip install northveil
```

---

## 🌐 Autonomous Travel & Dynamic Crypto Fares

Northveil features an **Autonomous Travel Engine** computing flight routes, airline schedules, and converting dynamic seat inventory directly into on-chain cryptocurrency fares (ETH, SOL, USDC, USDT) using live Coinpaprika market feeds:

```bash
# Search flights via CLI
northveil flights --from LHR --to JFK --class business --currency ETH

# Search hotels via CLI
northveil hotels --city Tokyo --currency ETH
```

---

## 🔒 Multi-Tenant Security & Tenant Isolation

- **Scoped API Keys**: Generated keys are bound to specific wallet addresses in Supabase DB.
- **Strict 403 Forbidden Guard**: Attempting to read or mutate another user's wallet without ownership is rejected at the gateway level.
- **Zero Credential Exposure**: Private keys and seed phrases are never returned in any response.

---

## 📄 License
MIT License © 2026 Northveil Protocol.
