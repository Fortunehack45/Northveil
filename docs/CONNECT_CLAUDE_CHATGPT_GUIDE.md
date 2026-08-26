# 🌐 Complete Step-by-Step Guide: Connecting ChatGPT & Claude to Northveil

This comprehensive guide walks you through connecting **Claude Desktop**, **Claude Code**, **ChatGPT Custom Actions / GPTs**, **Cursor IDE**, and **Windsurf** to the Northveil Model Context Protocol (MCP) gateway.

---

## 🛡️ How Northveil Security Works with AI Agents

Northveil uses a **Non-Custodial Turnkey Hardware MPC + WebAuthn Passkey** architecture:
- **Read-Only Autonomy**: AI agents can freely inspect wallet balances, token prices, market trends, smart contract safety scores, and flight/hotel schedules.
- **Hardware Gated Confirmation**: Whenever an AI agent attempts a write operation (e.g. transfer, DEX token swap, contract deployment, autonomous scope configuration), it generates a cryptographic approval ticket.
- **Biometric Signature**: You authorize the action with your device biometric passkey (Touch ID, Face ID, Windows Hello) via the web wallet dashboard or Android mobile app.

---

## 🤖 1. Claude Desktop Setup (Full Step-by-Step)

### Option A: Local Command via `npx` (Recommended)

1. **Locate your configuration file**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Paste the following JSON block** into your configuration file:
   ```json
   {
     "mcpServers": {
       "northveil": {
         "command": "npx",
         "args": ["-y", "northveil-cli", "mcp"],
         "env": {
           "NORTHVEIL_WALLET_ADDRESS": "0xYourWalletAddressHere",
           "NORTHVEIL_API_URL": "https://mcp.northveil.xyz"
         }
       }
     }
   }
   ```

3. **Save the file and completely restart Claude Desktop**.
4. Click the 🔌 hammer icon in the bottom right corner of Claude Desktop. You will see **38 Northveil Tools** loaded and ready!

---

### Option B: Remote Hosted Server-Sent Events (SSE)

If you prefer connecting without local Node.js execution:
```json
{
  "mcpServers": {
    "northveil": {
      "url": "https://mcp.northveil.xyz/sse?wallet_address=0xYourWalletAddressHere",
      "headers": {
        "X-API-Key": "nv_live_your_api_key_from_agents_tab"
      }
    }
  }
}
```

---

## 💻 2. Claude Code CLI Setup

1. In your terminal, run:
   ```bash
   claude mcp add northveil npx -y northveil-cli mcp
   ```
2. Or add the remote hosted endpoint:
   ```bash
   claude mcp add northveil https://mcp.northveil.xyz/sse
   ```
3. Start Claude Code:
   ```bash
   claude
   ```
4. Claude Code will automatically discover Northveil tools for on-chain queries and contract auditing.

---

## 💬 3. ChatGPT Custom Actions & GPTs Setup (Full Step-by-Step)

You can connect Northveil tools directly to ChatGPT Plus / Team / Enterprise via Custom GPT Actions.

### Step 1: Open GPT Builder
1. Log in to [chatgpt.com](https://chatgpt.com).
2. Click **Explore GPTs** in the sidebar.
3. Click **+ Create** (top right) and switch to the **Configure** tab.
4. Set Name to `Northveil Web3 Vault` and Description to `Autonomous Web3 & DeFi Assistant`.

### Step 2: Create New Action
1. Scroll down to the **Actions** section and click **Create new action**.
2. Under **Schema**, click **Import from URL**.
3. Enter the OpenAPI specification URL:
   ```
   https://mcp.northveil.xyz/openapi.json
   ```
   *(For local development, use `http://localhost:3001/openapi.json`)*
4. Click **Import**. ChatGPT will parse and populate all 35+ REST and Web3 action endpoints.

### Step 3: Configure Authentication

#### Method A: OAuth 2.0 with Biometric Passkeys (Recommended)
- **Authentication Type**: `OAuth`
- **Client ID**: `chatgpt_client`
- **Client Secret**: `northveil_oauth_secret`
- **Authorization URL**: `https://mcp.northveil.xyz/oauth/authorize`
- **Token URL**: `https://mcp.northveil.xyz/oauth/token`
- **Scope**: `tools:read tools:execute`
- **Token Exchange Method**: `Default (POST request body)`

> **User Experience**: When you talk to your GPT, ChatGPT will present a "Log in with Northveil" button. Clicking it takes you to the Northveil OAuth consent screen, which verifies your biometric passkey and binds your Turnkey MPC vault.

#### Method B: API Key Header
- **Authentication Type**: `API Key`
- **Auth Type**: `Custom`
- **Custom Header Name**: `X-API-Key`
- **API Key**: Copy your key from the Northveil Web Wallet &rarr; **Agents** tab &rarr; **API Keys**.

### Step 4: Publish and Save
1. Click **Save** (or **Update**) in the top right.
2. Select **Only me** or **Anyone with a link**.

---

## ⚡ 4. ChatGPT Developer Mode / Streamable HTTP (`/mcp`)

If using an MCP-compatible ChatGPT desktop connector or developer runtime:
- **Server URL**: `https://mcp.northveil.xyz/mcp`
- **Discovery Endpoint**: `GET https://mcp.northveil.xyz/.well-known/oauth-protected-resource`
- **Protocol**: JSON-RPC 2.0 over HTTP POST

---

## 🛠️ 5. Cursor IDE & Windsurf Setup

### Cursor IDE
1. Open Cursor.
2. Go to **Settings** &rarr; **Features** &rarr; **MCP Servers** &rarr; **+ Add New MCP Server**.
3. Name: `Northveil`
4. Type: `command`
5. Command:
   ```bash
   npx -y northveil-cli mcp
   ```
6. Alternatively, create `.cursor/mcp.json` in your workspace:
   ```json
   {
     "mcpServers": {
       "northveil": {
         "command": "npx",
         "args": ["-y", "northveil-cli", "mcp"],
         "env": {
           "NORTHVEIL_WALLET_ADDRESS": "0xYourWalletAddressHere"
         }
       }
     }
   }
   ```

### Windsurf (Codeium)
Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "northveil": {
      "command": "npx",
      "args": ["-y", "northveil-cli", "mcp"],
      "env": {
        "NORTHVEIL_WALLET_ADDRESS": "0xYourWalletAddressHere"
      }
    }
  }
}
```

---

## 🎯 6. Example Prompts to Test Your Connection

Once connected to Claude or ChatGPT, try these sample prompts:

```markdown
1. "Check my wallet portfolio and token balances across Ethereum, Base, and Sepolia using Northveil."

2. "Get a quote to swap 0.05 ETH for USDC on Base, and prepare the execution request."

3. "Audit the smart contract at 0x1139d423C1706BDeaD91f03507F521635591eD92 for security vulnerabilities and honeypots."

4. "Check live crypto prices for ETH, BTC, and SOL."

5. "Deploy an ERC20 token named AlphaToken with symbol ALP and total supply 1,000,000 on Sepolia."
```

---

## ❓ Troubleshooting & FAQs

- **Q: Claude Desktop doesn't show any tools.**
  - **A**: Ensure you saved `claude_desktop_config.json` in the correct directory and restarted Claude Desktop completely (Quit from menu bar / tray).
- **Q: ChatGPT says "Could not parse OpenAPI schema".**
  - **A**: Ensure you import from `https://mcp.northveil.xyz/openapi.json`. Check that the server is reachable.
- **Q: How do I approve transactions that Claude or ChatGPT stages?**
  - **A**: Open the Northveil Web App or Android App &rarr; click on **Approvals** &rarr; verify the transaction details &rarr; confirm with your Touch ID / Face ID passkey.
