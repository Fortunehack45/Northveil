# 🚀 Northveil Complete Deployment & Hosting Guide

This guide explains how to deploy and publish all four components of the Northveil Ecosystem:
1. **The MCP Server & REST API** (Vercel / Railway / Render)
2. **The Webhooks Engine** (Serverless / Persistent Worker)
3. **The TypeScript SDK (`@northveil/sdk`)** (npm Registry)
4. **The Developer CLI (`@northveil/cli`)** (npm Registry)

---

## 🌐 1. Deploying the API & MCP Server to Vercel

You can deploy the API either from the **standalone MCP repository** or from the **main Northveil repository**.

### Option A: Standalone Deployment (`Fortunehack45/Northveil-MCP`)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the Git repository: **`Fortunehack45/Northveil-MCP`**.
3. In the **Environment Variables** section, add:
   ```env
   SUPABASE_URL=https://nshwovwvyqszdxgquwio.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ETHEREUM_SEPOLIA_RPC=https://rpc.sepolia.org
   PORT=3001
   ```
4. Click **Deploy**.
5. Once deployed, you will get a production URL like `https://northveil-mcp.vercel.app`.
6. Add your custom domain (e.g., `https://mcp.northveil.xyz`) in Vercel Settings -> Domains.

### Option B: Monorepo Deployment (`Fortunehack45/Northveil`)
- If deploying the main repository, Vercel will automatically host both the React frontend (`/`) and the Serverless API (`/api/*`, `/mcp`, `/health`, `/openapi.json`, `/sse`) using `vercel.json`.

---

## 📡 2. Hosting & Running the Webhooks Engine

The Webhook Engine is built directly into the MCP Server:
- **Serverless on Vercel**: Automatically triggers on incoming requests (`POST /api/v1/webhooks/test`) and generates cryptographic `X-Northveil-Signature: sha256=...` headers.
- **Dedicated Background Worker (Railway / Render / VPS)**:
  ```bash
  cd mcp-server
  npm install
  npm run build
  npm start
  ```

---

## 📦 3. Publishing the TypeScript SDK to npm (`@northveil/sdk`)

Publishing to the npm registry makes `@northveil/sdk` installable by developers worldwide via `npm install @northveil/sdk`:

```bash
cd sdk

# 1. Login to your npm account (one-time)
npm login

# 2. Build the TypeScript distribution
npm run build

# 3. Publish to the public npm registry
npm publish --access public
```

---

## 💻 4. Publishing the Developer CLI to npm (`@northveil/cli`)

Publishing to npm allows any developer to execute commands instantly with `npx @northveil/cli` without cloning the repository:

```bash
cd cli

# 1. Login to your npm account
npm login

# 2. Compile TypeScript
npm run build

# 3. Publish to npm
npm publish --access public
```

After publishing, anyone in the world can run:
```bash
npx @northveil/cli flights --from LHR --to JFK --date 2026-09-20
npx @northveil/cli hotels --city Tokyo
npx @northveil/cli status 7X9K2B
npx @northveil/cli audit ./contracts/MyToken.sol
```

---

## 🔄 Summary Matrix

| Component | Target Hosting / Registry | Deployment Command | Output / URL |
|---|---|---|---|
| **API & MCP Server** | Vercel Serverless | Connect Git to Vercel | `https://mcp.northveil.xyz` |
| **Developer CLI** | npm Registry | `npm publish --access public` | `npx @northveil/cli` |
| **TypeScript SDK** | npm Registry | `npm publish --access public` | `npm i @northveil/sdk` |
| **Webhooks** | Vercel / Node Daemon | Built into MCP Server | `/api/v1/webhooks` |
