# Volume 7: SDK & Developer Integration Guide

## 1. Installation

Install the official Northveil SDK via NPM:

```bash
npm install northveil-sdk
```

## 2. Quickstart Code Examples

### Initialize the Client
```typescript
import { NorthveilClient } from 'northveil-sdk';

const client = new NorthveilClient({
  apiUrl: process.env.NORTHVEIL_API_URL || 'https://mcp.northveil.xyz',
  clientKey: process.env.NORTHVEIL_API_KEY || 'YOUR_NORTHVEIL_CLIENT_KEY',
});
```

### Stage an On-Chain Transfer
```typescript
// Non-custodial workflow:
// Under Always Ask: Returns APPROVAL_REQUIRED with a secure passkey approval link.
// Under Autonomous: Verifies grant velocity limits and executes threshold MPC signature directly.
const transfer = await client.prepareTransfer({
  to: '0xYOUR_WALLET_ADDRESS',
  amount: '0.005',
  chain: 'eip155:8453',
  asset: 'ETH',
});

if (transfer.status === 'APPROVAL_REQUIRED') {
  console.log('Passkey authorization link:', transfer.approveUrl);
} else {
  console.log('Autonomous Tx Hash:', transfer.txHash);
}
```

### Deploy Token
```typescript
const deployment = await client.prepareDeployToken({
  name: 'AlphaToken',
  symbol: 'ALPHA',
  totalSupply: '1000000',
  network: 'base',
  tokenomics: [
    { label: 'community', percent: 80 },
    { label: 'liquidity', percent: 20 },
  ],
});

console.log('Deployment Approval Ticket:', deployment.approvalId);
```
