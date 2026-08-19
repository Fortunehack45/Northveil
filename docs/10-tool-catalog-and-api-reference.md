# Volume 10: Complete 38-Tool Catalog & API Reference

## Full MCP Tool Inventory

| # | Tool Name | Scope | Description |
|---|:---|:---|:---|
| 1 | `create_wallet` | `write:tx` | Generates new multi-chain custodial wallet with AES-256-GCM encrypted seed phrase. |
| 2 | `import_wallet` | `write:tx` | Imports existing private key or BIP-39 mnemonic seed phrase. |
| 3 | `get_wallet_info` | `read:balance` | Retrieves active wallet addresses, primary chain, and vault status. |
| 4 | `get_portfolio` | `read:balance` | Aggregates multi-chain token balances, valuations, and USD net worth. |
| 5 | `get_token_balance` | `read:balance` | Returns precise native and ERC-20 token balances for a target address. |
| 6 | `create_transaction_request` | `write:tx` | Prepares unsigned transaction request with gas estimate and approval token. |
| 7 | `approve_transaction` | `write:tx` | Validates single-use approval token, signs with custodial key, and broadcasts on-chain. |
| 8 | `reject_transaction` | `write:tx` | Invalidates approval token and cancels staged transaction. |
| 9 | `send_transfer` | `write:tx` | Executes direct on-chain cryptocurrency transfer. |
| 10 | `deploy_smart_contract` | `write:deploy` | Compiles and deploys ERC-20 / ERC-721 / custom smart contract. |
| 11 | `create_smart_contract` | `read:public` | Generates audited Solidity source code for tokens and NFTs. |
| 12 | `audit_smart_contract` | `read:public` | Performs AST static security audit and vulnerability analysis. |
| 13 | `verify_smart_contract` | `write:deploy` | Submits contract source code and ABI to Etherscan / Basescan for verification. |
| 14 | `upload_contract_asset` | `write:deploy` | Uploads token logo or NFT metadata image to Supabase Storage. |
| 15 | `buy_tokens` | `write:dex` | Executes DEX market buy via 1inch aggregation. |
| 16 | `sell_tokens` | `write:dex` | Executes DEX market sell via 1inch aggregation. |
| 17 | `trade_tokens` | `write:dex` | Universal swap interface between any two EVM token assets. |
| 18 | `execute_swap` | `write:dex` | Executes DEX swap or cross-chain bridge trade. |
| 19 | `set_trade_order` | `write:dex` | Places off-chain automated limit order. |
| 20 | `get_active_orders` | `read:balance` | Lists pending limit orders for active wallet. |
| 21 | `cancel_trade_order` | `write:dex` | Cancels active limit order. |
| 22 | `mint_tokens` | `write:deploy` | Calls contract `mint()` function to mint new tokens. |
| 23 | `reserve_tokens` | `write:deploy` | Creates time-locked token reservation / vesting escrow. |
| 24 | `get_transaction_history` | `read:balance` | Fetches verified on-chain transaction history. |
| 25 | `get_realtime_prices` | `read:public` | Returns live crypto token spot prices in USD. |
| 26 | `get_trending_memecoins` | `read:public` | Returns trending tokens by 24h volume and price change. |
| 27 | `audit_token` | `read:public` | Performs honeypot, liquidity lock, and tax audit on token contract. |
| 28 | `get_gas_estimate` | `read:public` | Calculates EIP-1559 gas fees across EVM chains. |
| 29 | `get_nft_gallery` | `read:balance` | Retrieves NFT collection metadata and image assets for wallet. |
| 30 | `check_wallet_health` | `read:balance` | Performs health check and security audit on connected wallet. |
| 31 | `scan_wallet_security` | `read:balance` | Scans wallet approvals and flags vulnerable contract allowances. |
| 32 | `search_flights` | `read:public` | Searches commercial flight schedules and crypto pricing. |
| 33 | `search_hotels` | `read:public` | Searches hotel rooms, amenities, and crypto nightly rates. |
| 34 | `search_events_and_movies` | `read:public` | Searches cinema and concert event tickets. |
| 35 | `make_reservation` | `write:tx` | Books real-world reservation with crypto payment and digital ticket pass. |
| 36 | `get_booking_status` | `read:public` | Checks status of digital booking ticket. |
| 37 | `list_reservations` | `read:balance` | Lists all travel and event bookings for active wallet. |
| 38 | `generate_wallet_ui_widget` | `read:public` | Returns embeddable interactive HTML/JS wallet widget. |
