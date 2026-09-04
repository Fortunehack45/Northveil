# Northveil Developer CLI — Universal Multi-Chain Web3 & Non-Custodial MPC Protocol

[![npm version](https://img.shields.io/npm/v/northveil-cli.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/northveil-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![NPM Downloads](https://img.shields.io/npm/dm/northveil-cli.svg?style=flat-square)](https://www.npmjs.com/package/northveil-cli)

The Official Developer CLI for the **Northveil Protocol** — Build decentralized applications, deploy smart contracts, stage non-custodial MPC transactions, query live real-time token valuations across 37+ blockchains, and connect autonomous AI agents via Model Context Protocol (MCP).

---

## 📦 Installation

Install globally via npm:
```bash
npm install -g northveil-cli
```

Or run on-demand via `npx`:
```bash
npx northveil-cli --help
```

---

## ⚡ Command Reference & Capabilities

### 1. Authentication & Developer Identity
```bash
# Authenticate CLI with your Northveil API Key
northveil login --key nv_live_...

# Inspect authenticated identity, permission tier, and bound wallets
northveil whoami

# Clear stored credentials
northveil logout
```

---

### 2. Multi-Chain Portfolio & Health Auditing
```bash
# Query live multi-chain balances and USD valuations across 37+ networks
northveil wallet 0xYOUR_WALLET_ADDRESS

# Perform automated gas sufficiency and asset diversification health checks
northveil health 0xYOUR_WALLET_ADDRESS
```

---

### 3. Real-Time Token Prices & Market Intelligence
```bash
# Fetch live real-time token prices with 24h market metrics
northveil prices ETH BTC SOL BNB USDC

# Discover trending high-volume tokens with automated safety and honeypot scores
northveil memecoins --chain all --limit 10
```

---

### 4. Non-Custodial MCP AI Tools & Intent Execution
```bash
# List all available MCP tools
northveil tools

# Execute an MCP tool via JSON-RPC 2.0
northveil call prepare_transfer '{"to":"0xRecipient","amount":"0.05","chain":"base"}'

# Inspect transaction / request status
northveil call get_transaction_status '{"requestId":"<REQUEST_ID>"}'

# Prepare a native or token transfer
northveil send --to 0xYOUR_WALLET_ADDRESS --amount 0.05 --token ETH --network base

# Prepare an optimal DEX swap
northveil swap --from ETH --to USDC --amount 0.1 --network base
```

---

### 5. Smart Contract Deployment & Minting
```bash
# Deploy ERC-721 NFT collection (Solc in-memory compilation)
northveil deploy --type erc721 --name "CyberApe NFT" --symbol "CAPE" --network sepolia

# Deploy ERC-20 token contract
northveil deploy --type erc20 --name "NorthToken" --symbol "NRT" --supply 1000000 --network sepolia

# Mint tokens from deployed contract
northveil mint --contract 0x... --amount 50000 --recipient 0x... --network sepolia
```

---

### 6. Contract Security & Honeypot Auditing
```bash
# Deep security analysis of a token contract (honeypots, buy/sell taxes, hidden owners)
northveil audit-token 0x... --chain ethereum

# Static AST vulnerability, backdoor, and reentrancy analysis on Solidity code
northveil audit ./contracts/MyToken.sol
```

---

### 7. MCP AI Server Configuration (Claude, Cursor, Windsurf)
```bash
# Generate MCP configuration for Claude Desktop
northveil mcp --claude

# Generate MCP configuration for Cursor IDE
northveil mcp --cursor

# Generate MCP configuration for Windsurf IDE
northveil mcp --windsurf
```

---

### 8. Project Scaffolding (`init`) & Server Health
```bash
# Scaffold a new Web3 dApp or autonomous agent project
northveil init my-web3-app --template dapp

# Check live Northveil Gateway and Supabase Database health
northveil server-health
```

---

## 📄 License
MIT License © 2026 Northveil Protocol.
