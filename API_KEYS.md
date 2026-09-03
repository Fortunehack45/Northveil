# Northveil Environment & Credential Configuration

This document outlines required environment variables for running the Northveil Non-Custodial Control Plane and Wallet interfaces. All secrets must be provided via runtime environment variables and never committed to source control.

---

## 1. Supabase Database Configuration

| Parameter | Key | Description |
| :--- | :--- | :--- |
| **Supabase URL** | `SUPABASE_URL` / `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| **Supabase Anon Key** | `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | Public client token for client app |
| **Supabase Service Role Key** | `SUPABASE_SERVICE_ROLE_KEY` | Server-side elevated key (MCP server runtime only) |

---

## 2. Agent Client Credentials

| Key Identifier | Placeholder Format | Description |
| :--- | :--- | :--- |
| **Northveil Client Key** | `YOUR_NORTHVEIL_CLIENT_KEY` (`nv_live_...`) | Scoped client key generated on `wallet.northveil.xyz` |

---

## 3. On-Chain RPC Providers

| Chain / Network | Environment Variable | RPC Endpoint URL |
| :--- | :--- | :--- |
| **Ethereum Mainnet** | `ETH_RPC_URL` | `https://cloudflare-eth.com` |
| **Sepolia Testnet** | `SEPOLIA_RPC_URL` | `https://ethereum-sepolia-rpc.publicnode.com` |
| **Base Mainnet** | `BASE_RPC_URL` | `https://mainnet.base.org` |
| **Polygon Mainnet** | `POLYGON_RPC_URL` | `https://polygon-rpc.com` |
| **Solana Mainnet** | `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` |

---

## 4. Environment Template (`.env.example`)

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
PORT=3001
NODE_ENV=production
```
