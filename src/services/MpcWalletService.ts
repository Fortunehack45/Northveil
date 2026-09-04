/**
 * Northveil MPC & Passkey Client Service
 * Coordinates Non-Custodial Northveil Hardware TEE Enclave Vault creation,
 * WebAuthn hardware biometric authentication, and signed session tokens.
 */

import { getMcpServerUrl } from '../config/endpointConfig';
import { ethers } from 'ethers';
import { sanitizeToValidAddress } from './addressUtils';

export interface MpcVaultCreationResult {
  success: boolean;
  address: string;
  mpcWalletId: string;
  mpcProvider: string;
  userId: string;
  error?: string;
}

export interface PasskeyVerificationResult {
  success: boolean;
  verified: boolean;
  credentialId?: string;
  deviceName?: string;
  sessionToken?: string;
  walletAddress?: string;
  userId?: string;
  error?: string;
}

export class MpcWalletService {
  private static SESSION_KEY = 'northveil_v3_session_token';
  private static USER_KEY = 'northveil_v3_user_id';
  private static VAULT_TYPE_KEY = 'northveil_v3_vault_type';

  public static getBaseUrl(): string {
    return getMcpServerUrl();
  }

  private static async safeJson<T = any>(res: Response): Promise<T> {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${text.slice(0, 100) || res.statusText}`);
      }
      throw new Error('Received unexpected non-JSON response from server.');
    }
  }

  public static getSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.SESSION_KEY);
  }

  public static saveSession(sessionToken: string, userId?: string, vaultType: 'mpc' | 'imported' = 'mpc') {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.SESSION_KEY, sessionToken);
    if (userId) localStorage.setItem(this.USER_KEY, userId);
    localStorage.setItem(this.VAULT_TYPE_KEY, vaultType);
  }

  public static clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.VAULT_TYPE_KEY);
  }

  public static getVaultType(): 'mpc' | 'imported' {
    if (typeof window === 'undefined') return 'mpc';
    return (localStorage.getItem(this.VAULT_TYPE_KEY) as any) || 'mpc';
  }

  public static getUserId(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(this.USER_KEY) || '';
  }

  /**
   * Provision an MPC Vault via Northveil MCP Gateway
   */
  public static async createMpcVault(walletName: string = 'Primary Vault', userId?: string): Promise<MpcVaultCreationResult> {
    const effectiveUserId = userId || this.getUserId();
    const token = this.getSessionToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.getBaseUrl()}/wallet/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: effectiveUserId,
        name: walletName,
      }),
    });

    const json = await this.safeJson(res);
    if (!res.ok || (!json.wallet && !json.address)) {
      throw new Error(json.error || 'Failed to create MPC Vault');
    }

    const wallet = json.wallet || json;
    const addr = wallet.address || json.address;
    return {
      success: true,
      address: addr,
      mpcWalletId: wallet.mpc_wallet_id || wallet.mpcWalletId || json.mpcWalletId || '',
      mpcProvider: wallet.mpc_provider || 'turnkey',
      userId: wallet.user_id || effectiveUserId,
    };
  }

  /**
   * Request an enclave import bundle from Turnkey via MCP
   */
  public static async importBegin(token?: string): Promise<{
    importBundle: string;
    organizationId: string;
    turnkeyUserId: string;
  }> {
    const sessionToken = token || this.getSessionToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
      headers['X-Session-Token'] = sessionToken;
    }

    const res = await fetch(`${this.getBaseUrl()}/wallet/import/begin`, {
      method: 'POST',
      headers,
    });

    const json = await this.safeJson(res);
    if (!res.ok || !json.importBundle) {
      throw new Error(json.error || json.message || 'Failed to initialize enclave wallet import');
    }

    return {
      importBundle: json.importBundle,
      organizationId: json.organizationId,
      turnkeyUserId: json.turnkeyUserId || json.userId,
    };
  }

  /**
   * Submit client-encrypted bundle to Turnkey via MCP (Server never sees raw mnemonic or privateKey)
   */
  public static async importFinish(
    name: string,
    encryptedBundle: string,
    token?: string
  ): Promise<MpcVaultCreationResult> {
    const sessionToken = token || this.getSessionToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
      headers['X-Session-Token'] = sessionToken;
    }

    const res = await fetch(`${this.getBaseUrl()}/wallet/import/finish`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, encryptedBundle }),
    });

    const json = await this.safeJson(res);
    if (!res.ok || (!json.address && !json.wallet?.address)) {
      throw new Error(json.error || json.message || 'Failed to complete enclave wallet import');
    }

    const addr = json.address || json.wallet?.address;
    const mpcWalletId = json.mpcWalletId || json.wallet?.mpc_wallet_id || '';
    const userId = json.wallet?.user_id || this.getUserId();

    return {
      success: true,
      address: addr,
      mpcWalletId,
      mpcProvider: 'turnkey',
      userId,
    };
  }

  /**
   * Import wallet non-custodially into Northveil Turnkey MPC Enclave.
   * Material is encrypted in the browser directly to Turnkey's TEK public key.
   * Neither plaintext mnemonic nor hex private key ever touches server memory.
   */
  public static async importMpcVault(
    importType: 'privateKey' | 'seed',
    secret: string,
    walletName: string = 'Imported Vault',
    _userId?: string
  ): Promise<MpcVaultCreationResult> {
    const token = this.getSessionToken();
    let cleanSecret = secret.trim();

    try {
      const begin = await this.importBegin(token || undefined);
      const { encryptWalletToBundle, encryptPrivateKeyToBundle } = await import('@turnkey/crypto');

      let encryptedBundle: string;
      if (importType === 'seed') {
        encryptedBundle = await encryptWalletToBundle({
          mnemonic: cleanSecret,
          importBundle: begin.importBundle,
          userId: begin.turnkeyUserId,
          organizationId: begin.organizationId,
        });
      } else {
        const hexKey = cleanSecret.startsWith('0x') ? cleanSecret : `0x${cleanSecret}`;
        encryptedBundle = await encryptPrivateKeyToBundle({
          privateKey: hexKey,
          keyFormat: 'HEXADECIMAL',
          importBundle: begin.importBundle,
          userId: begin.turnkeyUserId,
          organizationId: begin.organizationId,
        });
      }

      return await this.importFinish(walletName, encryptedBundle, token || undefined);
    } finally {
      // Immediate memory wipe
      cleanSecret = '';
    }
  }

  /**
   * Fetch authenticated user, active wallet, passkeys, and next onboarding step
   */
  public static async fetchWalletMe(token?: string) {
    const sessionToken = token || this.getSessionToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
      headers['X-Session-Token'] = sessionToken;
    }

    const res = await fetch(`${this.getBaseUrl()}/wallet/me`, {
      method: 'GET',
      headers,
    });

    const json = await this.safeJson(res);
    if (!res.ok) {
      throw new Error(json.error || json.message || 'Failed to fetch user wallet metadata');
    }

    return json;
  }

  /**
   * Prepare an unsigned transaction request for local client signing
   */
  public static async prepareTransaction(params: {
    walletAddress: string;
    recipient: string;
    amount: number;
    asset?: string;
    network?: string;
    calldata?: string;
    operationType?: 'TRANSFER' | 'SWAP' | 'DEPLOY' | 'CONTRACT_CALL';
  }) {
    const res = await fetch(`${this.getBaseUrl()}/api/v1/transactions/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        userId: this.getUserId(),
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to prepare transaction');
    }
    return json;
  }

  /**
   * Broadcast a client-signed transaction on-chain
   */
  public static async broadcastTransaction(params: {
    approvalToken?: string;
    requestId?: string;
    signedTransaction: string;
    passkeyAssertion?: any;
    userId?: string;
  }): Promise<{
    success: boolean;
    txHash?: string;
    tx_hash?: string;
    transactionHash?: string;
    explorerUrl?: string;
    explorer_url?: string;
    blockNumber?: number;
    status?: string;
    error?: string;
  }> {
    const effectiveUserId = params.userId || this.getUserId();
    const token = this.getSessionToken();
    const targetToken = params.approvalToken || params.requestId || '';
    const res = await fetch(`${this.getBaseUrl()}/api/v1/transactions/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...params,
        approvalToken: targetToken,
        userId: effectiveUserId,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to broadcast signed transaction');
    }
    return json;
  }

  /**
   * Request WebAuthn Registration Challenge & Options
   */
  public static async getPasskeyRegistrationOptions(
    userId: string,
    userName?: string,
    displayName?: string,
    walletAddress?: string
  ) {
    const token = this.getSessionToken();
    const res = await fetch(`${this.getBaseUrl()}/auth/passkey/register/begin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId,
        userName: userName || `user_${userId.slice(0, 8)}@northveil.xyz`,
        displayName: displayName || 'Northveil Vault User',
        walletAddress: (walletAddress || '').toLowerCase(),
      }),
    });

    const json = await res.json();
    const opts = json.options || (json.challenge ? json : null);
    if (!res.ok || !opts) {
      throw new Error(json.error || json.message || 'Failed to generate WebAuthn registration options');
    }
    return opts;
  }

  /**
   * Verify Biometric Passkey Registration and bind to MPC Vault
   */
  public static async verifyPasskeyRegistration(
    userId: string,
    walletAddress: string,
    registrationResponse: any
  ): Promise<PasskeyVerificationResult> {
    const token = this.getSessionToken();
    const res = await fetch(`${this.getBaseUrl()}/auth/passkey/register/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId,
        walletAddress: (walletAddress || '').toLowerCase(),
        response: registrationResponse,
      }),
    });

    const json = await res.json();
    if (!res.ok || (!json.verified && !json.success)) {
      throw new Error(json.error || json.message || 'Biometric passkey registration verification failed');
    }

    if (json.sessionToken) {
      this.saveSession(json.sessionToken, userId, 'mpc');
    }

    return json;
  }

  /**
   * Request WebAuthn Authentication Challenge & Options
   */
  public static async getPasskeyAuthOptions(userId?: string, walletAddress?: string) {
    const res = await fetch(`${this.getBaseUrl()}/auth/passkey/login/begin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        walletAddress: (walletAddress || '').toLowerCase(),
      }),
    });

    const json = await res.json();
    const opts = json.options || (json.challenge ? json : null);
    if (!res.ok || !opts) {
      throw new Error(json.error || json.message || 'Failed to generate WebAuthn authentication options');
    }
    return opts;
  }

  /**
   * Verify Biometric Passkey Assertion & renew session
   */
  public static async verifyPasskeyAuthentication(
    userId: string,
    walletAddress: string,
    authenticationResponse: any
  ): Promise<PasskeyVerificationResult> {
    const res = await fetch(`${this.getBaseUrl()}/auth/passkey/login/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        walletAddress: (walletAddress || '').toLowerCase(),
        credentialId: authenticationResponse.id,
        response: authenticationResponse,
      }),
    });

    const json = await res.json();
    if (!res.ok || (!json.verified && !json.success)) {
      throw new Error(json.error || json.message || 'Biometric passkey authentication failed');
    }

    if (json.sessionToken) {
      this.saveSession(json.sessionToken, json.user?.id || userId, 'mpc');
    }

    return json;
  }

  /**
   * Validate current session status with backend
   */
  public static async checkSession(): Promise<{ authenticated: boolean; user?: any; wallet?: any; wallets?: any[]; passkeys?: any[]; agents?: any[] }> {
    const token = this.getSessionToken();
    if (!token) return { authenticated: false };

    try {
      const res = await fetch(`${this.getBaseUrl()}/wallet/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        return {
          authenticated: true,
          user: json.user,
          wallet: json.wallet,
          wallets: json.wallets,
          passkeys: json.passkeys,
          agents: json.agents,
        };
      }
      return { authenticated: false };
    } catch {
      return { authenticated: false };
    }
  }

  /**
   * Fetch pending approval requests for human review with multi-endpoint fallback
   */
  public static async getPendingApprovals(walletAddressOrUserId?: string): Promise<any[]> {
    const token = this.getSessionToken();
    const cleanParam = (walletAddressOrUserId || '').trim();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cleanParam.startsWith('0x') ? { 'x-wallet-address': cleanParam } : {}),
    };

    const queryStr = cleanParam.startsWith('0x') ? `walletAddress=${cleanParam}` : `userId=${cleanParam || this.getUserId()}`;

    const candidateUrls = [
      `${this.getBaseUrl()}/wallet/approvals/pending?${queryStr}`,
      `${this.getBaseUrl()}/wallet/approvals/pending`,
      `${this.getBaseUrl()}/wallet/approvals?status=pending`,
      `${this.getBaseUrl()}/api/v1/dashboard/approvals/pending?${queryStr}`,
      `${this.getBaseUrl()}/api/v1/dashboard/approvals/pending`,
      `${this.getBaseUrl()}/api/v1/approvals/pending?${queryStr}`,
      `${this.getBaseUrl()}/api/v1/approvals/pending`,
      `/wallet/approvals/pending?${queryStr}`,
      `/wallet/approvals/pending`,
      `/api/v1/dashboard/approvals/pending?${queryStr}`,
      `/api/v1/dashboard/approvals/pending`,
      `/api/v1/approvals/pending?${queryStr}`,
      `/api/v1/approvals/pending`,
    ];

    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      candidateUrls.push(`http://127.0.0.1:3001/api/v1/dashboard/approvals/pending?${queryStr}`);
      candidateUrls.push(`http://127.0.0.1:3001/api/v1/dashboard/approvals/pending`);
    }

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const json = await res.json();
          const list = json.pendingApprovals || json.data || json.approvals || [];
          if (Array.isArray(list) && list.length > 0) {
            return list;
          }
          if (json.success) {
            return list;
          }
        }
      } catch {}
    }

    return [];
  }

  /**
   * Approve a staged transaction request with WebAuthn Passkey biometric assertion
   */
  public static async approveTransactionRequestWithPasskey(
    requestIdOrToken: string,
    passkeyAssertion?: any,
    userId?: string,
    signedTransaction?: string,
    txHash?: string
  ): Promise<{
    success: boolean;
    txHash?: string;
    tx_hash?: string;
    explorerUrl?: string;
    explorer_url?: string;
    status?: string;
    recipient?: string;
    amount?: number;
    asset?: string;
    network?: string;
    calldata?: string;
    chainId?: number;
    contractAddress?: string;
    error?: string;
  }> {
    const effectiveUserId = userId || this.getUserId();
    const token = this.getSessionToken();
    const endpoint = `/api/v1/dashboard/approvals/${encodeURIComponent(requestIdOrToken)}/approve`;
    const payload = JSON.stringify({
      userId: effectiveUserId,
      passkeyAssertion,
      signedTransaction,
      txHash,
    });
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let res: Response;
    try {
      res = await fetch(`${this.getBaseUrl()}${endpoint}`, {
        method: 'POST',
        headers,
        body: payload,
      });
    } catch (fetchErr) {
      // Fallback to relative URL if cross-origin fetch had a network or CORS issue
      if (typeof window !== 'undefined') {
        try {
          res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: payload,
          });
        } catch {
          throw fetchErr;
        }
      } else {
        throw fetchErr;
      }
    }

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to approve transaction request');
    }
    const inner = json.result || json;
    return {
      success: true,
      ...inner,
    };
  }

  /**
   * Reject and void a staged transaction request, immediately killing the single-use token
   */
  public static async rejectTransactionRequest(
    requestIdOrToken: string,
    reason?: string,
    userId?: string
  ): Promise<{ success: boolean; status: string; error?: string }> {
    const effectiveUserId = userId || this.getUserId();
    const token = this.getSessionToken();
    const res = await fetch(`${this.getBaseUrl()}/api/v1/dashboard/approvals/${encodeURIComponent(requestIdOrToken)}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: effectiveUserId,
        reason: reason || 'Rejected by user',
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to reject transaction request');
    }
    return json;
  }

  /**
   * Fetch authorized agent clients and active grants
   */
  public static async getAgentClients(userId?: string): Promise<any[]> {
    const effectiveUserId = userId || this.getUserId();
    const token = this.getSessionToken();
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/v1/dashboard/clients?userId=${effectiveUserId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok || !json.success) return [];
      return json.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Create an agent client with custom policy grant
   */
  public static async createAgentClient(
    clientName: string,
    initialGrant?: any,
    userId?: string
  ): Promise<{ success: boolean; client?: any; secretKey?: string; error?: string }> {
    const effectiveUserId = userId || this.getUserId();
    const token = this.getSessionToken();
    const res = await fetch(`${this.getBaseUrl()}/api/v1/dashboard/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: effectiveUserId,
        clientName,
        initialGrant,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create agent client');
    }
    return json;
  }

  /**
   * Revoke an agent client's access immediately
   */
  public static async revokeAgentClient(clientId: string, userId?: string): Promise<boolean> {
    const effectiveUserId = userId || this.getUserId();
    const token = this.getSessionToken();
    const res = await fetch(`${this.getBaseUrl()}/api/v1/dashboard/clients/${encodeURIComponent(clientId)}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId: effectiveUserId }),
    });
    const json = await res.json();
    return !!json.success;
  }

  /**
   * Emergency Kill-Switch: Instantly revoke all agent execution privileges
   */
  public static async activateKillSwitch(
    walletAddress: string,
    reason: string = 'Emergency lockout activated by user',
    userId?: string
  ): Promise<{ success: boolean; status: string; error?: string }> {
    const effectiveUserId = userId || this.getUserId();
    const token = this.getSessionToken();
    const res = await fetch(`${this.getBaseUrl()}/api/v1/dashboard/kill-switch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: effectiveUserId,
        walletAddress,
        reason,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to activate kill switch');
    }
    return json;
  }
}
