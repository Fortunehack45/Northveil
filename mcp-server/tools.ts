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
    description: 'Deploys a compiled Solidity smart contract to a real EVM blockchain network (Sepolia, Ethereum, Polygon). REQUIRES USER APPROVAL BEFORE BROADCASTING.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        contractName: {
          type: 'string',
          description: 'Name of the smart contract to deploy (e.g. NorthveilToken)',
        },
        bytecode: {
          type: 'string',
          description: 'Optional compiled EVM bytecode string (0x...)',
        },
        abi: {
          type: 'string',
          description: 'Optional contract ABI JSON string',
        },
        network: {
          type: 'string',
          description: 'Target EVM network (sepolia, ethereum, polygon, arbitrum)',
        },
      },
      required: ['contractName'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractName: {
          type: 'string',
          description: 'Name of the smart contract to deploy (e.g. NorthveilToken)',
        },
        bytecode: {
          type: 'string',
          description: 'Optional compiled EVM bytecode string (0x...)',
        },
        abi: {
          type: 'string',
          description: 'Optional contract ABI JSON string',
        },
        network: {
          type: 'string',
          description: 'Target EVM network (sepolia, ethereum, polygon, arbitrum)',
        },
      },
      required: ['contractName'],
    },
  },
  {
    name: 'send_transfer',
    description: 'Executes an on-chain cryptocurrency transfer from the user wallet to a recipient address. REQUIRES USER APPROVAL BEFORE SENDING FUNDS.',
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
    description: 'Executes a DEX token swap or cross-chain bridge trade via 1inch/Uniswap aggregation. REQUIRES USER APPROVAL BEFORE SWAPPING.',
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
    description: 'Generates complete production-ready Solidity or Rust smart contract code based on a prompt.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Natural language specification of contract features',
        },
        contractType: {
          type: 'string',
          description: 'Template category (erc20, erc721, staking, dao, custom)',
          enum: ['erc20', 'erc721', 'staking', 'dao', 'custom'],
        },
      },
      required: ['prompt'],
    },
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Natural language specification of contract features',
        },
        contractType: {
          type: 'string',
          description: 'Template category (erc20, erc721, staking, dao, custom)',
          enum: ['erc20', 'erc721', 'staking', 'dao', 'custom'],
        },
      },
      required: ['prompt'],
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
    name: 'get_nft_gallery',
    description: 'Lists owned NFTs across Ethereum, Solana, Polygon, and Arbitrum with floor prices.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        chain: {
          type: 'string',
          description: 'Optional chain filter',
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
];
