# Volume 1: Architecture & System Design

## 1. System Overview

The Northveil Protocol is structured as a modular, 5-tier distributed architecture designed for maximum fault tolerance, minimal latency, and zero-knowledge credential isolation.

```
┌─────────────────────────────────────────────────────────────┐
│                 TIER 1: AI AGENT INTERFACE                  │
│    (Claude Web / Desktop, ChatGPT Actions, Custom LLMs)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON-RPC 2.0 / SSE / REST
┌──────────────────────────────▼──────────────────────────────┐
│             TIER 2: NORTHVEIL MCP GATEWAY ENGINE            │
│  - Authentication & OAuth Token Validator                   │
│  - Multi-Tenant Scoped Permission Gate                      │
│  - Single-Use Approval Token State Machine                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│           TIER 3: CORE EXECUTION SERVICES (IN-MEMORY)       │
│  - Custodial Signing Engine (AES-256-GCM + PBKDF2)          │
│  - In-Memory Solidity Compiler (solc 0.8.20+)               │
│  - Static AST Contract Vulnerability Auditor                │
│  - DEX Routing & Limit Order Engine (1inch/Uniswap)         │
│  - Autonomous Travel & Commerce Engine                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│         TIER 4: RESILIENT MULTI-CHAIN RPC FAILOVER MESH      │
│  Ethereum │ Sepolia │ Base │ Polygon │ Arbitrum │ BSC │ SOL │ BTC
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             TIER 5: PERSISTENCE & AUDIT LOGGING             │
│    Supabase PostgreSQL (RLS) + In-Memory Fallback Cache     │
└─────────────────────────────────────────────────────────────┘
```

## 2. Serverless Edge Topology & Runtime Tuning

Northveil runs as an enterprise serverless microservice compatible with Vercel Edge/Serverless, AWS Lambda, and standalone Docker containers.

### Serverless Function Configuration
```json
{
  "version": 2,
  "functions": {
    "api/index.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### Key Design Tenets
1. **Stateless Scalability**: All requests carry cryptographic authentication; session state is managed via cryptographically signed tokens.
2. **In-Memory Redundancy**: In the event of temporary upstream database interruptions, the server utilizes local volatile registries to guarantee 100% signing uptime.
3. **Bounded Execution**: All on-chain deployments use bounded mempool submission and deterministic address computation to prevent execution timeouts.
