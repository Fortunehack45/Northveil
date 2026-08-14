# Northveil Architecture & Enterprise System Design Manual

## 1. System Topology & Data Flow Pipelines

Northveil connects user-facing applications (React dApp, Mobile PWA, Developer CLI, Python scripts) and AI Agent runtimes (Claude Desktop, Cursor, LangChain) to 36+ decentralized blockchains through an event-driven, multi-tenant protocol gateway.

```
[User Browser / PWA] ──(Web3 RPC)──┐
                                     ▼
[Claude / Cursor IDE] ──(MCP/SSE)──➔ [Northveil Protocol Gateway] ──(AES-256)──➔ [Supabase DB]
                                     │ (Node.js Express / Ethers.js)             (Postgres 17)
[Python SDK / CLI] ──(REST/JSON)───┘           │
                                               ▼
                                  [36+ Blockchain RPC Nodes]
                                  (Mainnet, Sepolia, Solana)
```

## 2. Frontend State & Reactive Component Tree

The frontend (`src/App.tsx`) uses a reactive state tree powered by React hooks:
- **`activeTab`**: Coordinates navigation across `'wallet'`, `'travel'`, `'hub'`, `'contracts'`, and `'chat'`.
- **`AIService`**: Directs conversational AI prompts to MCP tool invocations with optimistic rendering.
- **`SwapService`**: Manages on-chain DEX routing and decimal precision normalization.
- **`SupabaseService`**: Handles encrypted session synchronization and cloud backup.

## 3. Serverless API Execution Lifecycle

When a request arrives at `api/index.ts` or `mcp-server/index.ts`:
1. **CORS & Tunnel Headers**: Applies permissive CORS and injects `Bypass-Tunnel-Reminder`.
2. **Authentication Middleware**: Calls `authenticateClient(apiKey, walletAddress)`. Queries Supabase `mcp_api_keys` to verify tier and permissions.
3. **Tenant Boundary Enforcement**: Validates that target addresses in sensitive operations match the caller's bound wallet address.
4. **Tool Execution Engine**: Dispatches to `executeRealTool(toolName, args, walletAddress)`.
5. **Audit Logging**: Asynchronously logs execution parameters and status to `mcp_activity_logs`.
