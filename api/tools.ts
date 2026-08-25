/**
 * Northveil MCP Server Tool Definitions & Types
 * Compliant with Official Model Context Protocol (MCP) v2024-11-05 Spec (inputSchema & annotations)
 * Operating under Non-Custodial MPC/TEE Control-Plane Architecture (PayBox-Style Hardware Enclaves)
 */

export interface MCPToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
  items?: { type: string };
}

export interface MCPToolAnnotations {
  readOnly?: boolean;
  destructive?: boolean;
  confirmationRequired?: boolean;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  annotations?: MCPToolAnnotations;
  inputSchema: {
    type: 'object';
    properties: Record<string, MCPToolParameter>;
    required?: string[];
  };
  parameters: {
    type: 'object';
    properties: Record<string, MCPToolParameter>;
    required?: string[];
  };
}

export const MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'create_wallet',
    description: 'Provisions a new non-custodial multi-chain vault wallet backed by Turnkey MPC/TEE secure enclaves. Private key material is generated and fragmented inside hardware-isolated enclaves and is never possessed, stored, or reconstructable by Northveil servers. Returns vault public address and MPC enclave references.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User identifier or account handle (default: default_user)',
        },
        walletName: {
          type: 'string',
          description: 'Human-readable label for the vault wallet (e.g. Primary Trading Vault)',
        },
        chain: {
          type: 'string',
          description: 'Primary blockchain network (ethereum, sepolia, base, polygon, arbitrum, bsc). Default: ethereum',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User identifier or account handle',
        },
        walletName: {
          type: 'string',
          description: 'Human-readable label for the vault wallet',
        },
        chain: {
          type: 'string',
          description: 'Primary blockchain network',
        },
      },
    },
  },
  {
    name: 'import_wallet',
    description: 'Registers an existing non-custodial address or provisions an MPC enclave reference for multi-chain operations under the non-custodial control plane.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: '0x-prefixed public address of the wallet to track and coordinate.',
        },
        walletName: {
          type: 'string',
          description: 'Optional custom label for the vault wallet.',
        },
        chain: {
          type: 'string',
          description: 'Primary network: ethereum, sepolia, base, polygon, arbitrum, bsc.',
        },
      },
      required: ['address'],
    },
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: '0x-prefixed public address of the wallet.',
        },
        walletName: {
          type: 'string',
          description: 'Custom name for the wallet.',
        },
        chain: {
          type: 'string',
          description: 'Primary network.',
        },
      },
      required: ['address'],
    },
  },
  {
    name: 'send_transfer',
    description: 'Initiates a native or ERC-20 token transfer from the vault wallet. If the transfer is within the user-configured autonomous spending limits, signs via Turnkey MPC enclaves and broadcasts immediately. Otherwise, stages an unsigned transaction request and returns a single-use token and Passkey approval URL for human confirmation.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token symbol to transfer (e.g. ETH, USDT, USDC, SOL)',
        },
        amount: {
          type: 'number',
          description: 'Amount of crypto units to transfer',
        },
        recipientAddress: {
          type: 'string',
          description: 'Destination blockchain recipient public address (0x...)',
        },
        chain: {
          type: 'string',
          description: 'Target network: sepolia, base, ethereum, polygon, arbitrum, bsc',
        },
        fromAddress: {
          type: 'string',
          description: 'Optional sender vault address (defaults to active user vault)',
        },
      },
      required: ['token', 'amount', 'recipientAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token symbol to transfer (e.g. ETH, USDT, USDC, SOL)',
        },
        amount: {
          type: 'number',
          description: 'Amount of crypto units to transfer',
        },
        recipientAddress: {
          type: 'string',
          description: 'Destination blockchain recipient public address',
        },
        chain: {
          type: 'string',
          description: 'Target network',
        },
        fromAddress: {
          type: 'string',
          description: 'Optional sender vault address',
        },
      },
      required: ['token', 'amount', 'recipientAddress'],
    },
  },
  {
    name: 'execute_swap',
    description: 'Executes a DEX token swap via 1inch/Uniswap/Aerodrome router. If within autonomous spending limits, signs via MPC enclave quorum and broadcasts. Otherwise, stages an unsigned transaction request requiring Passkey confirmation.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        fromToken: {
          type: 'string',
          description: 'Source token symbol (e.g. ETH, WETH, USDC)',
        },
        toToken: {
          type: 'string',
          description: 'Destination token symbol (e.g. USDC, UNI, PEPE)',
        },
        amount: {
          type: 'number',
          description: 'Amount of source token to swap',
        },
        network: {
          type: 'string',
          description: 'Target EVM network: sepolia, base, ethereum, polygon, arbitrum, bsc',
        },
        slippageTolerance: {
          type: 'number',
          description: 'Slippage percentage tolerance (default: 0.5%)',
        },
      },
      required: ['fromToken', 'toToken', 'amount'],
    },
    parameters: {
      type: 'object',
      properties: {
        fromToken: {
          type: 'string',
          description: 'Source token symbol',
        },
        toToken: {
          type: 'string',
          description: 'Destination token symbol',
        },
        amount: {
          type: 'number',
          description: 'Amount of source token to swap',
        },
        network: {
          type: 'string',
          description: 'Target EVM network',
        },
        slippageTolerance: {
          type: 'number',
          description: 'Slippage percentage tolerance',
        },
      },
      required: ['fromToken', 'toToken', 'amount'],
    },
  },
  {
    name: 'buy_tokens',
    description: 'Buys a token on DEX using ETH, USDT, or USDC. Evaluates autonomous spending limits before triggering MPC co-signing or staging a Passkey approval request.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token symbol or contract address to buy (e.g. WBT, USDC)' },
        amount: { type: 'number', description: 'Amount of native crypto or payment token to spend' },
        fromToken: { type: 'string', description: 'Payment token symbol (default: ETH)' },
        network: { type: 'string', description: 'Blockchain network (default: sepolia)' },
      },
      required: ['token', 'amount'],
    },
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token symbol or contract address to buy' },
        amount: { type: 'number', description: 'Amount of payment token to spend' },
        fromToken: { type: 'string', description: 'Payment token symbol' },
        network: { type: 'string', description: 'Blockchain network' },
      },
      required: ['token', 'amount'],
    },
  },
  {
    name: 'sell_tokens',
    description: 'Sells a token on DEX for ETH or stablecoins. Evaluates autonomous spending limits before triggering MPC co-signing or staging a Passkey approval request.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token symbol or contract address to sell' },
        amount: { type: 'number', description: 'Amount of token units to sell' },
        toToken: { type: 'string', description: 'Target token symbol to receive (default: ETH)' },
        network: { type: 'string', description: 'Blockchain network (default: sepolia)' },
      },
      required: ['token', 'amount'],
    },
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token symbol or contract address to sell' },
        amount: { type: 'number', description: 'Amount of token units to sell' },
        toToken: { type: 'string', description: 'Target token symbol to receive' },
        network: { type: 'string', description: 'Blockchain network' },
      },
      required: ['token', 'amount'],
    },
  },
  {
    name: 'deploy_smart_contract',
    description: 'Compiles and stages a smart contract deployment payload (ERC-20, ERC-721 NFT, or custom). Produces an unsigned deployment transaction and approval request requiring Passkey confirmation.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        contractName: {
          type: 'string',
          description: 'Name of the smart contract (e.g. WorkBaseToken, GalacticNFT).',
        },
        symbol: {
          type: 'string',
          description: 'Token ticker symbol (e.g. WBT, ARG). Recommended: 3-5 uppercase characters.',
        },
        contractType: {
          type: 'string',
          description: 'Template category: erc20, erc721, nft, erc1155, staking, dao, custom',
          enum: ['erc20', 'erc721', 'nft', 'erc1155', 'staking', 'dao', 'custom'],
        },
        totalSupply: {
          type: 'number',
          description: 'Total token supply (e.g. 1000000000) or total max NFT collection size (e.g. 10000).',
        },
        initialSupply: {
          type: 'number',
          description: 'Alias for totalSupply.',
        },
        ownerAllocation: {
          type: 'number',
          description: 'Amount allocated directly to owner wallet at deployment.',
        },
        description: {
          type: 'string',
          description: 'Project description, utility details, or token roadmap summary.',
        },
        imageUrl: {
          type: 'string',
          description: 'Optional token logo or NFT collection cover image URL.',
        },
        network: {
          type: 'string',
          description: 'Target EVM network: sepolia, ethereum, base, polygon, arbitrum, bsc',
        },
      },
      required: ['contractName'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractName: {
          type: 'string',
          description: 'Name of the smart contract.',
        },
        symbol: {
          type: 'string',
          description: 'Token ticker symbol.',
        },
        contractType: {
          type: 'string',
          description: 'Template category.',
          enum: ['erc20', 'erc721', 'nft', 'erc1155', 'staking', 'dao', 'custom'],
        },
        totalSupply: {
          type: 'number',
          description: 'Total token supply.',
        },
        initialSupply: {
          type: 'number',
          description: 'Alias for totalSupply.',
        },
        ownerAllocation: {
          type: 'number',
          description: 'Owner allocation.',
        },
        description: {
          type: 'string',
          description: 'Project description.',
        },
        imageUrl: {
          type: 'string',
          description: 'Token logo or NFT cover image URL.',
        },
        network: {
          type: 'string',
          description: 'Target EVM network.',
        },
      },
      required: ['contractName'],
    },
  },
  {
    name: 'mint_tokens',
    description: 'Mints new tokens from a deployed ERC-20 contract where the user vault is the owner/minter. Signs via MPC and waits for on-chain block receipt confirmation before returning success.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: { type: 'string', description: '0x-prefixed address of the deployed ERC-20 contract with a mint function' },
        recipientAddress: { type: 'string', description: '0x-prefixed address to receive the minted tokens (defaults to vault address if omitted)' },
        amount: { type: 'string', description: 'Amount of tokens to mint in human-readable units (e.g. "1000000")' },
        network: { type: 'string', description: 'Target blockchain: sepolia, base, ethereum, polygon, arbitrum, bsc' },
      },
      required: ['contractAddress', 'amount'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractAddress: { type: 'string', description: 'ERC-20 contract address' },
        recipientAddress: { type: 'string', description: 'Recipient address for minted tokens' },
        amount: { type: 'string', description: 'Amount to mint in human-readable units' },
        network: { type: 'string', description: 'Target network' },
      },
      required: ['contractAddress', 'amount'],
    },
  },
  {
    name: 'create_transaction_request',
    description: 'Prepares an unsigned transaction request, calculates gas fees & total cost, generates a single-use approval token and WebAuthn Passkey challenge. Returns an approval URL for human confirmation.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        recipient: {
          type: 'string',
          description: 'Recipient EVM 0x wallet address or contract address',
        },
        amount: {
          type: 'string',
          description: 'Amount to send (e.g. 0.05)',
        },
        asset: {
          type: 'string',
          description: 'Asset symbol (e.g. ETH, USDC, WBT)',
        },
        network: {
          type: 'string',
          description: 'Target EVM network (e.g. sepolia, base, ethereum, polygon)',
        },
        contractSummary: {
          type: 'string',
          description: 'Summary of the transaction or contract call',
        },
      },
      required: ['recipient', 'amount'],
    },
    parameters: {
      type: 'object',
      properties: {
        recipient: {
          type: 'string',
          description: 'Recipient EVM 0x wallet address or contract address',
        },
        amount: {
          type: 'string',
          description: 'Amount to send',
        },
        asset: {
          type: 'string',
          description: 'Asset symbol',
        },
        network: {
          type: 'string',
          description: 'Target EVM network',
        },
        contractSummary: {
          type: 'string',
          description: 'Summary of the transaction',
        },
      },
      required: ['recipient', 'amount'],
    },
  },
  {
    name: 'approve_transaction',
    description: 'Submits a client-side WebAuthn Passkey signature to validate a single-use approval token. Authorizes the Turnkey MPC hardware enclave quorum to co-sign, broadcasts on-chain, and waits for confirmed block receipt.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        approvalToken: {
          type: 'string',
          description: 'Single-use transaction approval token generated by create_transaction_request',
        },
        passkeyAssertion: {
          type: 'object',
          description: 'Optional WebAuthn authentication response from client passkey prompt',
          properties: {
            credentialId: { type: 'string' },
            clientDataJSON: { type: 'string' },
            authenticatorData: { type: 'string' },
            signature: { type: 'string' },
          },
        },
      },
      required: ['approvalToken'],
    },
    parameters: {
      type: 'object',
      properties: {
        approvalToken: {
          type: 'string',
          description: 'Single-use transaction approval token',
        },
      },
      required: ['approvalToken'],
    },
  },
  {
    name: 'reject_transaction',
    description: 'Rejects a pending transaction request and immediately invalidates its single-use approval token.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        approvalToken: {
          type: 'string',
          description: 'Approval token of the transaction request to reject',
        },
      },
      required: ['approvalToken'],
    },
    parameters: {
      type: 'object',
      properties: {
        approvalToken: {
          type: 'string',
          description: 'Approval token of the transaction request to reject',
        },
      },
      required: ['approvalToken'],
    },
  },
  {
    name: 'get_transaction_status',
    description: 'Polls the status of an asynchronous transaction request (pending_approval, approved, signing, broadcasted, confirmed, rejected, failed, expired). Returns confirmed on-chain block receipt details when complete.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        requestId: {
          type: 'string',
          description: 'Unique transaction request ID (req_...) or approval token (tok_...)',
        },
      },
      required: ['requestId'],
    },
    parameters: {
      type: 'object',
      properties: {
        requestId: {
          type: 'string',
          description: 'Unique transaction request ID or approval token',
        },
      },
      required: ['requestId'],
    },
  },
  {
    name: 'set_autonomous_scope',
    description: 'Grants or updates a scoped, revocable autonomous spending policy for AI agent operations without requiring Passkey taps for every micro-transaction. Enforces per-tx limits, rolling daily budget, allowed chains, and asset whitelists.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Vault address to apply policy to',
        },
        maxAmountPerTxUsd: {
          type: 'number',
          description: 'Maximum USD value allowed for a single autonomous transaction (e.g. 25.0)',
        },
        maxDailyBudgetUsd: {
          type: 'number',
          description: 'Maximum cumulative USD spend allowed in 24 hours (e.g. 100.0)',
        },
        allowedChains: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of allowed network names or chain IDs (e.g. ["base", "sepolia", "arbitrum"])',
        },
        allowedAssets: {
          type: 'string',
          description: 'Asset symbol whitelist or "ANY" (default: "ANY")',
        },
        durationDays: {
          type: 'number',
          description: 'Validity duration in days before automatic expiry (default: 30)',
        },
      },
      required: ['walletAddress', 'maxAmountPerTxUsd', 'maxDailyBudgetUsd'],
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Vault address',
        },
        maxAmountPerTxUsd: {
          type: 'number',
          description: 'Max USD per transaction',
        },
        maxDailyBudgetUsd: {
          type: 'number',
          description: 'Max USD daily budget',
        },
      },
      required: ['walletAddress', 'maxAmountPerTxUsd', 'maxDailyBudgetUsd'],
    },
  },
  {
    name: 'activate_kill_switch',
    description: 'Emergency security lockout: Instantly revokes all active autonomous spending scopes, voids outstanding approval tokens, and locks the vault against automated fund movement without requiring key rotation.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Vault address to lock immediately',
        },
        reason: {
          type: 'string',
          description: 'Reason for invoking emergency kill switch',
        },
      },
      required: ['walletAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Vault address to lock',
        },
        reason: {
          type: 'string',
          description: 'Reason for emergency lockout',
        },
      },
      required: ['walletAddress'],
    },
  },
  {
    name: 'deactivate_kill_switch',
    description: 'Unlocks a previously kill-switched vault after security review, restoring regular Passkey-gated transaction processing.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Vault address to unlock',
        },
      },
      required: ['walletAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Vault address to unlock',
        },
      },
      required: ['walletAddress'],
    },
  },
  {
    name: 'get_wallet_info',
    description: 'Retrieves current vault address, active chain, MPC provider status, and account metadata.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        chain: {
          type: 'string',
          description: 'Optional chain filter (ethereum, solana, bitcoin, polygon, arbitrum, bsc, base)',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        chain: {
          type: 'string',
          description: 'Optional chain filter',
        },
      },
    },
  },
  {
    name: 'get_portfolio',
    description: 'Fetches the complete asset portfolio including token balances, fiat USD valuations, 24h price changes, and net worth across EVM and Solana chains.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        hideZeroBalances: {
          type: 'boolean',
          description: 'Set to true to omit assets with 0 balance',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        hideZeroBalances: {
          type: 'boolean',
          description: 'Set to true to omit assets with 0 balance',
        },
      },
    },
  },
  {
    name: 'get_token_balance',
    description: 'Queries the exact balance and USD market value for a specific cryptocurrency token symbol.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Token ticker symbol (e.g. ETH, USDT, SOL, BTC, UNI, LINK)',
        },
      },
      required: ['symbol'],
    },
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Token ticker symbol',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_transaction_history',
    description: 'Retrieves on-chain verified transaction history, filtering and checking on-chain receipts (status: 1) for accurate audit reporting.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of transaction records to return (default 10)',
        },
        type: {
          type: 'string',
          description: 'Filter transaction type (send, receive, swap, stake, deploy)',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of transaction records to return',
        },
        type: {
          type: 'string',
          description: 'Filter transaction type',
        },
      },
    },
  },
  {
    name: 'get_gas_estimate',
    description: 'Fetches real-time base fee, priority fee, and EIP-1559 gas price estimates across all supported chains.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        chain: {
          type: 'string',
          description: 'Optional network ID filter',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        chain: {
          type: 'string',
          description: 'Optional network ID filter',
        },
      },
    },
  },
  {
    name: 'audit_smart_contract',
    description: 'Performs automated static security analysis and AI vulnerability scan on smart contract source code.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Solidity smart contract source code',
        },
      },
      required: ['code'],
    },
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Solidity smart contract source code',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'get_nft_gallery',
    description: 'Queries multi-chain blockchains to fetch all on-chain NFT assets (ERC-721 & ERC-1155), collections, metadata images, and contract balances.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Optional target wallet public address to query NFTs for.',
        },
        contractAddress: {
          type: 'string',
          description: 'Optional NFT contract address to check specific collection balances.',
        },
        chain: {
          type: 'string',
          description: 'Optional blockchain filter (sepolia, ethereum, base, polygon, arbitrum).',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Optional target wallet public address.',
        },
        contractAddress: {
          type: 'string',
          description: 'Optional NFT contract address.',
        },
        chain: {
          type: 'string',
          description: 'Optional blockchain filter.',
        },
      },
    },
  },
  {
    name: 'get_realtime_prices',
    description: 'Fetches real-time live market prices, 24h price changes, market cap, and volume for cryptocurrency tokens.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        symbols: { type: 'string', description: 'Comma-separated token symbols (e.g. "ETH,BTC,SOL,PEPE,DOGE")' },
        contractAddresses: { type: 'string', description: 'Comma-separated contract addresses' },
        chain: { type: 'string', description: 'Optional chain filter (default: all)' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        symbols: { type: 'string', description: 'Comma-separated token symbols' },
        contractAddresses: { type: 'string', description: 'Comma-separated contract addresses' },
        chain: { type: 'string', description: 'Optional chain filter' },
      },
    },
  },
  {
    name: 'get_trending_memecoins',
    description: 'Discovers and lists currently trending meme coins across blockchains with real-time prices, liquidity, volume, and GoPlus security audit scores.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        chain: { type: 'string', description: 'Filter by blockchain: ethereum, solana, bsc, base, arbitrum, polygon, or "all"' },
        limit: { type: 'number', description: 'Max number of trending tokens to return (default: 20)' },
        minLiquidity: { type: 'number', description: 'Minimum USD liquidity threshold (default: 10000)' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        chain: { type: 'string', description: 'Filter by blockchain' },
        limit: { type: 'number', description: 'Max results' },
        minLiquidity: { type: 'number', description: 'Min USD liquidity' },
      },
    },
  },
  {
    name: 'audit_token',
    description: 'Performs deep on-chain security audit of any token contract address using GoPlus Security API with explicit chain resolution.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: { type: 'string', description: 'Token contract address to audit' },
        chain: { type: 'string', description: 'Blockchain network: sepolia, ethereum, bsc, polygon, base, arbitrum, solana' },
      },
      required: ['contractAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractAddress: { type: 'string', description: 'Token contract address to audit' },
        chain: { type: 'string', description: 'Blockchain network' },
      },
      required: ['contractAddress'],
    },
  },
  {
    name: 'set_trade_order',
    description: 'Configures an automated stop-loss or take-profit price trigger order. Automatically registers a scoped autonomous spending allowance to execute the swap when market threshold is crossed.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token symbol or contract address (e.g. ETH, PEPE)' },
        orderType: { type: 'string', description: 'Order type: "stop_loss" or "take_profit"', enum: ['stop_loss', 'take_profit'] },
        triggerPrice: { type: 'number', description: 'USD price that triggers the order execution' },
        amount: { type: 'number', description: 'Amount of tokens to sell when triggered' },
        chain: { type: 'string', description: 'Blockchain: sepolia, base, ethereum, polygon, arbitrum (default: sepolia)' },
      },
      required: ['token', 'orderType', 'triggerPrice', 'amount'],
    },
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token symbol or contract address' },
        orderType: { type: 'string', description: 'stop_loss or take_profit', enum: ['stop_loss', 'take_profit'] },
        triggerPrice: { type: 'number', description: 'USD trigger price' },
        amount: { type: 'number', description: 'Token amount to trade' },
        chain: { type: 'string', description: 'Blockchain network' },
      },
      required: ['token', 'orderType', 'triggerPrice', 'amount'],
    },
  },
  {
    name: 'get_active_orders',
    description: 'Lists all active stop-loss and take-profit trade orders and their autonomous execution scopes.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by status: ACTIVE, EXECUTED, CANCELLED, FAILED, or "all"' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by order status' },
      },
    },
  },
  {
    name: 'cancel_trade_order',
    description: 'Cancels an active stop-loss or take-profit trade order and revokes its autonomous spending allowance.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'UUID of the trade order to cancel' },
      },
      required: ['orderId'],
    },
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'UUID of the trade order to cancel' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'check_wallet_health',
    description: 'Performs a comprehensive wallet health check: multi-chain balance overview, gas reserves, token diversity, and portfolio security.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', description: 'Optional wallet address to check' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', description: 'Optional wallet address' },
      },
    },
  },
  {
    name: 'verify_smart_contract',
    description: 'Verifies smart contract source code on block explorers (Etherscan, Sepolia Etherscan, Basescan, Polygonscan). Requires ETHERSCAN_API_KEY.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: { type: 'string', description: '0x-prefixed contract address to verify' },
        contractName: { type: 'string', description: 'Name of the smart contract' },
        sourceCode: { type: 'string', description: 'Solidity smart contract source code' },
        network: { type: 'string', description: 'Blockchain network: sepolia, ethereum, base, polygon, arbitrum' },
      },
      required: ['contractAddress', 'contractName'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractAddress: { type: 'string', description: 'Contract address to verify' },
        contractName: { type: 'string', description: 'Contract name' },
        sourceCode: { type: 'string', description: 'Solidity source code' },
        network: { type: 'string', description: 'Target network' },
      },
      required: ['contractAddress', 'contractName'],
    },
  },
  {
    name: 'create_smart_contract',
    description: 'Generates complete production-ready Solidity smart contract code based on user prompt and specifications.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Natural language specification of contract features' },
        contractName: { type: 'string', description: 'Name of the smart contract' },
        symbol: { type: 'string', description: 'Token ticker symbol' },
        contractType: { type: 'string', description: 'Template category (erc20, erc721, nft, custom)' },
        totalSupply: { type: 'number', description: 'Total token supply' },
      },
      required: ['prompt'],
    },
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Natural language specification' },
        contractName: { type: 'string', description: 'Contract name' },
        symbol: { type: 'string', description: 'Token symbol' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'upload_contract_asset',
    description: 'Uploads a token logo or NFT collection image asset to Supabase Storage and returns a public CDN URL.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        fileBase64: { type: 'string', description: 'Base64 encoded file string' },
        fileName: { type: 'string', description: 'Target file name' },
      },
      required: ['fileBase64'],
    },
    parameters: {
      type: 'object',
      properties: {
        fileBase64: { type: 'string', description: 'Base64 encoded file string' },
      },
      required: ['fileBase64'],
    },
  },
];
