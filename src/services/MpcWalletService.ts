/**
 * Northveil MPC & Passkey Client Service
 * Coordinates Non-Custodial Turnkey Hardware TEE Enclave Vault creation,
 * WebAuthn hardware biometric authentication, and signed session tokens.
 */

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
    if (typeof window === 'undefined') return 'http://localhost:3001';
    return window.location.origin;
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
   * Provision a genuine Turnkey Hardware TEE Enclave MPC Vault
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
      throw new Error(json.error || 'Failed to create Turnkey MPC Vault');
    }

    return {
      success: true,
      address: json.address,
      mpcWalletId: json.mpcWalletId,
      mpcProvider: json.mpcProvider || 'turnkey',
      userId: effectiveUserId,
    };
  }

  /**
   * Seamlessly import an existing private key or seed phrase directly into Turnkey Hardware Enclave
   */
  public static async importMpcVault(
    importType: 'privateKey' | 'seed',
    secret: string,
    walletName: string = 'Imported Vault',
    userId?: string
  ): Promise<MpcVaultCreationResult> {
    const effectiveUserId = userId || this.getUserId();
    const res = await fetch(`${this.getBaseUrl()}/api/v1/wallets/import-mpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        importType,
        secret,
        walletName,
        userId: effectiveUserId,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to import wallet into Turnkey MPC Enclave');
    }

    return {
      success: true,
      address: json.address,
      mpcWalletId: json.mpcWalletId,
      mpcProvider: json.mpcProvider || 'turnkey',
      userId: effectiveUserId,
    };
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
      return json.data || [];
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
    return json;
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
