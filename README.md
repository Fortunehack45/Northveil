# Multi-Chain Wallet Import & Asset Discovery
Complete Technical Documentation

## 1. Introduction
A cryptocurrency wallet does not store coins or tokens. Every asset exists on its respective blockchain.
The wallet is simply an application that:
- Stores or derives cryptographic keys.
- Generates blockchain addresses.
- Queries blockchain networks.
- Discovers assets.
- Calculates balances.
- Retrieves token prices.
- Displays everything in a single interface.
- Signs transactions locally.

When a user imports a wallet using a Secret Recovery Phrase (SRP), the wallet reconstructs the user's accounts and discovers all assets across supported blockchains.

## 2. High-Level Architecture
```text
                User
                   │
                   ▼
        Import Seed Phrase
                   │
                   ▼
      Generate Private Keys
                   │
                   ▼
      Generate Wallet Addresses
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
 Ethereum      BNB Chain      Base
      │            │            │
      ▼            ▼            ▼
RPC Calls    RPC Calls    RPC Calls
      │            │            │
      ▼            ▼            ▼
Balances    Token Scan   NFT Scan
      │            │            │
      └────────────┼────────────┘
                   ▼
          Asset Discovery Engine
                   ▼
        Price Aggregation Engine
                   ▼
       Portfolio Calculation
                   ▼
          User Interface
```

## 3. Wallet Import Process
**Step 1: User Enters Seed Phrase**
Example:
`apple banana chair table...`

This is a BIP-39 mnemonic.
The wallet never sends this phrase to any server.
Everything happens locally.

**Step 2: Generate Seed**
Using BIP39:
Mnemonic → Seed (512 bits) → Master Private Key

**Step 3: Derive Wallets**
Using BIP32/BIP44 HD Wallet standards.
- Ethereum example: `m/44'/60'/0'/0/0`
- Bitcoin: `m/44'/0'/0'/0/0`
- Solana: `m/44'/501'/0'/0'`

Each blockchain has its own derivation path.

## 4. Address Generation
The wallet derives addresses.
Example:
Ethereum `0x84Ab...`

The exact same private key also generates addresses for:
Ethereum, Base, Polygon, Optimism, Arbitrum, BNB Chain, Avalanche C-Chain, Scroll, Linea, zkSync, Blast, Mantle, Sonic, Berachain, and most EVM-compatible chains.

## 5. Blockchain Discovery
The wallet has a list of supported chains.
Example:
Ethereum → BNB Chain → Base → Polygon → Arbitrum → Optimism → Avalanche → Fantom → Cronos → zkSync → Scroll → Linea → Mantle → Blast → Mode → Sonic → Berachain

For every blockchain:
RPC Endpoint → Connect → Query Address → Receive Data

## 6. Native Coin Balance Discovery
The wallet calls: `eth_getBalance`

Example:
```json
{
 "method":"eth_getBalance",
 "params":[
   "0x123...",
   "latest"
 ]
}
```
Response:
```json
{
 "result":"0xde0b6b3a7640000"
}
```
Converted: 1 ETH

The same works for: ETH, BNB, POL, AVAX, etc.

## 7. Token Discovery
This is the hardest part.
The blockchain itself has no command like: "Give me every token this address owns."

Instead, wallets use multiple techniques.

**Method 1: Indexers**
Examples: Alchemy, Moralis, Covalent, QuickNode, Blockscout, Etherscan, BaseScan, BscScan.
They maintain databases that map addresses to token balances.
Query: Address → Indexer → List all ERC20 tokens

**Method 2: Transfer Event Scanning**
Every ERC20 emits: `Transfer()`
Wallet scans: Transfer → Address → Collect Contract Addresses → Query `balanceOf()`

**Method 3: Token Lists**
Wallets ship with token lists.
Example: USDC, USDT, PEPE, LINK, UNI, AAVE.
Unknown tokens are discovered later.

**Method 4: Wallet Cache**
Previously discovered tokens are cached.

## 8. Getting Token Balance
Once a token contract is known:
Call: `balanceOf(address)`
`balanceOf(0x123...)`
Returns: `550000000`
Wallet converts using decimals.
Decimals = 6 → 550 USDC

## 9. NFT Discovery
Wallet scans:
- ERC721
- ERC1155

Example:
Address → NFT Indexer → Return NFTs

## 10. Price Discovery
Balance alone is useless. Need USD value.
Example: 2 ETH × $4,000 = $8,000

Sources: CoinGecko, CoinMarketCap, Dex Screener, GeckoTerminal, DEX price oracles, Internal pricing APIs.

## 11. Portfolio Calculation
Example:
- Ethereum: ETH $4,000, USDC $200, LINK $60
- Base: ETH $800, BRETT $90
- Polygon: POL $30

Portfolio:
Total $5,180

## 12. Asset Sorting
Assets are sorted by USD value.
Example:
- ETH $4,000
- USDC $200
- BRETT $90
- LINK $60
- POL $30

This is the best user experience.

## 13. Transaction History
Wallet fetches:
- Native transfers
- Token transfers
- NFT transfers
- Swaps
- Approvals
- Bridge activity

Sources: RPC logs, Explorer APIs, Indexers.

## 14. Sending Transactions
Sending is different from viewing.
Steps:
User enters amount → Wallet builds transaction → Estimate Gas → Sign locally → Broadcast → Blockchain → Confirmation

Private keys never leave the device.

## 15. Swaps
Wallet connects to DEX aggregators.
Examples: 0x API, LI.FI, 1inch, Odos.
Flow: Swap Quote → Approve Token → Execute Swap → Wait Confirmation → Refresh Portfolio

## 16. Cross-Chain Bridges
Flow:
Ethereum → Bridge Contract → Relayer → Base → Receive Assets

## 17. Buying Crypto
Providers include: MoonPay, Transak, Banxa, Ramp, Onramper.
Flow: User buys ETH → Provider → Blockchain → Wallet Refresh → ETH Appears

## 18. Security
A secure wallet should:
- Encrypt the seed phrase locally.
- Store secrets in Secure Enclave (iOS) or Android Keystore.
- Never upload private keys.
- Require biometric or PIN confirmation for sensitive actions.
- Warn users about malicious approvals and phishing.

## 19. Performance Optimizations
To keep the app fast:
- Query multiple chains in parallel.
- Cache token metadata (name, symbol, decimals, logo).
- Cache prices with a short expiry (for example, 30–60 seconds).
- Refresh balances in the background.
- Use WebSockets where available for live updates.

## 20. Recommended Backend Architecture
Even though wallet operations are non-custodial, a backend can improve performance and provide additional services.
- **Frontend:** React Native or Flutter, ethers.js / viem, WalletConnect, Secure local storage
- **Backend (e.g., Supabase):** User profiles, Encrypted preferences (never private keys), Custom chain registry, Cached token metadata, Notification service, Portfolio snapshots (optional), Analytics, Feature flags
- **Infrastructure:** Multiple RPC providers with automatic failover, Indexing services for token and NFT discovery, Price aggregation service, Push notification service.

## 21. Complete Import Workflow
```text
User enters seed phrase
        │
        ▼
Validate mnemonic (BIP-39)
        │
        ▼
Generate master seed
        │
        ▼
Derive accounts (BIP-32/BIP-44)
        │
        ▼
Generate addresses for all supported chains
        │
        ▼
Connect to each blockchain
        │
        ▼
Fetch native balances
        │
        ▼
Discover ERC-20/BEP-20/SPL/etc. tokens
        │
        ▼
Fetch token balances
        │
        ▼
Discover NFTs
        │
        ▼
Fetch transaction history
        │
        ▼
Retrieve live token prices
        │
        ▼
Calculate USD values
        │
        ▼
Sort assets by portfolio value
        │
        ▼
Display unified wallet dashboard
        │
        ▼
Continuously monitor for new blocks and transactions
        │
        ▼
Automatically refresh balances and portfolio
```

## Conclusion
The key idea is that a wallet like MetaMask doesn't "find" your assets by storing them itself. Instead, it:
1. Reconstructs your accounts from your seed phrase.
2. Derives the correct addresses for each supported blockchain.
3. Queries each blockchain or indexing service for balances, tokens, NFTs, and transactions.
4. Fetches market prices.
5. Combines all of that information into a single, unified portfolio.

This architecture is what enables modern wallets to present a seamless multi-chain experience while keeping users in full control of their private keys.
