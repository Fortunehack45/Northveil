# 🚀 NORTHVEIL — COMPLETE STEP-BY-STEP DEPLOYMENT GUIDE

> **Master Guide for Deploying the Website, MCP AI Server, REST API, Webhooks Engine, SDK, and Web Wallet App**

---

## 📋 Components to Deploy

| Component | What it Is | Deployment Target | Main Entry Files |
| :--- | :--- | :--- | :--- |
| 1. **Web Wallet** | Main React App (DEX, Transfers, Vault, Multi-Chain) | Vercel (Root `./`) | [`src/App.tsx`](file:///c:/Users/USER%20PC/Desktop/Northveil/src/App.tsx), [`index.html`](file:///c:/Users/USER%20PC/Desktop/Northveil/index.html) |
| 2. **MCP AI Server** | Model Context Protocol AI Endpoints (`/mcp`, `/sse`) | Vercel Serverless Function | [`api/index.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/api/index.ts) |
| 3. **Universal REST API** | JSON REST Endpoints (`/api/v1/*`, `/openapi.json`) | Vercel Serverless Function | [`api/index.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/api/index.ts) |
| 4. **Webhooks Engine** | Event Notification System | Vercel Serverless & Supabase | [`api/index.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/api/index.ts) |
| 5. **Documentation Website** | Neo-Brutalist Marketing & Docs Portal | Vercel (Subfolder `./website`) | [`website/src/App.tsx`](file:///c:/Users/USER%20PC/Desktop/Northveil/website/src/App.tsx) |
| 6. **TypeScript SDK** | Client Library for Developers (`@northveil/sdk`) | NPM Registry | [`src/sdk/northveil-sdk.ts`](file:///c:/Users/USER%20PC/Desktop/Northveil/src/sdk/northveil-sdk.ts) |

---

## 🔑 STEP 0: Prerequisites & Environment Variables

Before starting deployment, collect your API credentials:

### Required Credentials:
1. **Supabase Database Credentials**:
   - `SUPABASE_URL`: `https://ulkbchewsrksgvlbzjzl.supabase.co`
   - `SUPABASE_ANON_KEY`: Found in Supabase Dashboard ➔ Project Settings ➔ API.
2. **Web3 Provider Keys (Optional but Recommended)**:
   - `VITE_MORALIS_API_KEY`: For multi-chain ERC20/NFT indexing (from [moralis.io](https://moralis.io)).
   - `VITE_1INCH_API_KEY`: For DEX swap routing (from [1inch.dev](https://portal.1inch.dev)).

---

## 🛠️ STEP 1: Deploying the Web Wallet, MCP Server, REST API & Webhooks (Root Project)

The Web Wallet frontend, MCP AI server, REST API, and Webhook system are unified in the root directory and deploy together as **Project 1** on Vercel.

### Method A: Deploy via Vercel Dashboard (Browser)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub/GitLab account and select the **`Northveil`** repository.
3. Set **Project Name**: `northveil-app` (or your chosen name).
4. Set **Framework Preset**: `Vite`.
5. Set **Root Directory**: `./` (Leave as default root).
6. Expand **Environment Variables** and add:
   - `SUPABASE_URL` = `https://ulkbchewsrksgvlbzjzl.supabase.co`
   - `SUPABASE_ANON_KEY` = `<YOUR_SUPABASE_ANON_KEY>`
   - `VITE_SUPABASE_URL` = `https://ulkbchewsrksgvlbzjzl.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<YOUR_SUPABASE_ANON_KEY>`
   - `VITE_MORALIS_API_KEY` = `<YOUR_MORALIS_KEY>`
   - `VITE_1INCH_API_KEY` = `<YOUR_1INCH_KEY>`
7. Click **Deploy**.

### Method B: Deploy via Vercel CLI (Terminal)
Run these commands from your project root:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to Production
vercel --prod
```

### ✅ What is Live After Step 1?
- **Web Wallet UI**: `https://northveil-app.vercel.app`
- **MCP JSON-RPC AI Endpoint**: `https://northveil-app.vercel.app/mcp`
- **MCP SSE Event Stream**: `https://northveil-app.vercel.app/sse`
- **OpenAPI 3.0 Spec**: `https://northveil-app.vercel.app/openapi.json`
- **REST API Endpoints**: `https://northveil-app.vercel.app/api/v1/*`
- **Webhooks Listener**: `https://northveil-app.vercel.app/api/v1/webhook`
- **Interactive UI Widget**: `https://northveil-app.vercel.app/ui/widget`

---

## ⚡ STEP 1B: Standalone MCP Server Deployment (Recommended for Subdomains like `mcp.northveil.xyz`)

To completely isolate the MCP server from static web assets and prevent any SPA catch-all rewrite collisions, deploy `./mcp-server` as a separate, dedicated project on Vercel or Render.

### Steps to Deploy Standalone MCP Server on Vercel:
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the **`Northveil`** repository again as a new project.
3. Set **Project Name**: `northveil-mcp` (or custom domain `mcp.northveil.xyz`).
4. Set **Framework Preset**: `Other`.
5. Set **Root Directory**: Click **Edit** and select **`mcp-server`**.
6. Set **Environment Variables**:
   - `SUPABASE_URL` = `https://ulkbchewsrksgvlbzjzl.supabase.co`
   - `SUPABASE_ANON_KEY` = `<YOUR_SUPABASE_ANON_KEY>`
7. Click **Deploy**.

### ✅ Standalone MCP URLs:
- **MCP Server Base URL**: `https://mcp.northveil.xyz` (or `https://northveil-mcp.vercel.app`)
- **SSE Connection URL**: `https://mcp.northveil.xyz/sse`
- **Health Check**: `https://mcp.northveil.xyz/health`
- **OpenAPI 3.0 Spec**: `https://mcp.northveil.xyz/openapi.json`

> 💡 **Pro-Tip**: In your Web Wallet project (`northveil-app`), add environment variable `VITE_MCP_SERVER_URL=https://mcp.northveil.xyz`. All wallet UI components, copy buttons, and test connection triggers will automatically point to your dedicated standalone MCP server!

---

## 🌐 STEP 2: Deploying the Marketing & Documentation Website

The documentation portal resides in `./website` and deploys as **Project 2** on Vercel.

### Method A: Deploy via Vercel Dashboard (Browser)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select the **same `Northveil` repository**.
3. Set **Project Name**: `northveil-docs` (or `northveil-website`).
4. Set **Framework Preset**: `Vite`.
5. Set **Root Directory**: Click **Edit** and select **`website`**.
6. Expand **Environment Variables** and add:
   - `VITE_MCP_SERVER_URL` = `https://northveil-app.vercel.app` (Your Step 1 deployment URL)
7. Click **Deploy**.

### Method B: Deploy via Vercel CLI (Terminal)
```bash
# Navigate to website directory and deploy
cd website
vercel --prod
```

### ✅ What is Live After Step 2?
- **Documentation Website**: `https://northveil-docs.vercel.app`
- **Interactive API/MCP Docs**: `https://northveil-docs.vercel.app/docs`
- **Terms of Service**: `https://northveil-docs.vercel.app/terms`
- **Privacy Policy**: `https://northveil-docs.vercel.app/privacy`

---

## 📦 STEP 3: Publishing the SDK (`@northveil/sdk`) to NPM

The Northveil TypeScript SDK allows third-party developers to interact with your MCP server programmatically.

### Steps to Publish:

1. **Verify Package Manifest**:
   Check `src/sdk/package.json`:
   ```json
   {
     "name": "@northveil/sdk",
     "version": "1.0.0",
     "main": "dist/index.js",
     "types": "dist/index.d.ts"
   }
   ```

2. **Login to NPM**:
   ```bash
   npm login
   ```

3. **Build & Publish**:
   ```bash
   # Navigate to SDK source directory
   cd src/sdk

   # Compile TypeScript
   npx tsc

   # Publish to public NPM registry
   npm publish --access public
   ```

4. **Developer Installation Usage**:
   ```bash
   npm install @northveil/sdk
   ```
   ```typescript
   import { NorthveilSDK } from '@northveil/sdk';
   const sdk = new NorthveilSDK({ apiKey: 'nv_live_...' });
   ```

---

## 🔔 STEP 4: Configuring Webhook Listeners

Northveil dispatches automated webhooks whenever fund transfers, swaps, or smart contract deployments occur.

### Setting Up Webhook Subscriptions:

1. **Register Your Webhook Receiver URL**:
   Send a `POST` request to your live REST API:
   ```bash
   curl -X POST https://northveil-app.vercel.app/api/v1/webhooks/subscribe \
     -H "Content-Type: application/json" \
     -H "X-API-Key: YOUR_NORTHVEIL_API_KEY" \
     -d '{
       "url": "https://your-backend.com/webhook-listener",
       "events": ["tx.confirmed", "swap.executed", "contract.deployed"]
     }'
   ```

2. **Incoming Webhook Payload Structure**:
   Your server receives POST notifications formatted as:
   ```json
   {
     "event": "tx.confirmed",
     "walletAddress": "0x1111111111111111111111111111111111111111",
     "txHash": "0x8f2d...",
     "amount": 0.5,
     "tokenSymbol": "ETH",
     "timestamp": "2026-08-04T21:00:00.000Z"
   }
   ```

---

## 🤖 STEP 5: Connecting AI Agents (Claude, Cursor, Windsurf, Claude Code, Devin)

Once deployed, connect your MCP server to your AI tools and IDEs:

### A. Claude Desktop Integration (`claude_desktop_config.json`)
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "northveil": {
      "command": "npx",
      "args": ["-y", "northveil-cli", "mcp"],
      "env": {
        "NORTHVEIL_WALLET_ADDRESS": "0x1111111111111111111111111111111111111111",
        "NORTHVEIL_API_URL": "https://mcp.northveil.xyz"
      }
    }
  }
}
```

### B. Cursor IDE (`.cursor/mcp.json` or Settings -> MCP)
```json
{
  "mcpServers": {
    "northveil": {
      "command": "npx",
      "args": ["-y", "northveil-cli", "mcp"],
      "env": {
        "NORTHVEIL_WALLET_ADDRESS": "0x1111111111111111111111111111111111111111"
      }
    }
  }
}
```

### C. Windsurf Editor (`~/.codeium/windsurf/mcp_config.json`)
```json
{
  "mcpServers": {
    "northveil": {
      "command": "npx",
      "args": ["-y", "northveil-cli", "mcp"]
    }
  }
}
```

### D. Claude Code CLI
```bash
claude mcp add northveil npx -y northveil-cli mcp
```

### E. Remote Server-Sent Events (SSE) Transport
- **Transport**: `SSE`
- **URL**: `https://mcp.northveil.xyz/sse?wallet_address=0x1111111111111111111111111111111111111111`
- **Headers**: `Authorization: Bearer YOUR_API_KEY`

---

## 🔍 STEP 6: Verification Checklist

| Service | Test Command / URL | Expected Result |
| :--- | :--- | :--- |
| **Health Check** | `GET https://northveil-app.vercel.app/health` | `{"status":"ONLINE"...}` |
| **OpenAPI Spec** | `GET https://northveil-app.vercel.app/openapi.json` | Valid OpenAPI 3.0 Spec |
| **MCP Tools List** | `POST https://northveil-app.vercel.app/mcp` | List of 10 MCP Tools |
| **Interactive Widget** | `GET https://northveil-app.vercel.app/ui/widget` | Live HTML Widget |
| **Marketing Website** | `GET https://northveil-docs.vercel.app` | Neo-Brutalist Portal |
