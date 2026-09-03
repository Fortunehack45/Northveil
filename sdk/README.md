# Northveil TypeScript SDK

[![npm version](https://img.shields.io/npm/v/northveil-sdk.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/northveil-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Official lightweight TypeScript / JavaScript client for the **Northveil Non-Custodial Agent Wallet & MCP Protocol**.

The AI never holds keys. The server never holds a full key. The agent proposes an operation via MCP. A grant + policy engine decides if it can run. If approval is required, the user signs with a passkey on `https://wallet.northveil.xyz`.

---

## 📦 Installation

```bash
npm install northveil-sdk
```

---

## 🚀 Quickstart

```typescript
import { NorthveilClient } from 'northveil-sdk';

const client = new NorthveilClient({
  apiUrl: process.env.NORTHVEIL_API_URL || 'https://mcp.northveil.xyz',
  clientKey: process.env.NORTHVEIL_API_KEY || 'YOUR_NORTHVEIL_CLIENT_KEY',
});

async function main() {
  // 1. Fetch Real-time Portfolio Balances (Read Path)
  const portfolio = await client.getPortfolio();
  console.log(portfolio.markdownSummary);

  // 2. Stage a Transfer (Write Path)
  // Under Always Ask: Returns APPROVAL_REQUIRED with passkey approval link.
  // Under Autonomous: Executes threshold MPC signing if inside pre-authorized limits.
  const transfer = await client.prepareTransfer({
    to: '0x1234567890123456789012345678901234567890',
    amount: '0.05',
    chain: 'eip155:8453',
    asset: 'ETH',
  });

  if (transfer.status === 'APPROVAL_REQUIRED') {
    console.log('Human Passkey Approval Required!');
    console.log(`Approve here: ${transfer.approveUrl}`);
  } else if (transfer.status === 'EXECUTED') {
    console.log(`Transaction executed autonomously! Tx: ${transfer.txHash}`);
  }

  // 3. Query Transaction Confirmation Status
  if (transfer.txHash) {
    const status = await client.getTransactionStatus(transfer.txHash, 'base');
    console.log('Status:', status.status);
  }
}

main().catch(console.error);
```

---

## 🔒 Security Invariants

- **No Private Keys in SDK**: The SDK is a thin HTTP/MCP JSON-RPC transport wrapper. It never generates, stores, or handles private keys.
- **Strict Capabilities**: Authenticates using capability tokens (`nv_live_...`) bound to user-defined grants.
- **Passkey Step-up**: Transactions outside autonomous limits generate secure, single-use `approveUrl` links for human WebAuthn signing.

---

## 📄 License
MIT License © 2026 Northveil Protocol.
