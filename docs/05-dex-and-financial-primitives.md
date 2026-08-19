# Volume 5: DEX Aggregation & Financial Primitives

## 1. DEX Aggregation Architecture

Northveil integrates with leading decentralized exchange aggregators (1inch Network, Uniswap v3) to route token swaps across maximum liquidity with minimal slippage.

### Swap Parameters
- **Slippage Tolerance**: Default 0.5% (customizable up to 5.0%)
- **Supported Chains**: Ethereum, Base, Polygon, Arbitrum, BSC
- **Gas Fee Estimation**: Real-time gas price fetching across EIP-1559 networks

## 2. Autonomous Limit Orders

Northveil provides off-chain limit order matching with on-chain cryptographic settlement:
1. User specifies target price (e.g. "Buy ETH when price hits $3,200 USD").
2. Northveil records the signed order intent in Supabase with expiration timestamp.
3. Background price feeds monitor live market feeds (Moralis / CoinGecko).
4. When price threshold is met, the custodial signer broadcasts the DEX trade.
