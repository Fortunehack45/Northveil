# 🚀 Complete Connection Guide: Connecting AI Agents to Northveil MCP

Northveil provides a non-custodial Model Context Protocol (MCP) gateway that allows AI models (Claude, ChatGPT, Cursor, Windsurf, Claude Code, AutoGPT, LangChain) to operate wallets with hardware-grade security and WebAuthn Biometric Passkey approval.

---

## 🔑 1. How to View and Copy Your API Key

1. Open the Northveil Web Wallet (`http://localhost:3001` or `https://northveil.xyz`).
2. Click on the **Agents** tab in the main navigation.
3. Locate the **Agent API Key** container on your agent card:
   - Click the 👁️ **Eye Icon** to unmask/reveal your API key.
   - Click the 📋 **Copy Icon** to copy your API key (`nv_live_...` or `nv_agent_...`).
4. You can use this API key for Claude headers, Cursor settings, or ChatGPT Custom Actions.

---

## 🤖 2. Connecting Claude Desktop

### Option A: Zero-JSON 1-Click Terminal Command (Fastest)
Run this single command in your terminal:
```bash
claude mcp add northveil https://mcp.northveil.xyz/sse
```
*Claude will automatically register the remote SSE server without touching any configuration files.*

---

### Option B: Claude Desktop UI Settings (No Config File Editing)
1. Open **Claude Desktop**.
2. Click your **Profile Icon / Settings** &rarr; **Connectors / Developer**.
3. Click **Add MCP Server**.
4. Configure the server:
   - **Name**: `Northveil`
   - **Server URL**: `https://mcp.northveil.xyz/sse` (or `http://localhost:3001/sse` for local dev)
   - **Header Name**: `X-API-Key`
   - **Header Value**: *(Paste your API key from the Agents tab)*
5. Click **Save**! All 18 canonical Web3 tools load immediately with the 🔌 icon in your chats.

---

### Option C: `claude_desktop_config.json` Configuration File
Add Northveil to your Claude configuration file:
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
        "NORTHVEIL_WALLET_ADDRESS": "0xYourWalletAddressHere",
        "NORTHVEIL_API_URL": "https://mcp.northveil.xyz"
      }
    }
  }
}
```

---

## 💻 3. Connecting Cursor IDE & Windsurf

### Cursor IDE
1. Open your workspace and create `.cursor/mcp.json` (or open **Cursor Settings** &rarr; **Features** &rarr; **MCP Servers** &rarr; **Add New MCP Server**).
2. Paste the configuration:
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
3. In Cursor Composer or Chat, mention `@northveil` to execute on-chain tools.

### Windsurf
Open `~/.codeium/windsurf/mcp_config.json` and paste the snippet above.

---

## ⚡ 4. Connecting Claude Code (Terminal Assistant)

Run this single command in your terminal:
```bash
claude mcp add northveil npx -y northveil-cli mcp
```
Then start Claude Code:
```bash
claude
```
Claude Code will automatically detect and invoke Northveil tools for on-chain intelligence.

---

## 💬 5. Connecting ChatGPT (Custom GPT Actions)

### Step 1: Open GPT Builder
1. Log in to [chatgpt.com](https://chatgpt.com).
2. In the left sidebar, click **Explore GPTs** &rarr; **+ Create** &rarr; select **Configure**.
3. Name your GPT `Northveil Autonomous Assistant`.

### Step 2: Import OpenAPI Actions (1-Click URL)
1. Scroll down to **Actions** &rarr; Click **Create new action**.
2. Under **Schema**, click **Import from URL**.
3. Paste:
   ```
   https://mcp.northveil.xyz/openapi.json
   ```
4. Click **Import**. ChatGPT will register all tools.

### Step 3: Configure Authentication
- **OAuth 2.0 (Biometric Passkeys)**:
  - Authorization URL: `https://mcp.northveil.xyz/oauth/authorize`
  - Token URL: `https://mcp.northveil.xyz/oauth/token`
  - Scope: `tools:read tools:execute`
  - Client ID: `chatgpt_client`
  - Client Secret: `northveil_secret`
- **Or API Key**: Custom Header `X-API-Key` with your Northveil API Key.

---

## 📡 6. Connecting Python, LangChain, LlamaIndex, & AutoGPT

Connect directly to the Server-Sent Events (SSE) endpoint:
```python
from mcp import ClientSession, SseServerTransport

async with SseServerTransport("https://mcp.northveil.xyz/sse?wallet_address=0xYourAddress") as transport:
    async with ClientSession(transport.read_stream, transport.write_stream) as session:
        await session.initialize()
        tools = await session.list_tools()
        print("Connected Northveil tools:", [t.name for t in tools])

        # Execute balance check
        balances = await session.call_tool("northveil_get_balances", {"network": "sepolia"})
        print("On-Chain Balances:", balances)
```

---

## 🛡️ 7. Non-Custodial Transaction Lifecycle & Signing Ceremony

1. **Step 1: Unsigned Transaction Preparation**:
   - When your AI agent calls `northveil_prepare_transfer`, `northveil_prepare_swap`, `northveil_prepare_deploy`, or `POST /api/v1/transactions/prepare`:
   - The Policy Engine validates the transaction parameters against your grant.
   - It computes the exact nonce and gas parameters, performing a dry-run fork simulation (`northveil_simulate_tx`).
   - It returns a single-use approval token (`tok_...`), unique `requestId`, and the unsigned serialized transaction.
2. **Step 2: Client-Side Cryptographic Signing**:
   - In the Northveil Wallet UI (**Approvals** tab) or via local client SDK / CLI:
   - You review the exact recipient, amount, fee in USD, and security check.
   - Your device prompts for **Touch ID / Face ID / Windows Hello** (WebAuthn Passkey) or Hardware Wallet signature.
   - **Zero private keys ever touch the Northveil servers.**
3. **Step 3: Signature Verification & Relayer Broadcast**:
   - The client calls `northveil_request_broadcast` or `POST /api/v1/transactions/broadcast` with the signed payload.
   - Northveil cryptographically validates the recovered signer against the authorized vault address and broadcasts the raw transaction on-chain.
   - You receive an instant block explorer confirmation link!

