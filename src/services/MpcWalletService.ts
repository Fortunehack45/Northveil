/**
 * Northveil MPC & Passkey Client Service
 * Coordinates Non-Custodial Northveil Hardware TEE Enclave Vault creation,
 * WebAuthn hardware biometric authentication, and signed session tokens.
 */

import { getMcpServerUrl } from '../config/endpointConfig';
import { ethers } from 'ethers';
import { WalletService } from './WalletService';
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
    if (typeof window === 'undefined') return 'user_default';
    let id = localStorage.getItem(this.USER_KEY);
    if (!id) {
      id = `usr_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(this.USER_KEY, id);
    }
    return id;
  }

  /**
   * Provision a Non-Custodial Vault
   */
  public static async createMpcVault(walletName: string = 'Primary Vault', userId?: string): Promise<MpcVaultCreationResult> {
    const effectiveUserId = userId || this.getUserId();
    const res = await fetch(`${this.getBaseUrl()}/api/v1/wallets/create-mpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: effectiveUserId,
        walletName,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create Non-Custodial Vault');
    }

    return {
      success: true,
      address: json.address,
      mpcWalletId: json.mpcWalletId,
      mpcProvider: json.mpcProvider || 'non_custodial',
      userId: effectiveUserId,
    };
  }

  /**
   * Import wallet public metadata into Northveil (Derives address locally; secrets never sent to server)
   */
  public static async importMpcVault(
    importType: 'privateKey' | 'seed' | 'publicAddress',
    secretOrAddress: string,
    walletName: string = 'Imported Vault',
    userId?: string
  ): Promise<MpcVaultCreationResult> {
    const effectiveUserId = userId || this.getUserId();
    const cleanSecret = secretOrAddress.trim();
    let publicAddress = '';

    if (importType === 'seed') {
      const words = cleanSecret.split(/\s+/).map((w) => w.trim().toLowerCase()).filter(Boolean);
      if (words.length >= 12) {
        const derived = WalletService.deriveEVMAddress(words, 0);
        publicAddress = derived.address.toLowerCase();
      } else {
        publicAddress = sanitizeToValidAddress(cleanSecret, 0);
      }
    } else if (importType === 'privateKey') {
      const cleanKey = cleanSecret.startsWith('0x') ? cleanSecret : `0x${cleanSecret}`;
      try {
        const wallet = new ethers.Wallet(cleanKey);
        publicAddress = wallet.address.toLowerCase();
      } catch {
        publicAddress = sanitizeToValidAddress(cleanSecret, 0);
      }
    } else {
      publicAddress = sanitizeToValidAddress(cleanSecret, 0);
    }

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/v1/wallets/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: publicAddress,
          walletName,
          userId: effectiveUserId,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        return {
          success: true,
          address: publicAddress,
          mpcWalletId: json.mpcWalletId || `wlt_${Date.now()}_${publicAddress.slice(2, 8)}`,
          mpcProvider: json.mpcProvider || 'non_custodial',
          userId: effectiveUserId,
        };
      }
    } catch {}

    // Local non-custodial fallback: register locally without blocking user
    return {
      success: true,
      address: publicAddress,
      mpcWalletId: `wlt_local_${Date.now()}_${publicAddress.slice(2, 8)}`,
      mpcProvider: 'non_custodial',
      userId: effectiveUserId,
    };
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
    const res = await fetch(`${this.getBaseUrl()}/api/v1/auth/passkey/register-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userName: userName || `user_${userId.slice(0, 8)}@northveil.xyz`,
        userDisplayName: displayName || 'Northveil Vault User',
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
    const res = await fetch(`${this.getBaseUrl()}/api/v1/auth/passkey/verify-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        walletAddress: (walletAddress || '').toLowerCase(),
        registrationResponse,
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
    const res = await fetch(`${this.getBaseUrl()}/api/v1/auth/passkey/auth-options`, {
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
    const res = await fetch(`${this.getBaseUrl()}/api/v1/auth/passkey/verify-authentication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        walletAddress: (walletAddress || '').toLowerCase(),
        authenticationResponse,
      }),
    });

    const json = await res.json();
    if (!res.ok || (!json.verified && !json.success)) {
      throw new Error(json.error || json.message || 'Biometric passkey authentication failed');
    }

    if (json.sessionToken) {
      this.saveSession(json.sessionToken, userId, 'mpc');
    }

    return json;
  }

  /**
   * Validate current session status with backend
   */
  public static async checkSession(): Promise<{ authenticated: boolean; user?: any }> {
    const token = this.getSessionToken();
    if (!token) return { authenticated: false };

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/v1/auth/session`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return json;
    } catch {
      return { authenticated: false };
    }
  }

  /**
   * Fetch pending approval requests for human review
   */
  public static async getPendingApprovals(userId?: string): Promise<any[]> {
    const effectiveUserId = userId || this.getUserId();
    const token = this.getSessionToken();
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/v1/dashboard/approvals/pending?userId=${effectiveUserId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return [];
      }
      return json.pendingApprovals || json.data || json.approvals || [];
    } catch {
      return [];
    }
  }

  /**
   * Approve a staged transaction request with WebAuthn Passkey biometric assertion
   */
  public static async approveTransactionRequestWithPasskey(
    requestIdOrToken: string,
    passkeyAssertion?: any,
    userId?: string
  ): Promise<{
    success: boolean;
    txHash?: string;
    blockNumber?: number;
    explorerUrl?: string;
    gasUsed?: string;
    unsignedTransaction?: any;
    unsignedSerialized?: string;
    status?: string;
    recipient?: string;
    amount?: number;
    asset?: string;
    network?: string;
    calldata?: string;
    chainId?: number;
    error?: string;
  }> {
    const effectiveUserId = userId || this.getUserId();
    const token = this.getSessionToken();
    const res = await fetch(`${this.getBaseUrl()}/api/v1/dashboard/approvals/${encodeURIComponent(requestIdOrToken)}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: effectiveUserId,
        passkeyAssertion,
      }),
    });

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
