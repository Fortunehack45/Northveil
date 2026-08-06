
# 🔑 NORTHVEIL API KEYS & CREDENTIALS DIRECTORY

This document contains all API keys, environment variables, Supabase Cloud database credentials, Web3 RPC endpoints, and Northveil MCP AI keys used across the Northveil project.

---

## 1. 🌐 Web3 Data & DEX Aggregator API Keys

| Service | Environment Variable | Public / Test Key | Description |
| :--- | :--- | :--- | :--- |
| **Moralis Web3 Data API** | `VITE_MORALIS_API_KEY` | `mIOzSC9sFGkekzPRY99n5fjvxrc5bhKF` *(or register at [moralis.io](https://moralis.io))* | Fetches real-time ERC-20 token balances, NFT metadata, and EVM transaction history |
| **1inch DEX Aggregator** | `VITE_1INCH_API_KEY` | `mIOzSC9sFGkekzPRY99n5fjvxrc5bhKF` *(or register at [portal.1inch.dev](https://portal.1inch.dev))* | Provides live 1inch v6 swap quotes and cross-chain routing for EVM networks |
| **Jupiter Solana Aggregator** | *No Key Required* | `https://quote-api.jup.ag/v6` | Live Solana DEX swap router & quotes |
| **Coinpaprika Market API** | *No Key Required* | `https://api.coinpaprika.com/v1` | Live crypto market ticker prices & 24h metrics |
| **Blockscout EVM Indexer** | *No Key Required* | `https://eth.blockscout.com/api/v2` | Open zero-key EVM indexer for Ethereum, Polygon, Arbitrum & Base |

---

## 2. ⚡ Supabase Cloud Database Credentials

| Parameter | Key / Value | Description |
| :--- | :--- | :--- |
| **Supabase Project Ref** | `ulkbchewsrksgvlbzjzl` | Northveil Production Database Project |
| **Supabase URL** | `VITE_SUPABASE_URL` = `https://ulkbchewsrksgvlbzjzl.supabase.co`<br>`SUPABASE_URL` = `https://ulkbchewsrksgvlbzjzl.supabase.co` | Database REST & Realtime URL |
| **Supabase Anon Key** | `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA`<br>`SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA` | Client & Server DB Auth Token |

---

## 3. 🤖 Northveil MCP Server & AI Keys

| Key Identifier | Raw Key Value | Owner Wallet / Purpose |
| :--- | :--- | :--- |
| **Northveil Live Key 1** | `nv_live_9f82a17b09c82415d8a9` | Primary Production AI Key (Auto-bound to active wallet) |
| **Northveil Test Key** | `nv_test_7a12b99c43d21100e45b` | Sandbox & Testnet Testing Key |
| **Northveil Default Key** | `nv_live_default_northveil_key` | Fallback Public Demo Key |
| **OAuth 2.0 Client ID** | `northveil_ai_client` | Claude Web & Custom GPT Handshake Client ID |
| **OAuth 2.0 Client Secret** | `northveil_ai_secret` | Claude Web & Custom GPT Handshake Client Secret |

---

## 4. 🌐 Real On-Chain RPC Node Endpoints

| Chain / Network | Environment Variable | RPC Endpoint URL |
| :--- | :--- | :--- |
| **Ethereum Mainnet** | `ETH_RPC_URL` | `https://cloudflare-eth.com` |
| **Sepolia Testnet** | `SEPOLIA_RPC_URL` | `https://ethereum-sepolia-rpc.publicnode.com` |
| **Polygon Mainnet** | `POLYGON_RPC_URL` | `https://polygon-rpc.com` |
| **Solana Mainnet** | `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` |

---

## 5. 🤖 Google Gemini AI Studio Credentials

| Service | Environment Variable | Value | Description |
| :--- | :--- | :--- | :--- |
| **Google Gemini AI API** | `GEMINI_API_KEY` | Managed via Google AI Studio Secrets Panel | Used for smart contract AI audits, transaction explainers, and natural language trading assistant |

---

## 📋 Vercel Environment Variables (`.env` Copy-Paste Block)

Paste this block into **Vercel Project Settings $\rightarrow$ Environment Variables**:

```env
VITE_SUPABASE_URL=https://ulkbchewsrksgvlbzjzl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA
SUPABASE_URL=https://ulkbchewsrksgvlbzjzl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA
VITE_MORALIS_API_KEY=mIOzSC9sFGkekzPRY99n5fjvxrc5bhKF
VITE_1INCH_API_KEY=mIOzSC9sFGkekzPRY99n5fjvxrc5bhKF
ETH_RPC_URL=https://cloudflare-eth.com
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```
