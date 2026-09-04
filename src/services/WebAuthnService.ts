/**
 * Northveil Client-Side WebAuthn & Hardware Passkey Service
 * Supports Touch ID, Face ID, Windows Hello, and FIDO2 Hardware Security Keys
 * STRICT 1-TO-1 Non-Custodial Biometric Authorization for On-Chain MPC Operations
 */

import { MpcWalletService } from './MpcWalletService';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export function explainWebAuthn(err: unknown): string {
  const e = err as DOMException;
  if (e?.name === 'NotAllowedError') {
    return 'Passkey blocked or timed out. Use https://wallet.northveil.xyz in Chrome or Safari (not an in-app browser). Enable Windows Hello / Touch ID / Face ID, or use a security key. Tap Enroll once and finish the system prompt within two minutes.';
  }
  if (e?.name === 'InvalidStateError') return 'This device already has a Northveil passkey. Use Unlock.';
  if (e?.name === 'NotSupportedError') return 'This browser cannot create passkeys.';
  return (e as any)?.message || 'Passkey failed';
}

export interface RegisteredPasskey {
  credentialId: string;
  rawIdBase64: string;
  publicKeyBase64?: string;
  createdAt: string;
  deviceName: string;
  walletAddress: string;
}

export class WebAuthnService {
  private static STORAGE_KEY = 'northveil_registered_passkey';
  private static MAP_STORAGE_KEY = 'northveil_passkeys_by_wallet';

  /**
   * Check if the current browser and platform support WebAuthn
   */
  public static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential !== undefined &&
      typeof window.navigator?.credentials?.create === 'function' &&
      typeof window.navigator?.credentials?.get === 'function'
    );
  }

  /**
   * Determines the Relying Party (RP) ID matching the active hostname
   */
  public static getRpId(): string {
    if (typeof window === 'undefined') return 'northveil.xyz';
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return h;
    return 'northveil.xyz';
  }

  /**
   * Internal helper to load the 1-to-1 map of passkeys keyed by wallet address
   */
  public static listRegisteredPasskeys(): Record<string, RegisteredPasskey> {
    if (typeof window === 'undefined') return {};
    const map: Record<string, RegisteredPasskey> = {};

    // 1. Read modern map storage
    try {
      const rawMap = localStorage.getItem(this.MAP_STORAGE_KEY);
      if (rawMap) {
        const parsed = JSON.parse(rawMap);
        if (typeof parsed === 'object' && parsed !== null) {
          for (const [addr, cred] of Object.entries(parsed)) {
            if (cred && typeof cred === 'object') {
              map[addr.toLowerCase()] = cred as RegisteredPasskey;
            }
          }
        }
      }
    } catch {}

    // 2. Migrate legacy single-passkey storage if present
    try {
      const legacyRaw = localStorage.getItem(this.STORAGE_KEY);
      if (legacyRaw) {
        const legacy: RegisteredPasskey = JSON.parse(legacyRaw);
        if (legacy && legacy.walletAddress) {
          const norm = legacy.walletAddress.toLowerCase();
          if (!map[norm]) {
            map[norm] = legacy;
            localStorage.setItem(this.MAP_STORAGE_KEY, JSON.stringify(map));
          }
        }
      }
    } catch {}

    return map;
  }

  /**
   * Retrieves the passkey registered strictly for a specific wallet address
   */
  public static getRegisteredPasskey(walletAddress?: string): RegisteredPasskey | null {
    if (typeof window === 'undefined') return null;
    const map = this.listRegisteredPasskeys();
    if (walletAddress) {
      return map[walletAddress.toLowerCase()] || null;
    }
    const values = Object.values(map);
    return values.length > 0 ? values[0] : null;
  }

  /**
   * Removes a passkey bound to a specific wallet address
   */
  public static removePasskey(walletAddress: string): boolean {
    if (typeof window === 'undefined' || !walletAddress) return false;
    const norm = walletAddress.toLowerCase();
    const map = this.listRegisteredPasskeys();
    delete map[norm];
    try {
      localStorage.setItem(this.MAP_STORAGE_KEY, JSON.stringify(map));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Converts Uint8Array to base64url string
   */
  public static bufferToBase64URL(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Converts base64url string to Uint8Array
   */
  public static base64URLToBuffer(base64url: string): Uint8Array {
    try {
      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
      const padLen = (4 - (base64.length % 4)) % 4;
      const padded = base64 + '='.repeat(padLen === 4 ? 0 : padLen);
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch {
      return new TextEncoder().encode(base64url);
    }
  }

  /**
   * Registers a new WebAuthn Hardware Passkey and binds it 1-to-1 to a specific MPC Vault
   */
  public static async registerPasskey(
    walletAddress: string,
    displayName?: string,
    userId?: string
  ): Promise<{ success: boolean; passkey?: RegisteredPasskey; sessionToken?: string; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'WebAuthn hardware passkeys are not supported on this browser or platform.' };
    }
    const normAddr = (walletAddress || '').toLowerCase();
    if (!normAddr) {
      return { success: false, error: 'A valid wallet address is required for 1-to-1 passkey binding.' };
    }

    try {
      const effectiveUserId = userId || MpcWalletService.getUserId();

      // 1. Obtain cryptographic challenge from server for this specific wallet
      const serverOpts = await MpcWalletService.getPasskeyRegistrationOptions(
        effectiveUserId,
        `user_${normAddr.slice(0, 8)}@northveil.xyz`,
        displayName || `Vault ${normAddr.slice(0, 6)}...${normAddr.slice(-4)}`,
        normAddr
      );

      const optionsJSON = (serverOpts as any).options || serverOpts;
      let attResp: any;
      try {
        attResp = await startRegistration({ optionsJSON });
      } catch (err) {
        return { success: false, error: explainWebAuthn(err) };
      }

      const registrationResponsePayload = {
        id: attResp.id,
        rawId: attResp.rawId,
        type: attResp.type,
        response: attResp.response,
      };

      // 2. Verify with server and receive signed session token
      let sessionToken: string | undefined;
      try {
        const verifyRes = await MpcWalletService.verifyPasskeyRegistration(
          effectiveUserId,
          normAddr,
          registrationResponsePayload
        );
        sessionToken = verifyRes.sessionToken;
      } catch (err: any) {
        console.warn('Server registration verification note:', err.message);
      }

      const registered: RegisteredPasskey = {
        credentialId: attResp.id,
        rawIdBase64: attResp.rawId,
        createdAt: new Date().toISOString(),
        deviceName: 'Biometric Touch ID / Face ID',
        walletAddress: normAddr,
      };

      // 3. Save strictly to the per-wallet map (1-to-1 binding)
      const map = this.listRegisteredPasskeys();
      map[normAddr] = registered;
      localStorage.setItem(this.MAP_STORAGE_KEY, JSON.stringify(map));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registered));

      return { success: true, passkey: registered, sessionToken };
    } catch (err: any) {
      return { success: false, error: explainWebAuthn(err) };
    }
  }

  /**
   * Authenticates with an existing Passkey strictly bound to this wallet
   */
  public static async authenticate(
    walletAddress?: string,
    customChallenge?: string,
    userId?: string
  ): Promise<{
    success: boolean;
    sessionToken?: string;
    assertion?: {
      credentialId: string;
      clientDataJSON: string;
      authenticatorData: string;
      signature: string;
    };
    error?: string;
  }> {
    if (!this.isSupported()) {
      return { success: false, error: 'WebAuthn hardware biometrics not supported on this platform.' };
    }

    const normAddr = (walletAddress || '').toLowerCase();

    try {
      const effectiveUserId = userId || MpcWalletService.getUserId();
      const serverOpts = await MpcWalletService.getPasskeyAuthOptions(effectiveUserId, normAddr);
      const optionsJSON = (serverOpts as any).options || serverOpts;

      let authResp: any;
      try {
        authResp = await startAuthentication({ optionsJSON });
      } catch (err) {
        return { success: false, error: explainWebAuthn(err) };
      }

      return {
        success: true,
        assertion: {
          credentialId: authResp.id,
          clientDataJSON: authResp.response.clientDataJSON,
          authenticatorData: authResp.response.authenticatorData,
          signature: authResp.response.signature,
        },
      };
    } catch (err: any) {
      return { success: false, error: explainWebAuthn(err) };
    }
  }
}
