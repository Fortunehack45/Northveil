# Volume 7: SDK & Developer Integration Guide

## 1. Installation

Install the official Northveil SDK via NPM:

```bash
npm install @northveil/sdk
```

## 2. Quickstart Code Examples

### Initialize the Client
```typescript
import { NorthveilClient } from '@northveil/sdk';

const northveil = new NorthveilClient({
  apiKey: process.env.NORTHVEIL_API_KEY || 'nv_live_your_key',
  network: 'sepolia',
});
```

### Create an Encrypted Custodial Wallet
```typescript
const wallet = await northveil.createWallet({
  name: 'Treasury Reserve Vault',
});

console.log('Address:', wallet.address);
console.log('Backup Seed Phrase (one-time):', wallet.backupSeedPhrase);
```

### Transfer Crypto
```typescript
const tx = await northveil.sendTransfer({
  token: 'ETH',
  amount: 0.005,
  recipientAddress: '0x59148d6a9dff263a772b5a84280bc88530f38636',
  network: 'sepolia',
});

console.log('Broadcasted Tx:', tx.txHash);
console.log('Block Explorer:', tx.explorerUrl);
```

### Deploy Smart Contract
```typescript
const contract = await northveil.deploySmartContract({
  contractName: 'AlphaToken',
  symbol: 'ALPHA',
  contractType: 'erc20',
  totalSupply: 1000000,
  ownerAllocation: 1000000,
  network: 'sepolia',
});

console.log('Contract Address:', contract.contractAddress);
```
