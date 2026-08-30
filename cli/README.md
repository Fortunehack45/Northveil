# northveil-cli

> The Official Developer CLI for Northveil Protocol — Multi-Chain Web3, Smart Contracts, Trading Intelligence & MCP AI Tooling.

```bash
npm install -g northveil-cli
# or use directly with npx:
npx northveil-cli --help
```

---

## ⚡ Features & Commands

### 1. Scaffold New Projects (`init`)
```bash
northveil init my-web3-app --template dapp
```

### 2. Real-Time Token Prices & Market Intelligence
```bash
# Fetch live real-time token prices across Ethereum, Base, Solana, Arbitrum
northveil prices ETH BTC SOL USDC
```

### 3. Trending Memecoin Discovery with Automated Safety Audits
```bash
# Scan trending tokens and check honeypot/safety scores
northveil memecoins --chain all --limit 10
```

### 4. Deep Token Contract Audit
```bash
# Analyze contract for honeypots, buy/sell taxes, hidden owners, and mintability
northveil audit-token 0x... --chain ethereum
```

### 5. Multi-Chain Portfolio & Health Audit
```bash
northveil wallet 0x1111111111111111111111111111111111111111
northveil health 0x1111111111111111111111111111111111111111
```

### 6. Multi-Chain Transfer & DEX Swap
```bash
# Non-custodially prepare and stage a transfer
northveil send --to 0x... --amount 0.05 --token ETH --network sepolia

# Prepare an optimal DEX swap
northveil swap --from ETH --to USDC --amount 0.1 --network base
```

### 7. Smart Contract Deployment & Minting
```bash
northveil deploy --type erc20 --name "AlphaToken" --symbol "ALPHA" --supply 1000000 --network sepolia
northveil mint --contract 0x... --amount 50000 --network sepolia
```

### 8. Static Code Vulnerability & Backdoor Audit
```bash
northveil audit ./contracts/MyToken.sol
```

### 9. Gateway Health Check & Webhook Testing
```bash
northveil server-health
northveil webhooks --test https://myapi.com/webhooks --event tx.confirmed
```

### 10. Claude Desktop, Cursor & Windsurf MCP Config
```bash
northveil mcp --claude
northveil mcp --cursor
northveil mcp --windsurf
```

---

## License
MIT © Northveil Protocol

