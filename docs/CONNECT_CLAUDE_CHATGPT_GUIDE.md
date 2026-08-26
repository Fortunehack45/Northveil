# 🚀 Zero-JSON Quickstart: Connecting Claude & ChatGPT to Northveil

You **do not need to create or edit any JSON files** to connect **Claude** or **ChatGPT** to Northveil! Follow these direct, click-by-click instructions.

---

## 🔑 1. How to View and Copy Your API Key

1. Open the Northveil Web Wallet.
2. Click on the **Agents** tab in the main navigation.
3. On any connected agent card (or inside the **Connect** modal), look for the **Agent API Key** box:
   - Click the 👁️ **Eye Icon** to unmask/reveal your API key.
   - Click the 📋 **Copy Icon** to copy your API key (`nv_live_...` or `nv_agent_...`).
4. You can use this API key for Claude headers or ChatGPT Custom Actions.

---

## 🤖 2. How to Connect Claude (Zero JSON File Required)

### Method A: 1-Click Terminal Command (Claude Code / Desktop)
Run this single command in your terminal:
```bash
claude mcp add northveil https://mcp.northveil.xyz/sse
```
*That's it! Claude will automatically register the server without touching any configuration files.*

---

### Method B: Claude Desktop UI Settings (No Config File)
1. Open **Claude Desktop**.
2. Click your **Profile Icon / Settings** &rarr; **Connectors / Developer**.
3. Click **Add MCP Server**.
4. Fill in the fields:
   - **Name**: `Northveil`
   - **Server URL**: `https://mcp.northveil.xyz/sse`
   - **Header Name**: `X-API-Key`
   - **Header Value**: *(Paste your API key from the Agents tab)*
5. Click **Save**! All 38 Web3 tools will load immediately with the 🔌 icon in your chats.

---

### Method C: Local CLI Runner (Optional)
If you prefer running via local Node.js:
```bash
claude mcp add northveil npx -y northveil-cli mcp
```

---

## 💬 3. How to Connect ChatGPT (Zero JSON File Required)

You can connect Northveil tools to ChatGPT in 60 seconds through Custom GPT Actions:

### Step 1: Open GPT Builder
1. Log in to [chatgpt.com](https://chatgpt.com).
2. In the left sidebar, click **Explore GPTs**.
3. Click **+ Create** (top right) and select the **Configure** tab.
4. Name your GPT `Northveil Vault Assistant`.

### Step 2: Import OpenAPI Actions (1-Click URL)
1. Scroll down to the **Actions** section and click **Create new action**.
2. Under **Schema**, click **Import from URL**.
3. Paste this exact URL:
   ```
   https://mcp.northveil.xyz/openapi.json
   ```
4. Click **Import**. ChatGPT will instantly parse and register all 35+ Web3 tools (transfers, DEX swaps, contract audits, portfolio tracking, token deployment).

### Step 3: Set Authentication (Choose One)

#### Option 1: OAuth 2.0 with Biometric Passkeys (Recommended)
- **Authentication Type**: `OAuth`
- **Client ID**: `chatgpt_client`
- **Client Secret**: `northveil_secret`
- **Authorization URL**: `https://mcp.northveil.xyz/oauth/authorize`
- **Token URL**: `https://mcp.northveil.xyz/oauth/token`
- **Scope**: `tools:read tools:execute`
- **Token Exchange Method**: `Default (POST request body)`

> **User Experience**: ChatGPT will display a **Log in with Northveil** button. Clicking it lets you sign in with your device biometric passkey (Touch ID / Face ID) and authorizes your Turnkey MPC vault!

#### Option 2: Direct API Key
- **Authentication Type**: `API Key`
- **Auth Type**: `Custom`
- **Custom Header Name**: `X-API-Key`
- **API Key**: *(Paste your API Key copied from the Northveil Agents tab)*

### Step 4: Save & Chat
1. Click **Save** in the top right (select *Only me* or *Anyone with link*).
2. Start chatting with your GPT!

---

## 🎯 4. Test Prompts to Try in Claude & ChatGPT

```markdown
- "Check my wallet portfolio and token balances across Ethereum, Base, and Sepolia using Northveil."
- "Get a quote to swap 0.05 ETH for USDC on Base, and prepare the execution request."
- "Audit the smart contract at 0x1139d423C1706BDeaD91f03507F521635591eD92 for honeypots or vulnerabilities."
- "What are the trending memecoins and real-time prices right now?"
- "Deploy an ERC20 token named QuantumToken with symbol QTM on Sepolia."
```

---

## 🛡️ 5. Non-Custodial Hardware MPC Safety

- **Read Operations** (balances, market prices, contract audits) execute instantly and autonomously.
- **Write Operations** (token transfers, swaps, deployments) generate a secure approval ticket.
- **Biometric Confirmation**: You approve write operations with Touch ID / Face ID via the Northveil Web App or Android App before any transaction broadcasts to the blockchain.
