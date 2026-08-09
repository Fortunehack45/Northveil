# Northveil Web3 & AI MCP Client SDK (`northveil-sdk`)

The official TypeScript and JavaScript SDK for integrating Northveil AI Wallet capabilities, multi-chain balances, DEX swaps, and smart contract deployments into web apps, Node.js backends, and AI agents.

---

## 📦 Installation

```bash
npm install northveil-sdk
```

Or using Yarn / pnpm:

```bash
pnpm add northveil-sdk
```

---

## 🚀 Quickstart Usage

```typescript
import { NorthveilClient } from 'northveil-sdk';

// Initialize SDK Client
const northveil = new NorthveilClient({
  baseUrl: 'https://mcp.northveil.xyz', // Or your self-hosted MCP server endpoint
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
});

async function run() {
  // 1. Get Wallet Balance across 30+ chains
  const ethBalance = await northveil.getBalance('ethereum');
  console.log('ETH Balance:', ethBalance.balanceNative);

  // 2. Get NFT Balances
  const nfts = await northveil.getNFTs('polygon');
  console.log('NFT Collection:', nfts);

  // 3. Deploy Smart Contract
  const deployResult = await northveil.deploySmartContract({
    contractType: 'erc20',
    contractName: 'AlphaToken',
    symbol: 'ALPHA',
    totalSupply: 1000000,
    network: 'sepolia',
    websiteUrl: 'https://alphatoken.io' // Optional: leave blank if not provided!
  });

  console.log('Contract Deployed at:', deployResult.explorerUrl);
}

run();
```

---

## 🌐 CDN Usage (Browser Script Tag)

You can load Northveil SDK directly in HTML without any bundler:

```html
<script src="https://unpkg.com/northveil-sdk/dist/index.js"></script>
<script>
  const northveil = new NorthveilSDK.NorthveilClient({
    baseUrl: 'https://mcp.northveil.xyz'
  });
</script>
```

---

## 🛠️ How to Publish to NPM / GitHub Packages

1. Login to NPM:
   ```bash
   npm login
   ```

2. Build and Publish:
   ```bash
   cd sdk
   npm run build
   npm publish --access public
   ```
