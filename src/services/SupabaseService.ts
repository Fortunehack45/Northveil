import { createClient } from '@supabase/supabase-js';

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

      let logsQuery = supabase
        .from('mcp_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(60);

      if (cleanAddr) {
        txQuery = txQuery.eq('wallet_address', cleanAddr);
      }

      const [txReqsRes, logsRes] = await Promise.allSettled([txQuery, logsQuery]);

      const list: any[] = [];

      if (txReqsRes.status === 'fulfilled' && txReqsRes.value.data) {
        txReqsRes.value.data.forEach((item: any) => {
          list.push({
            id: item.id || item.approval_token || `txreq-${Math.random()}`,
            tool_name: item.contract_summary ? `execute_tx: ${item.contract_summary}` : 'send_transaction',
            status:
              item.status === 'approved' || item.status === 'completed' || item.status === 'broadcasted'
                ? 'CONFIRMED'
                : item.status === 'rejected'
                ? 'REJECTED'
                : 'PENDING',
            parameters: {
              recipient: item.recipient,
              amount: `${item.amount} ${item.asset || 'ETH'}`,
              network: item.network || 'sepolia',
              estimatedFee: `$${item.estimated_fee_usd || '0.08'} USD`,
              summary: item.contract_summary || 'Multi-chain Action',
              approvalToken: item.approval_token || 'N/A',
            },
            response: {
              txHash: item.tx_hash,
              explorerUrl: item.explorer_url,
              status: item.status,
            },
            wallet_address: item.wallet_address || cleanAddr,
            agent_type: 'Autonomous MCP Agent',
            created_at: item.created_at || new Date().toISOString(),
            tx_hash: item.tx_hash || undefined,
            gas_fee_usd: parseFloat(item.estimated_fee_usd || '0.08'),
            approval_token: item.approval_token,
          });
        });
      }

      if (logsRes.status === 'fulfilled' && logsRes.value.data) {
        logsRes.value.data.forEach((item: any) => {
          const recipient =
            item.parameters?.recipientAddress ||
            item.parameters?.recipient ||
            item.parameters?.walletAddress ||
            item.parameters?.sender ||
            item.parameters?.senderAddress;

          // Check if related to active wallet or include general agent records
          if (!cleanAddr || !recipient || recipient.toLowerCase() === cleanAddr || item.wallet_address?.toLowerCase() === cleanAddr || !item.parameters?.walletAddress) {
            if (!list.some((existing) => existing.id === item.id)) {
              list.push({
                id: item.id || `log-${Math.random()}`,
                tool_name: item.tool_name || 'mcp_action',
                status:
                  item.status === 'CONFIRMED' || item.status === 'SUCCESS' || item.status === 'approved' || item.status === 'broadcasted'
                    ? 'CONFIRMED'
                    : item.status === 'PENDING'
                    ? 'PENDING'
                    : 'REJECTED',
                parameters: item.parameters || {},
                response: item.response || {},
                wallet_address: recipient || cleanAddr,
                agent_type: item.api_key?.includes('claude') ? 'Claude Desktop' : 'AI Agent',
                created_at: item.created_at || new Date().toISOString(),
                tx_hash: item.response?.txHash || item.response?.hash || (typeof item.response === 'string' && item.response.startsWith('0x') ? item.response : undefined),
                gas_fee_usd: 0.08,
              });
            }
          }
        });
      }

      // Sort newest first
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return list;
    } catch (e) {
      console.warn('[Supabase fetchApprovalsForWallet Error]:', e);
      return [];
    }
  }

  /**
   * Create a live pending transaction request in Supabase for testing approval workflows
   */
  static async createPendingApprovalRequest(walletAddress: string, actionType: string = 'token_transfer', recipientAddress?: string) {
    try {
      const cleanAddr = walletAddress.toLowerCase();
      const targetRecipient = (recipientAddress || cleanAddr).toLowerCase();
      const approvalToken = `tok_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      const requestId = `req_${Math.random().toString(36).substring(2, 10)}`;

      const { data, error } = await supabase
        .from('transaction_requests')
        .insert([
          {
            request_id: requestId,
            wallet_address: cleanAddr,
            user_id: 'default_user',
            recipient: targetRecipient,
            amount: '0.005',
            asset: 'ETH',
            network: 'sepolia',
            chain_id: '11155111',
            estimated_fee_usd: '0.08',
            contract_summary: actionType === 'token_transfer' ? 'Transfer of 0.005 Sepolia ETH via MCP Agent' : 'Contract Deployment via Claude Agent',
            total_amount: '0.005024',
            nonce: '0',
            unsigned_payload: { to: targetRecipient, value: '5000000000000000' },
            status: 'pending',
            approval_token: approvalToken,
            token_used: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) console.warn('[Supabase createPendingApprovalRequest Error]:', error);
      return { data, approvalToken, requestId };
    } catch (e) {
      console.warn('[Supabase createPendingApprovalRequest Exception]:', e);
    }
  }

  /**
   * Update approval status in Supabase transaction_requests
   */
  static async updateApprovalStatus(idOrToken: string, status: 'approved' | 'rejected', txHash?: string) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (txHash) updateData.tx_hash = txHash;

      // Update by id or approval_token
      const { data, error } = await supabase
        .from('transaction_requests')
        .update(updateData)
        .or(`id.eq.${idOrToken},approval_token.eq.${idOrToken}`);

      if (error) console.warn('[Supabase updateApprovalStatus Error]:', error);
      return data;
    } catch (e) {
      console.warn('[Supabase updateApprovalStatus Exception]:', e);
    }
  }
}
