/**
 * Northveil MCP Server Tool Definitions & Types
 * Compliant with Official Model Context Protocol (MCP) v2024-11-05 Spec (inputSchema) & OpenAPI 3.0 (parameters)
 */

export interface MCPToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
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
    name: 'get_wallet_info',
    description: 'Retrieves current wallet address, active chain, network status, and account metadata.',
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
    name: 'send_transfer',
    description: 'Executes an on-chain cryptocurrency transfer from the user wallet to a destination recipient address.',
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
    name: 'create_smart_contract',
    description: 'Generates complete production-ready Solidity or Rust smart contract code based on a natural language specification prompt using Groq AI.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Natural language specification of contract features (e.g. "Staking vault with 14 day lockup")',
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
          description: 'Natural language specification of contract features (e.g. "Staking vault with 14 day lockup")',
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
    name: 'execute_swap',
    description: 'Executes a cross-DEX token swap or cross-chain bridge trade via 1inch/Uniswap/Li.Fi aggregation.',
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
    name: 'get_transaction_history',
    description: 'Retrieves audit logs of past wallet transactions, swaps, sends, and contract executions.',
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
    description: 'Performs automated static security analysis and AI vulnerability scan on a given smart contract byte or Solidity code string.',
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
