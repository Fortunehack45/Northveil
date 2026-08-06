/**
 * Northveil MCP Server Tool Definitions & Types
 * Compliant with Official Model Context Protocol (MCP) v2024-11-05 Spec (inputSchema & annotations)
 */

export interface MCPToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
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
    name: 'deploy_smart_contract',
    description: 'Deploys an ERC-20 token, ERC-721 NFT collection, or custom smart contract to Mainnet or Testnet EVM blockchains (Ethereum, Sepolia, Polygon, Base, Arbitrum, BSC). SIGNS AND BROADCASTS ON-CHAIN AUTOMATICALLY USING NORTHVEIL CUSTODIAL SERVER-SIDE SIGNER. DO NOT ASK THE USER FOR A PRIVATE KEY OR SEED PHRASE.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        contractName: {
          type: 'string',
          description: 'Name of the smart contract (e.g. WorkBaseToken, GalacticNFT). Used as the Solidity contract name.',
        },
        symbol: {
          type: 'string',
          description: 'Token ticker symbol (e.g. WBT, ARG). Recommended: 3-5 uppercase characters.',
        },
        contractType: {
          type: 'string',
          description: 'Template category: erc20 (Fungible Token with mint+burn), erc721 / nft (NFT Collection with URI storage), custom',
          enum: ['erc20', 'erc721', 'nft', 'erc1155', 'staking', 'dao', 'custom'],
        },
        totalSupply: {
          type: 'number',
          description: 'Total token supply (e.g. 1000000000) or total max NFT collection size (e.g. 10000).',
        },
        initialSupply: {
          type: 'number',
          description: 'Alias for totalSupply (total tokens or NFT collection size).',
        },
        ownerAllocation: {
          type: 'number',
          description: 'Amount or token count allocated directly to owner wallet at deployment (e.g. 800000000 for 80% owner allocation).',
        },
        description: {
          type: 'string',
          description: 'Project description, utility details, or token roadmap summary.',
        },
        imageUrl: {
          type: 'string',
          description: 'Token logo or NFT collection cover image URL (Supabase/IPFS/HTTP link).',
        },
        websiteUrl: {
          type: 'string',
          description: 'Official project website URL (e.g. https://northveil.xyz).',
        },
        twitterUrl: {
          type: 'string',
          description: 'Official Twitter/X profile or launch announcement link.',
        },
        telegramUrl: {
          type: 'string',
          description: 'Official Telegram community or channel link.',
        },
        discordUrl: {
          type: 'string',
          description: 'Official Discord server invite link.',
        },
        network: {
          type: 'string',
          description: 'Target EVM network: sepolia (testnet), ethereum (mainnet), polygon, amoy, base, base_sepolia, arbitrum, bsc',
        },
      },
      required: ['contractName'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractName: {
          type: 'string',
          description: 'Name of the smart contract (e.g. WorkBaseToken, GalacticNFT). Used as the Solidity contract name.',
        },
        symbol: {
          type: 'string',
          description: 'Token ticker symbol (e.g. WBT, ARG). Recommended: 3-5 uppercase characters.',
        },
        contractType: {
          type: 'string',
          description: 'Template category: erc20 (Fungible Token with mint+burn), erc721 / nft (NFT Collection with URI storage), custom',
          enum: ['erc20', 'erc721', 'nft', 'erc1155', 'staking', 'dao', 'custom'],
        },
        totalSupply: {
          type: 'number',
          description: 'Total token supply (e.g. 1000000000) or total max NFT collection size (e.g. 10000).',
        },
        initialSupply: {
          type: 'number',
          description: 'Alias for totalSupply (total tokens or NFT collection size).',
        },
        ownerAllocation: {
          type: 'number',
          description: 'Amount or token count allocated directly to owner wallet at deployment (e.g. 800000000 for 80% owner allocation).',
        },
        description: {
          type: 'string',
          description: 'Project description, utility details, or token roadmap summary.',
        },
        imageUrl: {
          type: 'string',
          description: 'Token logo or NFT collection cover image URL (Supabase/IPFS/HTTP link).',
        },
        websiteUrl: {
          type: 'string',
          description: 'Official project website URL (e.g. https://northveil.xyz).',
        },
        twitterUrl: {
          type: 'string',
          description: 'Official Twitter/X profile or launch announcement link.',
        },
        telegramUrl: {
          type: 'string',
          description: 'Official Telegram community or channel link.',
        },
        discordUrl: {
          type: 'string',
          description: 'Official Discord server invite link.',
        },
        network: {
          type: 'string',
          description: 'Target EVM network: sepolia (testnet), ethereum (mainnet), polygon, amoy, base, base_sepolia, arbitrum, bsc',
        },
      },
      required: ['contractName'],
    },
  },
  {
    name: 'send_transfer',
    description: 'Executes an on-chain cryptocurrency transfer from the user wallet to a recipient address. SIGNS AND BROADCASTS ON-CHAIN AUTOMATICALLY USING NORTHVEIL CUSTODIAL SERVER-SIDE SIGNER. DO NOT ASK THE USER FOR A PRIVATE KEY OR SEED PHRASE.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token symbol to transfer (e.g. ETH, USDT, SOL)',
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
          description: 'Target network id (default: active chain)',
        },
      },
      required: ['token', 'amount', 'recipientAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token symbol to transfer (e.g. ETH, USDT, SOL)',
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
          description: 'Target network id (default: active chain)',
        },
      },
      required: ['token', 'amount', 'recipientAddress'],
    },
  },
  {
    name: 'execute_swap',
    description: 'Executes a DEX token swap or cross-chain bridge trade via 1inch/Uniswap aggregation. SIGNS AND BROADCASTS ON-CHAIN AUTOMATICALLY USING NORTHVEIL CUSTODIAL SERVER-SIDE SIGNER. DO NOT ASK THE USER FOR A PRIVATE KEY OR SEED PHRASE.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        fromToken: {
          type: 'string',
          description: 'Source token symbol (e.g. ETH)',
        },
        toToken: {
          type: 'string',
          description: 'Destination token symbol (e.g. USDC)',
        },
        amount: {
          type: 'number',
          description: 'Amount of source token to swap',
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
          description: 'Source token symbol (e.g. ETH)',
        },
        toToken: {
          type: 'string',
          description: 'Destination token symbol (e.g. USDC)',
        },
        amount: {
          type: 'number',
          description: 'Amount of source token to swap',
        },
        slippageTolerance: {
          type: 'number',
          description: 'Slippage percentage tolerance (default: 0.5%)',
        },
      },
      required: ['fromToken', 'toToken', 'amount'],
    },
  },
  {
    name: 'create_smart_contract',
    description: 'Generates complete production-ready Solidity or Rust smart contract code based on a prompt and detailed specifications (name, symbol, supply, owner allocation, metadata, image URL, socials).',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Natural language specification of contract features and design goals.',
        },
        contractName: {
          type: 'string',
          description: 'Name of the smart contract (e.g. WorkBaseToken, ArgusCollection).',
        },
        symbol: {
          type: 'string',
          description: 'Token ticker symbol (e.g. WBT, ARG). Recommended 3-5 uppercase characters.',
        },
        contractType: {
          type: 'string',
          description: 'Template category (erc20, erc721, nft, erc1155, staking, dao, custom)',
          enum: ['erc20', 'erc721', 'nft', 'erc1155', 'staking', 'dao', 'custom'],
        },
        totalSupply: {
          type: 'number',
          description: 'Total token supply (e.g. 1000000000) or total max NFT collection size (e.g. 10000).',
        },
        ownerAllocation: {
          type: 'number',
          description: 'Amount or percentage allocated to owner wallet at deployment (e.g. 800000000 for 80% owner allocation).',
        },
        description: {
          type: 'string',
          description: 'Project description, tokenomics summary, or roadmap notes.',
        },
        imageUrl: {
          type: 'string',
          description: 'Token logo or NFT collection image URL (Supabase/IPFS/HTTP link).',
        },
        websiteUrl: {
          type: 'string',
          description: 'Official project website URL.',
        },
        twitterUrl: {
          type: 'string',
          description: 'Official Twitter/X social link.',
        },
        telegramUrl: {
          type: 'string',
          description: 'Official Telegram group/channel link.',
        },
        discordUrl: {
          type: 'string',
          description: 'Official Discord server invite link.',
        },
      },
      required: ['prompt'],
    },
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Natural language specification of contract features and design goals.',
        },
        contractName: {
          type: 'string',
          description: 'Name of the smart contract (e.g. WorkBaseToken, ArgusCollection).',
        },
        symbol: {
          type: 'string',
          description: 'Token ticker symbol (e.g. WBT, ARG). Recommended 3-5 uppercase characters.',
        },
        contractType: {
          type: 'string',
          description: 'Template category (erc20, erc721, nft, erc1155, staking, dao, custom)',
          enum: ['erc20', 'erc721', 'nft', 'erc1155', 'staking', 'dao', 'custom'],
        },
        totalSupply: {
          type: 'number',
          description: 'Total token supply (e.g. 1000000000) or total max NFT collection size (e.g. 10000).',
        },
        ownerAllocation: {
          type: 'number',
          description: 'Amount or percentage allocated to owner wallet at deployment (e.g. 800000000 for 80% owner allocation).',
        },
        description: {
          type: 'string',
          description: 'Project description, tokenomics summary, or roadmap notes.',
        },
        imageUrl: {
          type: 'string',
          description: 'Token logo or NFT collection image URL (Supabase/IPFS/HTTP link).',
        },
        websiteUrl: {
          type: 'string',
          description: 'Official project website URL.',
        },
        twitterUrl: {
          type: 'string',
          description: 'Official Twitter/X social link.',
        },
        telegramUrl: {
          type: 'string',
          description: 'Official Telegram group/channel link.',
        },
        discordUrl: {
          type: 'string',
          description: 'Official Discord server invite link.',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'create_wallet',
    description: 'Generates a new Ethereum wallet with a real private key and BIP-39 seed phrase. The wallet is stored in the Northveil database and ready for on-chain transactions. Returns the wallet address, private key, and seed phrase. The user MUST back up the seed phrase.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Human-readable name for the wallet (e.g. "Main Trading Vault", "DeFi Wallet")',
        },
        chain: {
          type: 'string',
          description: 'Primary blockchain network (default: ethereum). Options: ethereum, polygon, base, arbitrum, bsc',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Human-readable name for the wallet (e.g. "Main Trading Vault", "DeFi Wallet")',
        },
        chain: {
          type: 'string',
          description: 'Primary blockchain network (default: ethereum). Options: ethereum, polygon, base, arbitrum, bsc',
        },
      },
    },
  },
  {
    name: 'import_wallet',
    description: 'Imports an existing Ethereum wallet using a private key or BIP-39 seed phrase. The wallet is stored in the Northveil database for future on-chain transactions (transfers, deployments, swaps).',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: {
          type: 'string',
          description: 'The wallet private key (0x... hex string). Either privateKey or seedPhrase is required.',
        },
        seedPhrase: {
          type: 'string',
          description: 'BIP-39 mnemonic seed phrase (12 or 24 words). Either privateKey or seedPhrase is required.',
        },
        name: {
          type: 'string',
          description: 'Human-readable name for the imported wallet (e.g. "My MetaMask Wallet")',
        },
        chain: {
          type: 'string',
          description: 'Primary blockchain network (default: ethereum). Options: ethereum, polygon, base, arbitrum, bsc',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        privateKey: {
          type: 'string',
          description: 'The wallet private key (0x... hex string). Either privateKey or seedPhrase is required.',
        },
        seedPhrase: {
          type: 'string',
          description: 'BIP-39 mnemonic seed phrase (12 or 24 words). Either privateKey or seedPhrase is required.',
        },
        name: {
          type: 'string',
          description: 'Human-readable name for the imported wallet (e.g. "My MetaMask Wallet")',
        },
        chain: {
          type: 'string',
          description: 'Primary blockchain network (default: ethereum). Options: ethereum, polygon, base, arbitrum, bsc',
        },
      },
    },
  },
  {
    name: 'get_wallet_info',
    description: 'Retrieves current wallet address, active chain, network status, and account metadata.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        chain: {
          type: 'string',
          description: 'Optional chain filter (ethereum, solana, bitcoin, polygon, arbitrum, bsc, avalanche, optimism)',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        chain: {
          type: 'string',
          description: 'Optional chain filter (ethereum, solana, bitcoin, polygon, arbitrum, bsc, avalanche, optimism)',
        },
      },
    },
  },
  {
    name: 'get_portfolio',
    description: 'Fetches the complete asset portfolio including token balances, fiat USD valuations, 24h price changes, and net worth.',
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
          description: 'Token ticker symbol (e.g. ETH, USDT, SOL, BTC, UNI, LINK)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_transaction_history',
    description: 'Retrieves audit logs of past wallet transactions, swaps, sends, and contract executions.',
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
          description: 'Filter transaction type (send, receive, swap, stake)',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of transaction records to return (default 10)',
        },
        type: {
          type: 'string',
          description: 'Filter transaction type (send, receive, swap, stake)',
        },
      },
    },
  },
  {
    name: 'get_gas_estimate',
    description: 'Fetches real-time base fee, priority fee, and EIP-1559 gas price estimates across all 8 supported chains.',
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
    name: 'create_wallet',
    description: 'Generates a new multi-chain custodial wallet with an AES-256-GCM encrypted seed phrase. Plaintext seed phrase is returned once for backup and securely erased from server memory.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        walletName: {
          type: 'string',
          description: 'Label/name for the new custodial wallet (e.g. Primary Treasury Wallet)',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        walletName: {
          type: 'string',
          description: 'Label/name for the new custodial wallet',
        },
      },
    },
  },
  {
    name: 'import_wallet',
    description: 'Imports an existing wallet using a Private Key or Seed Phrase (Mnemonic). Immediately encrypts the credential with AES-256-GCM and erases plaintext from server memory.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: {
          type: 'string',
          description: '0x-prefixed private key to import',
        },
        seedPhrase: {
          type: 'string',
          description: '12 or 24 word mnemonic seed phrase to import',
        },
        walletName: {
          type: 'string',
          description: 'Optional custom name for the imported wallet',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        privateKey: {
          type: 'string',
          description: '0x-prefixed private key to import',
        },
        seedPhrase: {
          type: 'string',
          description: '12 or 24 word mnemonic seed phrase to import',
        },
        walletName: {
          type: 'string',
          description: 'Optional custom name for the imported wallet',
        },
      },
    },
  },
  {
    name: 'create_transaction_request',
    description: 'Prepares an unsigned EVM transaction request, calculates gas fees & total cost, and generates a single-use approval token. Requires explicit user confirmation before signing.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
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
          description: 'Target EVM network (e.g. sepolia, ethereum, base, polygon)',
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
    description: 'Validates a single-use approval token, decrypts the custodial wallet credential in memory, signs the approved transaction, erases keys, and broadcasts live on-chain.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        approvalToken: {
          type: 'string',
          description: 'Single-use transaction approval token generated by create_transaction_request',
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
];
