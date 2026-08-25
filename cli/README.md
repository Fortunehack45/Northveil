# @northveil/cli

> The Official Developer CLI for Northveil Protocol — Multi-Chain Web3, Travel Settlement & Autonomous AI Tooling.

```bash
npm install -g @northveil/cli
# or use directly with npx:
npx @northveil/cli --help
```

---

## ⚡ Features & Commands

### 1. Scaffold New Projects (`init`)
```bash
northveil init my-web3-app --template dapp
```

### 2. Live International Flights & Airline Search
```bash
# Search London (LHR) to New York (JFK) with live crypto rates (ETH/USDC/SOL)
northveil flights --from LHR --to JFK --date 2026-09-20 --class business --passengers 2
```

### 3. Global Hotels & Luxury Resorts
```bash
northveil hotels --city Tokyo --checkin 2026-10-05 --checkout 2026-10-08 --guests 2
```

### 4. Real-time PNR & Ticket Verification
```bash
# Check official 6-character IATA PNR code
northveil status 7X9K2B
```

### 5. Multi-Chain Portfolio & Health Audit
```bash
northveil wallet 0x1111111111111111111111111111111111111111
northveil health 0x1111111111111111111111111111111111111111
```

### 6. Smart Contract Deployment & Verification
```bash
northveil deploy --type erc20 --name "AlphaToken" --symbol "ALPHA" --supply 1000000 --network sepolia
northveil mint --contract 0x... --amount 50000 --network sepolia
```

### 7. Static Code Vulnerability & Backdoor Audit
```bash
northveil audit ./contracts/MyToken.sol
```

### 8. Webhook Dispatch & Testing
```bash
northveil webhooks --test https://myapi.com/webhooks --event tx.confirmed
```

### 9. Claude Desktop & Cursor MCP Config
```bash
northveil mcp --claude
northveil mcp --cursor
```

---

## License
MIT © Northveil Protocol
