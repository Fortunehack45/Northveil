import { createClient } from '@supabase/supabase-js';
import { getMcpServerUrl } from '../config/endpointConfig';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ulkbchewsrksgvlbzjzl.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseService {
  /**
   * Sync non-sensitive wallet metadata (address, name, chainId, derivationPath) to Supabase.
   * Private keys, seed phrases, and credentials are NEVER transmitted or stored server-side.
   */
  static async syncWallet(address: string, name: string, chainId: string = 'ethereum') {
    try {
      const cleanAddr = address.toLowerCase();

      // Fetch existing metadata record if present
      const { data: existing } = await supabase
        .from('wallets')
        .select('user_id, wallet_status, derivation_path')
        .eq('address', cleanAddr)
        .maybeSingle();

      const record = { 
        address: cleanAddr, 
        name, 
        chain_id: chainId,
        user_id: existing?.user_id || 'default_user',
        wallet_status: existing?.wallet_status || 'active',
        derivation_path: existing?.derivation_path || "m/44'/60'/0'/0/0"
      };

      const { data, error } = await supabase
        .from('wallets')
        .upsert([record], { onConflict: 'address' });
      if (error) console.error('Supabase wallet sync error:', error);
      return data;
    } catch (e) {
      console.error('Supabase wallet sync failed:', e);
    }
  }

  /**
   * Save transaction to Supabase
   */
  static async recordTransaction(tx: {
    wallet_address: string;
    tx_hash?: string;
    type: string;
    token_symbol: string;
    amount: number;
    recipient?: string;
    status: string;
    chain_id: string;
    gas_fee_usd?: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...tx,
          wallet_address: tx.wallet_address.toLowerCase(),
          recipient: tx.recipient?.toLowerCase() || null,
        }]);
      if (error) console.error('Supabase transaction log error:', error);
      return data;
    } catch (e) {
      console.error('Supabase transaction log failed:', e);
    }
  }

  /**
   * Save deployed smart contract to Supabase contracts table
   */
  static async saveSmartContract(contract: {
    wallet_address: string;
    contract_name: string;
    symbol: string;
    contract_type: string;
    total_supply: number;
    owner_allocation?: number;
    description?: string;
    image_url?: string;
    website_url?: string;
    twitter_url?: string;
    telegram_url?: string;
    discord_url?: string;
    network: string;
    predicted_address?: string;
    tx_hash?: string;
    solidity_code?: string;
    abi?: string | any[];
    bytecode?: string;
    metadata?: any;
  }) {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert([{
          ...contract,
          wallet_address: contract.wallet_address.toLowerCase(),
          abi: typeof contract.abi === 'string' ? contract.abi : JSON.stringify(contract.abi || []),
        }]);
      if (error) console.error('Supabase smart contract log error:', error);
      return data;
    } catch (e) {
      console.error('Supabase smart contract log failed:', e);
    }
  }

  /**
   * Bind API key to a specific wallet address in mcp_api_keys table
   */
  static async bindApiKeyToWallet(apiKey: string, walletAddress: string, keyName: string = 'Developer API Key') {
    try {
      const { data, error } = await supabase
        .from('mcp_api_keys')
        .upsert([{
          api_key: apiKey.trim(),
          wallet_address: walletAddress.toLowerCase(),
          key_name: keyName,
          permissions: ['*'],
          is_active: true,
          tier: 'developer',
        }], { onConflict: 'api_key' });
      if (error) console.warn('[ApiKey Binding Notice]:', error.message);
      return data;
    } catch (e) {
      console.warn('[ApiKey Binding Exception]:', e);
    }
  }

  /**
   * Fetch connected AI Agents from Supabase mcp_api_keys and mcp_activity_logs
   */
  static async fetchAgentsForWallet(walletAddress: string): Promise<any[]> {
    if (!walletAddress) return [];
    try {
      const cleanAddr = walletAddress.toLowerCase();
      const { data: keys, error } = await supabase
        .from('mcp_api_keys')
        .select('*')
        .eq('wallet_address', cleanAddr)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error || !keys) {
        return [];
      }

      // Query activity count for each key
      const results = await Promise.all(
        keys.map(async (k: any) => {
          const { count, data: latestLog } = await supabase
            .from('mcp_activity_logs')
            .select('created_at', { count: 'exact' })
            .eq('api_key', k.api_key)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            id: k.id || `key-${k.api_key.slice(-8)}`,
            name: k.key_name || 'AI Agent',
            apiKey: k.api_key,
            walletAddress: k.wallet_address,
            permissions: Array.isArray(k.permissions) ? k.permissions : ['*'],
            duration: 'never',
            createdAt: k.created_at || new Date().toISOString(),
            expiresAt: k.expires_at || null,
            status: k.is_active ? 'active' : 'revoked',
            recentActionsCount: count || 0,
            lastActiveAt: latestLog?.[0]?.created_at || k.created_at || new Date().toISOString(),
          };
        })
      );

      return results;
    } catch (e) {
      console.warn('[Supabase fetchAgentsForWallet Error]:', e);
      return [];
    }
  }

  /**
   * Save newly authorized AI Agent connection to Supabase mcp_api_keys
   */
  static async saveAgentConnection(agent: {
    name: string;
    wallet_address: string;
    api_key: string;
    permissions?: string[];
    duration?: string;
    expires_at?: string | null;
  }) {
    try {
      const { data, error } = await supabase
        .from('mcp_api_keys')
        .upsert([{
          key_name: agent.name,
          wallet_address: agent.wallet_address.toLowerCase(),
          api_key: agent.api_key,
          permissions: agent.permissions || ['read_balance', 'quote_swap', 'prepare_transaction'],
          is_active: true,
          tier: 'autonomous_agent',
          expires_at: agent.expires_at || null,
        }], { onConflict: 'api_key' });

      if (error) console.warn('[Supabase saveAgentConnection Error]:', error);
      return data;
    } catch (e) {
      console.warn('[Supabase saveAgentConnection Exception]:', e);
    }
  }

  /**
   * Revoke AI Agent connection in Supabase
   */
  static async revokeAgentConnection(apiKey: string) {
    try {
      const { data, error } = await supabase
        .from('mcp_api_keys')
        .update({ is_active: false })
        .eq('api_key', apiKey);

      if (error) console.warn('[Supabase revokeAgentConnection Error]:', error);
      return data;
    } catch (e) {
      console.warn('[Supabase revokeAgentConnection Exception]:', e);
    }
  }

  /**
   * Fetch Approvals & Transaction Requests dynamically from Supabase
   */
  static async fetchApprovalsForWallet(walletAddress?: string): Promise<any[]> {
    const cleanAddr = walletAddress ? walletAddress.toLowerCase() : '';

    try {
      let txQuery = supabase
        .from('transaction_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (cleanAddr) {
        txQuery = txQuery.eq('wallet_address', cleanAddr);
      }

      const { data, error } = await txQuery;
      if (error || !data) return [];

      const now = Date.now();
      const list: any[] = data.map((item: any) => {
        const id = item.approval_token || item.request_id || item.id;
        
        let calculatedStatus: 'CONFIRMED' | 'REJECTED' | 'EXPIRED' | 'PENDING' = 'PENDING';
        if (item.tx_hash || item.status === 'confirmed' || item.status === 'approved' || item.status === 'completed' || item.status === 'broadcasted') {
          calculatedStatus = 'CONFIRMED';
        } else if (item.status === 'rejected') {
          calculatedStatus = 'REJECTED';
        } else if (
          item.token_used ||
          (item.expires_at && new Date(item.expires_at).getTime() <= now) ||
          (item.created_at && now - new Date(item.created_at).getTime() > 2 * 3600 * 1000)
        ) {
          calculatedStatus = 'EXPIRED';
        } else {
          calculatedStatus = 'PENDING';
        }

        const isContractDeploy = Boolean(
          item.is_deploy ||
          item.operation === 'DEPLOY' ||
          item.operation === 'DEPLOY_CONTRACT' ||
          item.asset === 'DEPLOY' ||
          (item.reason && item.reason.toLowerCase().includes('deploy')) ||
          (item.contract_summary && item.contract_summary.toLowerCase().includes('deploy')) ||
          ((!item.recipient || item.recipient === '0x0000000000000000000000000000000000000000' || item.recipient === '') && item.unsigned_payload?.data && item.unsigned_payload.data !== '0x')
        );

        let toolName = 'token_transfer';
        let parameters: any = {};

        if (isContractDeploy) {
          const deployLabel = item.contract_summary || item.reason || 'Smart Contract';
          toolName = deployLabel.startsWith('Deploy') ? deployLabel : `Deploy Smart Contract: ${deployLabel}`;
          parameters = {
            contract: deployLabel,
            type: 'Smart Contract Deployment',
            network: item.network || 'sepolia',
            isDeploy: true,
            calldata: item.unsigned_payload?.data || '0x',
            calldataSize: item.unsigned_payload?.data && item.unsigned_payload.data !== '0x'
              ? `${Math.floor((item.unsigned_payload.data.length - 2) / 2)} bytes`
              : 'Compiled Bytecode',
            summary: deployLabel,
            approvalToken: item.approval_token || id,
          };
        } else {
          toolName = item.contract_summary
            ? `execute_tx: ${item.contract_summary}`
            : item.operation
            ? `northveil_prepare_${item.operation.toLowerCase()}`
            : 'token_transfer';
          parameters = {
            recipient: item.recipient,
            amount: `${item.amount} ${item.asset || 'ETH'}`,
            network: item.network || 'sepolia',
            estimatedFee: `$${item.estimated_fee_usd || '0.05'} USD`,
            summary: item.contract_summary || item.reason || 'Multi-chain Action',
            approvalToken: item.approval_token || id,
          };
        }

        return {
          id,
          request_id: item.request_id || id,
          approval_token: item.approval_token || id,
          tool_name: toolName,
          status: calculatedStatus,
          parameters,
          response: {
            txHash: item.tx_hash,
            explorerUrl: item.explorer_url,
            status: item.status,
          },
          wallet_address: item.wallet_address || cleanAddr,
          agent_type: 'Autonomous MCP Agent',
          created_at: item.created_at || new Date().toISOString(),
          tx_hash: item.tx_hash || undefined,
          gas_fee_usd: parseFloat(item.estimated_fee_usd || '0.05'),
        };
      });

      return list;
    } catch (e) {
      console.warn('[Supabase fetchApprovalsForWallet Error]:', e);
      return [];
    }
  }

  /**
   * Create a live pending transaction request for testing approval workflows
   */
  static async createPendingApprovalRequest(walletAddress: string, actionType: string = 'token_transfer', recipientAddress?: string) {
    try {
      const cleanAddr = walletAddress.toLowerCase();
      const targetRecipient = (recipientAddress || '0x59148d6a9dff263a772b5a84280bc88530f38636').toLowerCase();
      
      const baseUrl = getMcpServerUrl();
      const res = await fetch(`${baseUrl}/api/v1/transactions/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: cleanAddr,
          recipient: targetRecipient,
          amount: 0.00005,
          asset: 'ETH',
          network: 'sepolia',
          operationType: 'TRANSFER',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to stage real live transaction request');
      }

      return await res.json();
    } catch (e) {
      console.error('Failed to create live pending request:', e);
      throw e;
    }
  }

  /**
   * Update approval status in Supabase transaction_requests
   */
  static async updateApprovalStatus(idOrToken: string, status: 'approved' | 'rejected', txHash?: string) {
    try {
      const normalizedStatus = status === 'approved' ? 'confirmed' : status;
      const updateData: any = {
        status: normalizedStatus,
        updated_at: new Date().toISOString(),
      };
      if (txHash) {
        updateData.tx_hash = txHash;
        updateData.explorer_url = `https://sepolia.etherscan.io/tx/${txHash}`;
        updateData.token_used = true;
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrToken);
      let query = supabase.from('transaction_requests').update(updateData);
      
      if (isUuid) {
        query = query.or(`id.eq.${idOrToken},approval_token.eq.${idOrToken},request_id.eq.${idOrToken}`);
      } else {
        query = query.or(`approval_token.eq.${idOrToken},request_id.eq.${idOrToken}`);
      }

      const { data, error } = await query;
      if (error) console.warn('[Supabase updateApprovalStatus Error]:', error);
      return data;
    } catch (e) {
      console.warn('[Supabase updateApprovalStatus Exception]:', e);
    }
  }
}
