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
  properties?: Record<string, any>;
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
    name: 'northveil_health',
    description: 'Returns server operational status, protocol version, authentication state, device signer online status, and supported networks (Base, Sepolia, Ethereum, Polygon, Arbitrum, BSC, Solana).',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {},
    },
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'northveil_list_wallets',
    description: 'Lists all user-authorized non-custodial vaults, public addresses, and primary chains managed under the Northveil control plane.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User identifier or account handle (default: default_user)',
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
      },
    },
  },
  {
    name: 'northveil_get_balances',
    description: 'Retrieves real-time verified on-chain native and token balances for an authorized vault on Base, Sepolia, Ethereum, or other EVM chains.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: '0x public address of the vault wallet (defaults to active user vault)',
        },
        network: {
          type: 'string',
          description: 'Target blockchain network: base, sepolia, ethereum, polygon, arbitrum, bsc, solana. Default: base',
        },
        tokenAddress: {
          type: 'string',
          description: 'Optional contract address of a specific ERC-20 token',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: '0x public address of the vault wallet',
        },
        network: {
          type: 'string',
          description: 'Target blockchain network',
        },
        tokenAddress: {
          type: 'string',
          description: 'Optional contract address of a specific ERC-20 token',
        },
      },
    },
  },
  {
    name: 'northveil_get_portfolio',
    description: 'Aggregates multi-chain token holdings, native balances, and total USD net worth across all supported networks.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: '0x public address of the vault wallet (defaults to active user vault)',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: '0x public address of the vault wallet',
        },
      },
    },
  },
  {
    name: 'northveil_list_nfts',
    description: 'Retrieves verified NFT digital collectibles, contract metadata, token IDs, and asset media across EVM and Solana.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: '0x public address of the vault wallet',
        },
        network: {
          type: 'string',
          description: 'Blockchain network (default: base)',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: '0x public address of the vault wallet',
        },
        network: {
          type: 'string',
          description: 'Blockchain network',
        },
      },
    },
  },
  {
    name: 'northveil_get_tx',
    description: 'Fetches verified transaction status, block confirmations, gas metrics, and block explorer link for a transaction hash or staged request ID.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        txHash: {
          type: 'string',
          description: 'On-chain transaction hash (0x...)',
        },
        requestId: {
          type: 'string',
          description: 'Staged request ID (req_...)',
        },
        network: {
          type: 'string',
          description: 'Blockchain network (default: base)',
        },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        txHash: {
          type: 'string',
          description: 'On-chain transaction hash',
        },
        requestId: {
          type: 'string',
          description: 'Staged request ID',
        },
        network: {
          type: 'string',
          description: 'Blockchain network',
        },
      },
    },
  },
  {
    name: 'northveil_simulate_tx',
    description: 'Performs dry-run fork simulation of a transaction, computing state diffs, balance deltas, gas usage, and verifying no reverts occur.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Target destination or contract address (0x...)',
        },
        value: {
          type: 'string',
          description: 'Native crypto value to transfer (e.g. 0.01)',
        },
        data: {
          type: 'string',
          description: 'Calldata payload (0x...) for contract interactions',
        },
        network: {
          type: 'string',
          description: 'Blockchain network (default: base)',
        },
        from: {
          type: 'string',
          description: 'Optional sender address (defaults to active user vault)',
        },
      },
      required: ['to'],
    },
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Target destination or contract address',
        },
        value: {
          type: 'string',
          description: 'Native crypto value to transfer',
        },
        data: {
          type: 'string',
          description: 'Calldata payload',
        },
        network: {
          type: 'string',
          description: 'Blockchain network',
        },
        from: {
          type: 'string',
          description: 'Optional sender address',
        },
      },
      required: ['to'],
    },
  },
  {
    name: 'northveil_inspect_contract',
    description: 'Inspects a deployed smart contract bytecode, decompiled interfaces, and Etherscan/Basescan verified source code.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Target smart contract address (0x...)',
        },
        network: {
          type: 'string',
          description: 'Blockchain network (default: base)',
        },
      },
      required: ['contractAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Target smart contract address',
        },
        network: {
          type: 'string',
          description: 'Blockchain network',
        },
      },
      required: ['contractAddress'],
    },
  },
  {
    name: 'northveil_audit_contract',
    description: 'Runs an automated AST security scan and honeypot analysis on a token or smart contract, checking for mint backdoors, hidden taxes, and liquidity locks.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Token or smart contract address (0x...) to audit',
        },
        network: {
          type: 'string',
          description: 'Blockchain network (default: base)',
        },
      },
      required: ['contractAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Token or smart contract address to audit',
        },
        network: {
          type: 'string',
          description: 'Blockchain network',
        },
      },
      required: ['contractAddress'],
    },
  },
  {
    name: 'northveil_prepare_transfer',
    description: 'Stages a native or ERC-20 transfer intent, calculates gas fees, performs fork simulation, and returns a structured preview with approval ID for on-device biometric confirmation. Does NOT sign or broadcast.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Destination recipient address (0x...)',
        },
        amount: {
          type: 'number',
          description: 'Amount of crypto units to transfer',
        },
        asset: {
          type: 'string',
          description: 'Token symbol (default: ETH)',
        },
        network: {
          type: 'string',
          description: 'Target blockchain network: base, sepolia, ethereum, polygon, arbitrum, bsc. Default: base',
        },
        walletAddress: {
          type: 'string',
          description: 'Optional sender vault address (defaults to active user vault)',
        },
        reason: {
          type: 'string',
          description: 'Optional transfer description or memo',
        },
      },
      required: ['to', 'amount'],
    },
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Destination recipient address',
        },
        amount: {
          type: 'number',
          description: 'Amount of crypto units to transfer',
        },
        asset: {
          type: 'string',
          description: 'Token symbol',
        },
        network: {
          type: 'string',
          description: 'Target blockchain network',
        },
        walletAddress: {
          type: 'string',
          description: 'Optional sender vault address',
        },
        reason: {
          type: 'string',
          description: 'Optional transfer description or memo',
        },
      },
      required: ['to', 'amount'],
    },
  },
  {
    name: 'northveil_prepare_swap',
    description: 'Stages a DEX swap route intent with slippage protection and gas estimation, returning a structured preview with approval ID for on-device biometric confirmation. Does NOT sign or broadcast.',
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
          description: 'Destination token symbol (e.g. USDC, DEGEN, UNI)',
        },
        amount: {
          type: 'number',
          description: 'Amount of source token to swap',
        },
        network: {
          type: 'string',
          description: 'Target network (default: base)',
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
          description: 'Target network',
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
    name: 'northveil_prepare_contract_call',
    description: 'Stages an arbitrary smart contract invocation with ABI encoding and simulation, returning a structured preview with approval ID for on-device biometric confirmation. Does NOT sign or broadcast.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Target smart contract address (0x...)',
        },
        method: {
          type: 'string',
          description: 'Contract method name to execute',
        },
        args: {
          type: 'array',
          items: { type: 'string' },
          description: 'Method parameter arguments array',
        },
        value: {
          type: 'string',
          description: 'Native value to send in ETH (default: 0)',
        },
        network: {
          type: 'string',
          description: 'Blockchain network (default: base)',
        },
      },
      required: ['contractAddress', 'method'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Target smart contract address',
        },
        method: {
          type: 'string',
          description: 'Contract method name to execute',
        },
        args: {
          type: 'array',
          items: { type: 'string' },
          description: 'Method parameter arguments array',
        },
        value: {
          type: 'string',
          description: 'Native value to send in ETH',
        },
        network: {
          type: 'string',
          description: 'Blockchain network',
        },
      },
      required: ['contractAddress', 'method'],
    },
  },
  {
    name: 'northveil_prepare_deploy',
    description: 'Stages a smart contract deployment ceremony with compiler verification, returning a structured preview with approval ID for on-device biometric confirmation. Does NOT sign or broadcast.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        contractName: {
          type: 'string',
          description: 'Contract name identifier',
        },
        sourceCode: {
          type: 'string',
          description: 'Solidity source code (v0.8.20+)',
        },
        constructorArgs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Constructor parameter arguments',
        },
        network: {
          type: 'string',
          description: 'Target network (default: base)',
        },
      },
      required: ['contractName'],
    },
    parameters: {
      type: 'object',
      properties: {
        contractName: {
          type: 'string',
          description: 'Contract name identifier',
        },
        sourceCode: {
          type: 'string',
          description: 'Solidity source code',
        },
        constructorArgs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Constructor parameter arguments',
        },
        network: {
          type: 'string',
          description: 'Target network',
        },
      },
      required: ['contractName'],
    },
  },
  {
    name: 'northveil_request_broadcast',
    description: 'Requests on-chain broadcast of a previously staged transaction once human intent has been confirmed. Returns broadcast transaction hash or pending_device status if awaiting biometric signature.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        approval_id: {
          type: 'string',
          description: 'The approval ID (appr_... or tok_...) returned by northveil_prepare_*',
        },
        passkeyAssertion: {
          type: 'object',
          description: 'Optional WebAuthn cryptographic passkey assertion from device',
        },
      },
      required: ['approval_id'],
    },
    parameters: {
      type: 'object',
      properties: {
        approval_id: {
          type: 'string',
          description: 'The approval ID returned by northveil_prepare_*',
        },
        passkeyAssertion: {
          type: 'object',
          description: 'Optional WebAuthn cryptographic passkey assertion from device',
        },
      },
      required: ['approval_id'],
    },
  },
  {
    name: 'northveil_get_approval_status',
    description: 'Queries the real-time status of a staged approval request (pending_device, confirmed, broadcasted, rejected, expired).',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        approval_id: {
          type: 'string',
          description: 'The approval ID (appr_... or tok_...) to check',
        },
      },
      required: ['approval_id'],
    },
    parameters: {
      type: 'object',
      properties: {
        approval_id: {
          type: 'string',
          description: 'The approval ID to check',
        },
      },
      required: ['approval_id'],
    },
  },
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
  {
    name: 'generate_passkey_registration_options',
    description: 'Generates WebAuthn registration options and challenge for registering a biometric passkey (TouchID, FaceID, Windows Hello, YubiKey) to authorize MPC vault transactions.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID or wallet handle' },
        userName: { type: 'string', description: 'User email or username' },
        userDisplayName: { type: 'string', description: 'Display name for the passkey credential' },
      },
      required: ['userId'],
    },
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID or wallet handle' },
      },
      required: ['userId'],
    },
  },
  {
    name: 'verify_passkey_registration',
    description: 'Verifies the client WebAuthn registration response and registers the passkey public key and counter in the MPC security module.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        walletAddress: { type: 'string', description: '0x-prefixed wallet address bound to this passkey' },
        registrationResponse: { type: 'object', description: 'WebAuthn registration response object from navigator.credentials.create()' },
      },
      required: ['userId', 'walletAddress', 'registrationResponse'],
    },
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        walletAddress: { type: 'string', description: 'Wallet address' },
        registrationResponse: { type: 'object', description: 'Registration response' },
      },
      required: ['userId', 'walletAddress', 'registrationResponse'],
    },
  },
  {
    name: 'approve_transaction_with_passkey',
    description: 'Cryptographically verifies a user biometric passkey assertion against the staged approval token and executes Turnkey TEE MPC signing and on-chain broadcast.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        approvalToken: { type: 'string', description: 'Single-use staged transaction approval token (tok_...)' },
        passkeyAssertion: {
          type: 'object',
          description: 'WebAuthn authentication assertion from navigator.credentials.get() (credentialId, authenticatorData, clientDataJSON, signature)',
        },
        userId: { type: 'string', description: 'User identifier (default: default_user)' },
      },
      required: ['approvalToken'],
    },
    parameters: {
      type: 'object',
      properties: {
        approvalToken: { type: 'string', description: 'Approval token' },
        passkeyAssertion: { type: 'object', description: 'WebAuthn assertion object' },
      },
      required: ['approvalToken'],
    },
  },
  {
    name: 'set_autonomous_spending_scope',
    description: 'Grants an autonomous spending limit policy to AI agents for automated trades, swaps, and transfers without individual passkey prompts up to defined per-tx and daily caps.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', description: '0x-prefixed vault wallet address' },
        asset: { type: 'string', description: 'Asset symbol (e.g. ETH, USDC, or ANY)' },
        maxAmountPerTxUsd: { type: 'number', description: 'Maximum USD amount allowed per single autonomous transaction (default: 25.0)' },
        maxDailyBudgetUsd: { type: 'number', description: 'Maximum 24-hour total USD budget (default: 100.0)' },
        allowedChains: { type: 'array', items: { type: 'number' }, description: 'Array of allowed chain IDs (e.g. [11155111, 8453])' },
        allowedContracts: { type: 'array', items: { type: 'string' }, description: 'Optional list of whitelisted contract addresses' },
        userId: { type: 'string', description: 'User identifier (default: default_user)' },
      },
      required: ['walletAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', description: 'Vault wallet address' },
        asset: { type: 'string', description: 'Asset symbol' },
        maxAmountPerTxUsd: { type: 'number', description: 'Max per-tx USD cap' },
        maxDailyBudgetUsd: { type: 'number', description: 'Daily USD budget' },
      },
      required: ['walletAddress'],
    },
  },
  {
    name: 'activate_kill_switch',
    description: 'Emergency security lockout: Immediately revokes all active autonomous spending allowances, voids all pending approval tokens, and locks down the MPC vault against any AI agent execution.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', description: '0x-prefixed wallet address to lock' },
        userId: { type: 'string', description: 'User ID (default: default_user)' },
        reason: { type: 'string', description: 'Reason for emergency lockout' },
      },
      required: ['walletAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', description: 'Wallet address' },
        reason: { type: 'string', description: 'Reason' },
      },
      required: ['walletAddress'],
    },
  },
  {
    name: 'deactivate_kill_switch',
    description: 'Restores MPC vault operations following an emergency lockout after identity verification.',
    annotations: { readOnly: false, destructive: false, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', description: '0x-prefixed wallet address to unlock' },
        userId: { type: 'string', description: 'User ID (default: default_user)' },
      },
      required: ['walletAddress'],
    },
    parameters: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', description: 'Wallet address' },
      },
      required: ['walletAddress'],
    },
  },
  {
    name: 'northveil_list_wallets',
    description: 'Lists all non-custodial wallets and vault references authorized for the calling agent client. Returns public addresses, chain types, and status. Never reveals private keys.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User account identifier' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User account identifier' },
      },
    },
  },
  {
    name: 'northveil_get_balances',
    description: 'Fetches real on-chain native (ETH, SOL, MATIC, BNB) and ERC-20/SPL token balances with real-time USD valuations across all supported chains.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        wallet_id: { type: 'string', description: 'Optional specific wallet identifier or 0x address' },
        chain: { type: 'string', description: 'Optional chain filter: base, ethereum, sepolia, arbitrum, polygon, solana' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        wallet_id: { type: 'string', description: 'Wallet address or identifier' },
        chain: { type: 'string', description: 'Chain filter' },
      },
    },
  },
  {
    name: 'northveil_get_portfolio',
    description: 'Returns comprehensive multi-chain portfolio analytics including token breakdown, total portfolio net worth in USD, and 24h PnL metrics.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        wallet_id: { type: 'string', description: 'Wallet address or identifier' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        wallet_id: { type: 'string', description: 'Wallet address or identifier' },
      },
    },
  },
  {
    name: 'northveil_list_nfts',
    description: 'Queries on-chain NFT assets (ERC-721, ERC-1155, and Solana Metaplex) owned by the vault across 37+ EVM indexers and Solana.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        wallet_id: { type: 'string', description: 'Wallet public address' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        wallet_id: { type: 'string', description: 'Wallet address' },
      },
    },
  },
  {
    name: 'northveil_get_tx',
    description: 'Queries real-time lifecycle status, block confirmation height, gas consumed, and explorer receipt for a transaction or approval ID.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        approval_id: { type: 'string', description: 'Approval request ID (e.g. appr_...)' },
        tx_hash: { type: 'string', description: 'On-chain transaction hash' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        approval_id: { type: 'string', description: 'Approval ID' },
        tx_hash: { type: 'string', description: 'Transaction hash' },
      },
    },
  },
  {
    name: 'northveil_simulate_tx',
    description: 'Performs pre-flight bytecode and state simulation (via Tenderly / eth_call) to predict gas costs, balance deltas, and detect reverts prior to staging.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Target contract or recipient address' },
        value: { type: 'string', description: 'Native asset value in Wei or Ether string' },
        data: { type: 'string', description: 'Hex-encoded transaction calldata' },
        chain: { type: 'string', description: 'Target network: base, ethereum, sepolia, arbitrum, polygon' },
      },
      required: ['to'],
    },
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Target address' },
        value: { type: 'string', description: 'Value in Wei' },
        data: { type: 'string', description: 'Calldata' },
        chain: { type: 'string', description: 'Network' },
      },
      required: ['to'],
    },
  },
  {
    name: 'northveil_estimate_gas',
    description: 'Calculates real-time EIP-1559 Base Fee, Max Priority Fee, and Estimated Gas Units for a target blockchain network.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        chain: { type: 'string', description: 'Blockchain network name' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        chain: { type: 'string', description: 'Network name' },
      },
    },
  },
  {
    name: 'northveil_inspect_contract',
    description: 'Inspects verified contract bytecode, ABI functions, state variables, and token metadata on Blockscout / Etherscan.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        contract_address: { type: 'string', description: '0x contract address to inspect' },
        chain: { type: 'string', description: 'Blockchain network' },
      },
      required: ['contract_address'],
    },
    parameters: {
      type: 'object',
      properties: {
        contract_address: { type: 'string', description: 'Contract address' },
        chain: { type: 'string', description: 'Network' },
      },
      required: ['contract_address'],
    },
  },
  {
    name: 'northveil_audit_contract',
    description: 'Executes automated static analysis and security auditing for vulnerabilities (reentrancy, flash loan exploits, hidden mint privileges, honeypots).',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        source_code: { type: 'string', description: 'Solidity source code' },
        contract_address: { type: 'string', description: 'Deployed contract address' },
        chain: { type: 'string', description: 'Blockchain network' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        source_code: { type: 'string', description: 'Source code' },
        contract_address: { type: 'string', description: 'Contract address' },
        chain: { type: 'string', description: 'Network' },
      },
    },
  },
  {
    name: 'northveil_prepare_transfer',
    description: 'Prepares and stages a value-moving transfer of native or ERC-20/SPL tokens. Evaluates policy grant; returns either AUTO_EXECUTE output or NEEDS_APPROVAL preview card with a single-use token.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient address (0x... or Solana Base58)' },
        amount: { type: 'number', description: 'Amount of crypto units (e.g. 0.05)' },
        asset: { type: 'string', description: 'Asset symbol (e.g. ETH, USDC, SOL)' },
        chain: { type: 'string', description: 'Target chain: base, ethereum, sepolia, arbitrum, polygon, solana' },
        wallet_id: { type: 'string', description: 'Optional sending vault address' },
      },
      required: ['to', 'amount', 'asset'],
    },
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient address' },
        amount: { type: 'number', description: 'Amount' },
        asset: { type: 'string', description: 'Asset symbol' },
        chain: { type: 'string', description: 'Target chain' },
        wallet_id: { type: 'string', description: 'Vault address' },
      },
      required: ['to', 'amount', 'asset'],
    },
  },
  {
    name: 'northveil_prepare_swap',
    description: 'Prepares and simulates an automated DEX swap via Uniswap V3, 1inch, or Raydium aggregator. Returns policy decision, output quote, and approval card.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        from_token: { type: 'string', description: 'Source asset (e.g. ETH, SOL)' },
        to_token: { type: 'string', description: 'Target asset (e.g. USDC, DEGEN)' },
        amount: { type: 'number', description: 'Amount to swap' },
        slippage_bps: { type: 'number', description: 'Max slippage in basis points (default: 50 = 0.5%)' },
        chain: { type: 'string', description: 'Network' },
      },
      required: ['from_token', 'to_token', 'amount'],
    },
    parameters: {
      type: 'object',
      properties: {
        from_token: { type: 'string', description: 'Source asset' },
        to_token: { type: 'string', description: 'Target asset' },
        amount: { type: 'number', description: 'Amount' },
        slippage_bps: { type: 'number', description: 'Slippage bps' },
        chain: { type: 'string', description: 'Network' },
      },
      required: ['from_token', 'to_token', 'amount'],
    },
  },
  {
    name: 'northveil_prepare_bridge',
    description: 'Prepares a cross-chain asset bridge intent across EVM networks and Solana using LayerZero / Across / Stargate protocols.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        source_chain: { type: 'string', description: 'Source network (e.g. base)' },
        destination_chain: { type: 'string', description: 'Destination network (e.g. arbitrum)' },
        asset: { type: 'string', description: 'Token symbol to bridge' },
        amount: { type: 'number', description: 'Amount to bridge' },
        recipient_address: { type: 'string', description: 'Destination address' },
      },
      required: ['source_chain', 'destination_chain', 'asset', 'amount'],
    },
    parameters: {
      type: 'object',
      properties: {
        source_chain: { type: 'string', description: 'Source network' },
        destination_chain: { type: 'string', description: 'Destination network' },
        asset: { type: 'string', description: 'Asset' },
        amount: { type: 'number', description: 'Amount' },
        recipient_address: { type: 'string', description: 'Recipient' },
      },
      required: ['source_chain', 'destination_chain', 'asset', 'amount'],
    },
  },
  {
    name: 'northveil_prepare_contract_call',
    description: 'Prepares an arbitrary smart contract interaction. Simulates calldata, verifies target against allowed contract grant, and returns approval preview.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        contract_address: { type: 'string', description: '0x contract address' },
        method: { type: 'string', description: 'Function signature (e.g. mint(address,uint256))' },
        args: { type: 'array', description: 'Array of decoded arguments' },
        value: { type: 'string', description: 'Native Ether value attached to call (Wei/ETH)' },
        chain: { type: 'string', description: 'Network' },
      },
      required: ['contract_address', 'method'],
    },
    parameters: {
      type: 'object',
      properties: {
        contract_address: { type: 'string', description: 'Contract address' },
        method: { type: 'string', description: 'Method' },
        args: { type: 'array', description: 'Args' },
        value: { type: 'string', description: 'Value' },
        chain: { type: 'string', description: 'Network' },
      },
      required: ['contract_address', 'method'],
    },
  },
  {
    name: 'northveil_prepare_deploy',
    description: 'Prepares and stages a Solidity ERC-20 / ERC-721 smart contract deployment. ALWAYS pauses for explicit human passkey approval.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Token / Contract Name' },
        symbol: { type: 'string', description: 'Token Symbol' },
        total_supply: { type: 'number', description: 'Total initial supply to mint' },
        contract_type: { type: 'string', enum: ['erc20', 'erc721', 'custom'], description: 'Contract standard' },
        chain: { type: 'string', description: 'Deployment network: base, sepolia, ethereum, polygon' },
      },
      required: ['name', 'symbol', 'contract_type'],
    },
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name' },
        symbol: { type: 'string', description: 'Symbol' },
        total_supply: { type: 'number', description: 'Supply' },
        contract_type: { type: 'string', description: 'Contract standard' },
        chain: { type: 'string', description: 'Network' },
      },
      required: ['name', 'symbol', 'contract_type'],
    },
  },
  {
    name: 'northveil_request_signature',
    description: 'Stages a cryptographic signature request for an off-chain message or EIP-712 structured data object and returns an approval preview.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Plaintext message or EIP-712 JSON string to sign' },
        wallet_id: { type: 'string', description: 'Vault wallet address' },
      },
      required: ['message'],
    },
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Message to sign' },
        wallet_id: { type: 'string', description: 'Vault address' },
      },
      required: ['message'],
    },
  },
  {
    name: 'northveil_request_broadcast',
    description: 'Submits a user-approved single-use approval token to the Signer for hardware enclave signing and on-chain broadcast. Returns transaction hash upon success.',
    annotations: { readOnly: false, destructive: true, confirmationRequired: true },
    inputSchema: {
      type: 'object',
      properties: {
        approval_token: { type: 'string', description: 'Single-use approval token (req_...)' },
      },
      required: ['approval_token'],
    },
    parameters: {
      type: 'object',
      properties: {
        approval_token: { type: 'string', description: 'Approval token' },
      },
      required: ['approval_token'],
    },
  },
  {
    name: 'northveil_list_pending_approvals',
    description: 'Lists all active unexpired approval requests pending human biometric authorization.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {},
    },
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'northveil_get_approval_status',
    description: 'Checks the real-time status of a specific approval token or request ID.',
    annotations: { readOnly: true, destructive: false, confirmationRequired: false },
    inputSchema: {
      type: 'object',
      properties: {
        approval_id: { type: 'string', description: 'Approval identifier (appr_...)' },
        approval_token: { type: 'string', description: 'Approval token (req_...)' },
      },
    },
    parameters: {
      type: 'object',
      properties: {
        approval_id: { type: 'string', description: 'Approval ID' },
        approval_token: { type: 'string', description: 'Approval token' },
      },
    },
  },
];
