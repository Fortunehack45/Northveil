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
     "walletAddress": "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417",
     "txHash": "0x8f2d...",
     "amount": 0.5,
     "tokenSymbol": "ETH",
     "timestamp": "2026-08-04T21:00:00.000Z"
   }
   ```

---

## 🤖 STEP 5: Connecting AI Agents (Claude, Cursor, Devin)

Once deployed, connect your live Vercel URL to your AI tools:

### A. Claude Desktop Integration (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "northveil": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch",
        "https://northveil-app.vercel.app/mcp"
      ]
    }
  }
}
```

### B. Cursor / Windsurf / Devin (SSE Connection)
- **Transport**: `SSE`
- **URL**: `https://northveil-app.vercel.app/sse`
- **Headers**: `X-API-Key: YOUR_API_KEY`

---

## 🔍 STEP 6: Verification Checklist

| Service | Test Command / URL | Expected Result |
| :--- | :--- | :--- |
| **Health Check** | `GET https://northveil-app.vercel.app/health` | `{"status":"ONLINE"...}` |
| **OpenAPI Spec** | `GET https://northveil-app.vercel.app/openapi.json` | Valid OpenAPI 3.0 Spec |
| **MCP Tools List** | `POST https://northveil-app.vercel.app/mcp` | List of 10 MCP Tools |
| **Interactive Widget** | `GET https://northveil-app.vercel.app/ui/widget` | Live HTML Widget |
| **Marketing Website** | `GET https://northveil-docs.vercel.app` | Neo-Brutalist Portal |
