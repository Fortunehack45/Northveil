# Northveil Universal Model Context Protocol (MCP) Server

[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-blueviolet.svg?style=flat-square)](https://modelcontextprotocol.io/)
[![Claude Desktop](https://img.shields.io/badge/Claude%20Desktop-Ready-orange.svg?style=flat-square)](https://claude.ai)
[![Cursor IDE](https://img.shields.io/badge/Cursor%20IDE-Ready-purple.svg?style=flat-square)](https://cursor.sh)
[![OpenAPI 3.0](https://img.shields.io/badge/OpenAPI-3.0.3-emerald.svg?style=flat-square)](https://swagger.io/specification/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg?style=flat-square)](https://hub.docker.com/)

An enterprise **Model Context Protocol (MCP)** server providing Claude Desktop, Cursor IDE, Windsurf, Continue.dev, ChatGPT Actions, and autonomous agent frameworks with 38 specialized tools for multi-chain Web3 interaction, non-custodial hardware MPC operations, cryptographic airline ticketing, luxury hotel reservations, and static smart contract security audits.

---

## 🔐 Non-Custodial Hardware MPC Architecture

Northveil runs on a **Non-Custodial MPC Control Plane** backed by Turnkey hardware-isolated AWS Nitro Enclaves:

- **Zero Server-Side Key Material**: Private keys are generated and isolated directly inside hardware TEE enclaves. Neither Northveil servers nor databases ever possess raw or reconstructable private keys.
- **Passkey-Gated Authorization (WebAuthn / FIDO2)**: State-changing tools return unsigned transaction payloads and single-use approval tokens (`tok_...`). Users authorize executions via biometric hardware passkeys (Touch ID, Face ID, Windows Hello, YubiKey) on their client devices.
- **Autonomous Agent Spending Scopes (`set_autonomous_scope`)**: AI agents can execute micro-transactions autonomously within user-defined daily budgets and maximum per-transaction USD limits.
- **Emergency Kill Switch (`activate_kill_switch`)**: Instantly revokes all active autonomous permissions and voids all outstanding approval tokens.

---

## ⚡ Transports Supported

1. **HTTP JSON-RPC 2.0 (`POST /mcp`)**: Standard JSON-RPC tool router for AI agents and client libraries.
2. **Server-Sent Events (`GET /sse` & `POST /message`)**: Real-time bidirectional streaming for Claude Desktop.
3. **OpenAPI 3.0.3 Schema (`GET /openapi.json` & `GET /mcp`)**: Direct one-click import into ChatGPT Actions.
4. **Interactive Wallet UI Widget (`GET /ui/widget`)**: Visual portfolio and passkey confirmation widget embedded into agent webviews.

---

## 🤖 1. Claude Desktop Setup

Edit your Claude Desktop configuration file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "northveil": {
      "command": "npx",
      "args": ["-y", "northveil-cli", "mcp"],
      "env": {
        "NORTHVEIL_API_KEY": "nv_live_9f82a17b09c82415d8a9",
        "NORTHVEIL_WALLET_ADDRESS": "0xYOUR_VAULT_ADDRESS",
        "NORTHVEIL_API_URL": "https://mcp.northveil.xyz"
      }
    }
  }
}
```

Or connect via Hosted SSE:
```json
{
  "mcpServers": {
    "northveil-remote": {
      "url": "https://mcp.northveil.xyz/sse",
      "headers": {
        "Authorization": "Bearer nv_live_9f82a17b09c82415d8a9",
        "X-API-Key": "nv_live_9f82a17b09c82415d8a9"
      }
    }
  }
}
```

---

## 💻 2. Cursor IDE Configuration

1. In Cursor, open **Settings** ➔ **Features** ➔ **MCP Servers**.
2. Click **+ Add New MCP Server**.
3. Set **Type** to `command` and enter:
   ```bash
   npx -y northveil-cli mcp
   ```
4. All 38 tools are now accessible to Cursor Composer and Agent mode!

---

## 🌐 3. ChatGPT Actions & Custom GPTs Setup

1. In ChatGPT GPT Builder, go to **Configure** ➔ **Actions** ➔ **Create new action**.
2. Paste Schema URL: `https://mcp.northveil.xyz/openapi.json`.
3. Set Authentication: **API Key** (Header: `X-API-Key`).
4. ChatGPT will automatically discover endpoints for searching flights in crypto, querying portfolios, managing autonomous spending scopes, and staging passkey transactions!

---

## 🦜 4. AI Agent Frameworks (LangChain & CrewAI)

### LangChain Python Agent
```python
from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
import northveil

client = northveil.Northveil()

def search_crypto_flights(route: str):
    orig, dest = route.split(",")
    return client.search_flights(origin=orig.strip(), destination=dest.strip())

tools = [
    Tool(
        name="search_flights",
        func=search_crypto_flights,
        description="Search real airline flights priced dynamically in live crypto"
    )
]

llm = ChatOpenAI(temperature=0, model="gpt-4o")
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)
agent.run("Find flights from LHR to JFK under 1 ETH")
```

---

## 🛠️ Complete MCP Tool Catalog (38 Tools)

| Category | Tools | Description |
|:---|:---|:---|
| **Non-Custodial Wallets** | `create_wallet`, `import_wallet`, `get_wallet_info`, `get_wallet_balance`, `get_token_balance`, `get_portfolio` | Hardware MPC vault provisioning, multi-chain on-chain balances |
| **Control Plane & Auth** | `create_transaction_request`, `approve_transaction`, `reject_transaction`, `get_transaction_status`, `set_autonomous_scope`, `activate_kill_switch`, `deactivate_kill_switch` | WebAuthn passkey gating, autonomous spending limits, emergency locks |
| **Transfers & DEX** | `send_transfer`, `execute_swap`, `buy_tokens`, `sell_tokens`, `set_trade_order`, `get_active_orders`, `cancel_trade_order` | In-scope autonomous execution or passkey staging across DEX routers |
| **Smart Contracts** | `create_smart_contract`, `deploy_smart_contract`, `mint_tokens`, `verify_smart_contract`, `audit_smart_contract`, `audit_token` | Solc compilation, deterministic deployment, on-chain receipt confirmation |
| **Travel & Protocol** | `search_flights`, `search_hotels`, `search_travel`, `get_seat_map`, `make_reservation`, `list_reservations`, `get_booking_status` | IATA routing, live dynamic crypto pricing, verifiable PNR passes |

---

## 📄 License
MIT License © 2026 Northveil Protocol.
