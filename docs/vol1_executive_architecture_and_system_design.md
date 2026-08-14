# Northveil Technical Encyclopedia — Volume I: Executive Architecture & System Design

## 1. System Philosophy & Paradigm
Northveil is an autonomous decentralized execution platform designed to unite Artificial Intelligence (AI) agents with multi-chain decentralized finance (DeFi), smart contract infrastructure, and real-world commercial airline ticketing.

Traditional AI frameworks lack deterministic, cryptographically verifiable tools to interact with physical assets and decentralized ledgers. Northveil provides this execution backbone via:
1. **Model Context Protocol (MCP 2024-11-05)**: Standardized bidirectional interface for LLM reasoning engines.
2. **Deterministic Cryptographic Key Vaults**: NIST-compliant AES-256-GCM encrypted custodial storage.
3. **Autonomous Travel Routing**: Mathematical IATA flight and accommodation aggregation with live on-chain crypto pricing.
4. **Static AST Smart Contract Security Auditing**: Real-time bytecode analysis and exploit detection.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AI AGENT / DEVELOPER LAYER                       │
│  Claude Desktop • Cursor IDE • LangChain • Python • TypeScript • CLI        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ JSON-RPC 2.0 / SSE / REST
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NORTHVEIL PROTOCOL GATEWAY ENGINE                     │
│  ├── Multi-Tenant Scoped Auth & 403 Tenant Isolation Guard                  │
│  ├── Universal 38-Tool Execution Matrix                                     │
│  ├── Autonomous Travel Engine (IATA Matrix + Coinpaprika Live Feeds)        │
│  ├── AST Solidity Security Auditor & In-Memory Solc Compiler                │
│  └── Custodial Signing Engine (AES-256-GCM + Ethers.js)                     │
└──────────────┬───────────────────────┬───────────────────────┬──────────────┘
               │                       │                       │
               ▼                       ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌────────────────────┐
│   SUPABASE POSTGRESQL   │ │   36+ BLOCKCHAIN RPCS   │ │  COINPAPRIKA & GDS │
│  • Wallets & Key Vaults │ │  • Ethereum Mainnet     │ │  • Live Crypto     │
│  • Scoped API Keys      │ │  • Sepolia Testnet      │ │    Price Feeds     │
│  • pg_cron Keep-Alive   │ │  • Polygon, Arbitrum    │ │  • Global Airport  │
│  • RLS Access Controls  │ │  • Base, BSC, Solana    │ │    Directory       │
└─────────────────────────┘ └─────────────────────────┘ └────────────────────┘
```

## 2. Multi-Chain Interoperability Matrix (36+ Blockchains)
Northveil maintains active RPC provider mappings, native currency decimal definitions, and block explorer endpoints across 36+ decentralized networks:

| Network ID | Chain Name | Native Currency | Chain ID | Block Explorer URL |
|---|---|---|---|---|
| `ethereum` | Ethereum Mainnet | ETH (18 decimals) | 1 | `https://etherscan.io` |
| `sepolia` | Sepolia Testnet | SepoliaETH (18 dec) | 11155111 | `https://sepolia.etherscan.io` |
| `polygon` | Polygon PoS | POL/MATIC (18 dec) | 137 | `https://polygonscan.com` |
| `arbitrum` | Arbitrum One | ETH (18 decimals) | 42161 | `https://arbiscan.io` |
| `optimism` | Optimism Mainnet | ETH (18 decimals) | 10 | `https://optimistic.etherscan.io` |
| `base` | Base Mainnet | ETH (18 decimals) | 8453 | `https://basescan.org` |
| `bsc` | Binance Smart Chain | BNB (18 decimals) | 56 | `https://bscscan.com` |
| `avalanche` | Avalanche C-Chain | AVAX (18 decimals) | 43114 | `https://snowtrace.io` |
| `linea` | Linea Mainnet | ETH (18 decimals) | 59144 | `https://lineascan.build` |
| `zksync` | zkSync Era | ETH (18 decimals) | 324 | `https://era.zksync.network` |
| `scroll` | Scroll Mainnet | ETH (18 decimals) | 534352 | `https://scrollscan.com` |
| `solana` | Solana Mainnet | SOL (9 decimals) | 101 | `https://solscan.io` |
| `bitcoin` | Bitcoin Mainnet | BTC (8 decimals) | 0 | `https://mempool.space` |
