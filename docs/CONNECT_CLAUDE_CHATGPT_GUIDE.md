# 🚀 Complete Connection Guide: Connecting AI Agents to Northveil MCP

Northveil provides a non-custodial Model Context Protocol (MCP) gateway that allows AI models (Claude.ai Web, Claude Desktop, ChatGPT, Cursor, Windsurf, Claude Code, AutoGPT, LangChain) to operate wallets with hardware-grade security and WebAuthn Biometric Passkey approval.

---

## 🌐 Official MCP Server Endpoints & Metadata

| Resource | URL | Transport / Format |
| :--- | :--- | :--- |
| **Streamable HTTP Gateway (Recommended)** | `https://mcp.northveil.xyz/mcp` | JSON-RPC 2.0 / Streamable HTTP |
| **Remote SSE Gateway** | `https://mcp.northveil.xyz/sse` | Server-Sent Events (SSE) |
| **OpenAPI 3.0 Specification** | `https://mcp.northveil.xyz/openapi.json` | JSON Schema / REST |
| **OAuth 2.0 Authorization Server** | `https://mcp.northveil.xyz/.well-known/oauth-authorization-server` | RFC 8414 Metadata |
| **OAuth 2.0 Protected Resource** | `https://mcp.northveil.xyz/.well-known/oauth-protected-resource` | RFC 9728 Metadata |
| **Official Server Logo** | `https://iili.io/CDS9fvn.png` | Direct Binary PNG (High-Res) |
| **Health Check** | `https://mcp.northveil.xyz/health` | JSON Health Probe |

---

## 🤖 1. Connecting Claude.ai Web & Mobile App (Custom Connector)

Claude.ai now supports custom MCP connectors directly in your browser and mobile apps:

1. Open [Claude.ai](https://claude.ai) or the Claude iOS/Android app.
2. Click your **Profile Icon** (bottom left) &rarr; **Settings** &rarr; **Connectors**.
3. Click **Add custom connector**.
4. Configure connector parameters:
   - **Name**: `Northveil`
   - **Connector URL (Option A - Streamable HTTP, Recommended)**:
     ```text
     https://mcp.northveil.xyz/mcp
     ```
   - **Connector URL (Option B - SSE with Target Wallet)**:
     ```text
     https://mcp.northveil.xyz/sse?wallet_address=0xYOUR_WALLET_ADDRESS
     ```
5. Click **Connect**! Claude will automatically discover all 60 tools, load the official Northveil logo, and enable on-chain intelligence across your chats.

---

## 💻 2. Connecting Claude Desktop

### Option A: 1-Click Terminal Command (Fastest)
Run this single command in your terminal:
```bash
claude mcp add northveil https://mcp.northveil.xyz/mcp
```
*Claude Desktop automatically registers the Streamable HTTP gateway.*

---

### Option B: Claude Desktop UI Settings
1. Open **Claude Desktop**.
2. Click **Settings** (or Avatar) &rarr; **Connectors / Developer**.
3. Click **Add MCP Server**.
4. Configure:
   - **Name**: `Northveil`
   - **Server URL**: `https://mcp.northveil.xyz/mcp` (or `https://mcp.northveil.xyz/sse`)
5. Click **Save**.

---

### Option C: `claude_desktop_config.json`
Add Northveil to your configuration file:
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
        "NORTHVEIL_WALLET_ADDRESS": "0xYOUR_WALLET_ADDRESS",
        "NORTHVEIL_API_URL": "https://mcp.northveil.xyz"
      }
    }
  }
}
```

---

## 🎯 3. Connecting Cursor IDE & Windsurf

### Cursor IDE
1. Open your workspace and create `.cursor/mcp.json` (or **Settings** &rarr; **Features** &rarr; **MCP Servers** &rarr; **Add New MCP Server**).
2. Paste the configuration:
```json
{
  "mcpServers": {
    "northveil": {
      "url": "https://mcp.northveil.xyz/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_NORTHVEIL_CLIENT_KEY",
        "x-wallet-address": "0xYOUR_WALLET_ADDRESS"
      }
    }
  }
}
```
3. Mention `@northveil` in agent chat to execute live smart contract audits, portfolio inspection, and transactions.

### Windsurf
Add the snippet above to `~/.codeium/windsurf/mcp_config.json`.

---

## ⚡ 4. Connecting Claude Code (Terminal Assistant)

Run:
```bash
claude mcp add northveil https://mcp.northveil.xyz/mcp
```
Then launch:
```bash
claude
```

---

## 🧠 5. Connecting OpenAI ChatGPT (Custom GPT Action)

1. Open ChatGPT &rarr; **Explore GPTs** &rarr; **Create a GPT** &rarr; **Configure** &rarr; **Actions** &rarr; **Create new action**.
2. Click **Import from URL**, paste:
   ```text
   https://mcp.northveil.xyz/openapi.json
   ```
3. Under **Authentication**:
   - **Type**: `OAuth`
   - **Client ID**: `chatgpt_agent`
   - **Client Secret**: `northveil_secret`
   - **Authorization URL**: `https://mcp.northveil.xyz/oauth/authorize`
   - **Token URL**: `https://mcp.northveil.xyz/oauth/token`
   - **Scope**: `tools:read tools:execute`
4. Click **Save**!
