/**
 * Northveil Client-Side WebAuthn & Hardware Passkey Service
 * Supports Touch ID, Face ID, Windows Hello, and FIDO2 Hardware Security Keys
 * Non-Custodial Biometric Authorization for On-Chain MPC Operations
 */

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
    const hostname = window.location.hostname;
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
      return hostname || 'localhost';
    }
    if (hostname.endsWith('.vercel.app')) {
      return hostname;
    }
    if (hostname.endsWith('northveil.xyz')) {
      return 'northveil.xyz';
    }
    return hostname;
  }

  /**
   * Retrieves any previously registered passkey from localStorage
   */
  public static getRegisteredPasskey(walletAddress?: string): RegisteredPasskey | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const parsed: RegisteredPasskey = JSON.parse(raw);
      if (walletAddress && parsed.walletAddress && parsed.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return null;
      }
      return parsed;
    } catch {
      return null;
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
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLen);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Registers a new WebAuthn Hardware Passkey on this device
   */
  public static async registerPasskey(
    walletAddress: string,
    displayName?: string
  ): Promise<{ success: boolean; passkey?: RegisteredPasskey; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'WebAuthn is not supported on this browser or platform.' };
    }

    try {
      const rpId = this.getRpId();
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userIdStr = (walletAddress || 'northveil-vault-user').toLowerCase();
      const userIdBytes = new TextEncoder().encode(userIdStr.slice(0, 32));

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Northveil Autonomous Vault',
          id: rpId,
        },
        user: {
          id: userIdBytes,
          name: userIdStr,
          displayName: displayName || `Vault (${userIdStr.slice(0, 6)}...${userIdStr.slice(-4)})`,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256 (P-256)
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential | null;

      if (!credential) {
        return { success: false, error: 'Passkey registration cancelled or returned no credential.' };
      }

      const rawIdBase64 = this.bufferToBase64URL(credential.rawId);
      const registered: RegisteredPasskey = {
        credentialId: credential.id,
        rawIdBase64,
        createdAt: new Date().toISOString(),
        deviceName: 'Biometric Touch ID / Face ID',
        walletAddress: (walletAddress || '').toLowerCase(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registered));
      return { success: true, passkey: registered };
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'Passkey prompt was cancelled by the user.' };
      }
      return { success: false, error: err.message || 'Passkey registration failed.' };
    }
  }

  /**
   * Authenticates with an existing Passkey or initiates biometric authorization
   */
  public static async authenticate(
    walletAddress?: string,
    customChallenge?: string
  ): Promise<{
    success: boolean;
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

    try {
      const rpId = this.getRpId();
      let challenge: Uint8Array;
      if (customChallenge && customChallenge.length >= 16) {
        challenge = new TextEncoder().encode(customChallenge);
      } else {
        challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
      }

      const registered = this.getRegisteredPasskey(walletAddress);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId,
        userVerification: 'preferred',
        timeout: 60000,
      };

      if (registered?.rawIdBase64) {
        try {
          publicKeyCredentialRequestOptions.allowCredentials = [
            {
              id: this.base64URLToBuffer(registered.rawIdBase64) as unknown as BufferSource,
              type: 'public-key',
              transports: ['internal', 'hybrid'],
            },
          ];
        } catch {
          // If buffer decode fails, proceed without allowCredentials
        }
      }

      const assertion = (await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      })) as PublicKeyCredential | null;

      if (!assertion) {
        return { success: false, error: 'Biometric authorization returned no response.' };
      }

      const response = assertion.response as AuthenticatorAssertionResponse;
      const clientDataJSON = this.bufferToBase64URL(response.clientDataJSON);
      const authenticatorData = this.bufferToBase64URL(response.authenticatorData);
      const signature = this.bufferToBase64URL(response.signature);

      return {
        success: true,
        assertion: {
          credentialId: assertion.id,
          clientDataJSON,
          authenticatorData,
          signature,
        },
      };
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'Biometric authorization was cancelled.' };
      }
      return { success: false, error: err.message || 'WebAuthn biometric authentication error.' };
    }
  }
}
