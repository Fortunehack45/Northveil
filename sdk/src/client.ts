import {
  NorthveilConfig,
  PortfolioResult,
  PrepareTransferParams,
  PrepareTransferResult,
  TransactionStatusResult,
  WalletInfoResult,
  PendingApprovalItem,
} from './types.js';

/**
 * NorthveilClient
 * Thin, non-custodial TypeScript client for communicating with Northveil MCP servers.
 * Never stores or transmits private keys, seeds, or MPC key shares.
 */
export class NorthveilClient {
  private apiUrl: string;
  private clientKey: string;
  private walletAddress?: string;

  constructor(config: NorthveilConfig = {}) {
    this.apiUrl = (config.baseUrl || config.apiUrl || process.env.NORTHVEIL_API_URL || 'https://mcp.northveil.xyz').replace(/\/$/, '');
    this.clientKey = config.clientKey || process.env.NORTHVEIL_API_KEY || '';
    this.walletAddress = config.walletAddress;

    if (!this.clientKey) {
      throw new Error('MISSING_CLIENT_KEY: Pass clientKey or set NORTHVEIL_API_KEY');
    }
  }

  /**
   * Dispatches a JSON-RPC 2.0 tool call to the Northveil MCP endpoint
   */
  public async callTool<T = any>(name: string, args: Record<string, any> = {}): Promise<T> {
    if (!this.clientKey) {
      throw new Error('MISSING_CLIENT_KEY: Northveil client key (nv_live_...) must be configured.');
    }

    const payloadArgs = { ...args };
    if (this.walletAddress && !payloadArgs.walletAddress) {
      payloadArgs.walletAddress = this.walletAddress;
    }

    const res = await fetch(`${this.apiUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.clientKey,
        'Authorization': `Bearer ${this.clientKey}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name,
          arguments: payloadArgs,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`MCP Request failed with status ${res.status}: ${errText}`);
    }

    const json = (await res.json()) as any;
    if (json.error) {
      throw new Error(`MCP Tool Error (${json.error.code}): ${json.error.message}`);
    }

    const contentText = json.result?.content?.[0]?.text;
    if (!contentText) return json.result as T;

    try {
      return JSON.parse(contentText) as T;
    } catch {
      return contentText as unknown as T;
    }
  }

  /**
   * Retrieves real-time portfolio balance and valuation across supported chains
   */
  public async getPortfolio(walletAddress?: string): Promise<PortfolioResult> {
    return this.callTool<PortfolioResult>('get_portfolio', walletAddress ? { walletAddress } : {});
  }

  /**
   * Stages an on-chain transfer.
   * - Under Always Ask: Returns APPROVAL_REQUIRED with approvalId, payloadHash, and approveUrl for human passkey confirmation.
   * - Under Autonomous: Evaluates grant limits and executes threshold MPC signing immediately if within bounds.
   */
  public async prepareTransfer(params: PrepareTransferParams): Promise<PrepareTransferResult> {
    return this.callTool<PrepareTransferResult>('prepare_transfer', params);
  }

  /**
   * Checks the confirmation receipt of an on-chain transaction hash
   */
  public async getTransactionStatus(txHash: string, chain?: string): Promise<TransactionStatusResult> {
    return this.callTool<TransactionStatusResult>('get_transaction_status', { txHash, chain });
  }

  /**
   * Queries metadata, active grant policies, and spending limits for the client's wallet
   */
  public async getWalletInfo(): Promise<WalletInfoResult> {
    return this.callTool<WalletInfoResult>('nv_list_wallets', {});
  }

  /**
   * Alias for getWalletInfo
   */
  public async listWallets(): Promise<WalletInfoResult> {
    return this.callTool<WalletInfoResult>('nv_list_wallets', {});
  }

  /**
   * Query balances across one chain or all supported chains
   */
  public async getBalances(networkOrAddress?: string): Promise<any> {
    return this.callTool('nv_get_balances', { network: networkOrAddress || 'all' });
  }

  /**
   * Check execution status of an approval ticket by ID
   */
  public async getApprovalStatus(approvalId: string): Promise<any> {
    return this.callTool('nv_get_approval_status', { approvalId });
  }

  /**
   * Lists active pending approvals awaiting human passkey authorization
   */
  public async listPendingApprovals(): Promise<{ pendingApprovals: PendingApprovalItem[] }> {
    return this.callTool<{ pendingApprovals: PendingApprovalItem[] }>('nv_list_pending_approvals', {});
  }
}
