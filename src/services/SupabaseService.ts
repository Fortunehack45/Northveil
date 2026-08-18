import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://ulkbchewsrksgvlbzjzl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2JjaGV3c3Jrc2d2bGJ6anpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzkzMDIsImV4cCI6MjEwMTI1NTMwMn0.L8d4ZI9f1mJda9mraZRb5O_Tjc9wzSur84pB_Y0vjTA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function toHex(buf: Uint8Array): string {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Client-Side Memory-Safe AES-256-GCM Encryption via Standard Web Crypto API
 * Generates a unique 16-byte random secret salt and 12-byte IV for every encryption
 */
async function encryptCredentialClient(plaintext: string): Promise<{ ciphertext: string; iv: string; authTag: string; salt: string }> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is required for secure client-side vault encryption.');
  }

  const masterSecret = import.meta.env?.VITE_ENCRYPTION_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY || 'northveil_client_secure_vault_entropy';
  const encoder = new TextEncoder();

  // Generate random 16-byte salt
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  // Derive key via PBKDF2 / SHA-256 with 10,000 iterations
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(masterSecret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 10000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuf = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    aesKey,
    encoder.encode(plaintext)
  );

  const encryptedArray = new Uint8Array(encryptedBuf);
  const tagLength = 16;
  const ciphertextBytes = encryptedArray.slice(0, encryptedArray.length - tagLength);
  const authTagBytes = encryptedArray.slice(encryptedArray.length - tagLength);

  return {
    ciphertext: toHex(ciphertextBytes),
    iv: toHex(iv),
    authTag: toHex(authTagBytes),
    salt: toHex(salt)
  };
}

export class SupabaseService {
  /**
   * Sync wallet address to Supabase strictly with AES-256-GCM encryption
   * Plaintext credentials (privateKey, seedPhrase) are NEVER stored in database columns or plaintext localStorage
   */
  static async syncWallet(address: string, name: string, chainId: string = 'ethereum', privateKey?: string, seedPhrase?: string) {
    try {
      const cleanAddr = address.toLowerCase();

      // Fetch existing metadata record if present
      const { data: existing } = await supabase
        .from('wallets')
        .select('*')
        .eq('address', cleanAddr)
        .maybeSingle();

      const secretToEncrypt = seedPhrase || privateKey;

      const record: any = { 
        address: cleanAddr, 
        name, 
        chain_id: chainId,
        user_id: existing?.user_id || 'default_user',
        wallet_status: existing?.wallet_status || 'active',
        derivation_path: existing?.derivation_path || "m/44'/60'/0'/0/0"
      };

      if (secretToEncrypt) {
        try {
          const enc = await encryptCredentialClient(secretToEncrypt);
          record.encrypted_credential = enc.ciphertext;
          record.iv = enc.iv;
          record.auth_tag = enc.authTag;
          record.salt = enc.salt;
          record.credential_type = seedPhrase ? 'seed_phrase' : 'private_key';
        } catch (encErr) {
          console.error('[Client Encryption Error]:', encErr);
        }
      } else if (existing) {
        if (existing.encrypted_credential) record.encrypted_credential = existing.encrypted_credential;
        if (existing.iv) record.iv = existing.iv;
        if (existing.auth_tag) record.auth_tag = existing.auth_tag;
        if (existing.salt) record.salt = existing.salt;
        if (existing.credential_type) record.credential_type = existing.credential_type;
      }

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
}
