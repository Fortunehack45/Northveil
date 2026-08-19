# Volume 3: Model Context Protocol (MCP) Specification

## 1. MCP Overview

The Model Context Protocol (MCP) provides a standardized communication interface allowing AI assistants (Claude, ChatGPT, IDE agents) to discover and execute tools securely.

### Endpoints
- **HTTP Transport**: `POST /mcp` (JSON-RPC 2.0)
- **SSE Stream**: `GET /sse` (Server-Sent Events)
- **Discovery Catalog**: `POST /mcp` with method `tools/list`
- **Tool Invocation**: `POST /mcp` with method `tools/call`

## 2. JSON-RPC 2.0 Request & Response Specification

### Tool Invocation Request
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_token_balance",
    "arguments": {
      "walletAddress": "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417",
      "network": "sepolia"
    }
  },
  "id": 1787098800000
}
```

### Successful Response
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "### 💰 NATIVE & TOKEN BALANCES FOR `0x56f0...45417`\n\n- **Sepolia ETH**: `0.162012 ETH` ($0.00 USD)\n- **USDC**: `500.00 USDC` ($500.00 USD)"
      }
    ],
    "balances": {
      "native": "0.162012",
      "tokens": [
        { "symbol": "USDC", "balance": "500.0" }
      ]
    },
    "authenticatedWallet": "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417"
  },
  "id": 1787098800000
}
```
