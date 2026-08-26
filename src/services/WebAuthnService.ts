/**
 * Northveil Client-Side WebAuthn & Hardware Passkey Service
 * Supports Touch ID, Face ID, Windows Hello, and FIDO2 Hardware Security Keys
 * Non-Custodial Biometric Authorization for On-Chain MPC Operations
 */

import { MpcWalletService } from './MpcWalletService';

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
   * Registers a new WebAuthn Hardware Passkey and binds it to the Turnkey MPC Vault
   */
  public static async registerPasskey(
    walletAddress: string,
    displayName?: string,
    userId?: string
  ): Promise<{ success: boolean; passkey?: RegisteredPasskey; sessionToken?: string; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'WebAuthn hardware passkeys are not supported on this browser or platform.' };
    }

    try {
      const effectiveUserId = userId || MpcWalletService.getUserId();
      let creationOptions: PublicKeyCredentialCreationOptions;

      try {
        // 1. Obtain cryptographic challenge from server
        const serverOpts = await MpcWalletService.getPasskeyRegistrationOptions(
          effectiveUserId,
          `user_${walletAddress.slice(0, 8)}@northveil.xyz`,
          displayName || `Vault ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        );

        creationOptions = {
          ...serverOpts,
          challenge: this.base64URLToBuffer(serverOpts.challenge) as unknown as BufferSource,
          user: {
            ...serverOpts.user,
            id: this.base64URLToBuffer(serverOpts.user.id) as unknown as BufferSource,
          },
          excludeCredentials: serverOpts.excludeCredentials?.map((c: any) => ({
            ...c,
            id: this.base64URLToBuffer(c.id) as unknown as BufferSource,
          })),
        };
      } catch (e: any) {
        // Fallback to client-generated options if backend unreachable in offline mode
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const userIdBytes = new TextEncoder().encode(effectiveUserId.slice(0, 32));
        creationOptions = {
          challenge,
          rp: { name: 'Northveil Autonomous Vault', id: this.getRpId() },
          user: {
            id: userIdBytes,
            name: `user_${walletAddress.slice(0, 8)}`,
            displayName: displayName || 'Northveil Vault User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        };
      }

      // 2. Prompt user device for Biometric / Security Key
      const credential = (await navigator.credentials.create({
        publicKey: creationOptions,
      })) as PublicKeyCredential | null;

      if (!credential) {
        return { success: false, error: 'Passkey registration cancelled or returned no credential.' };
      }

      const rawIdBase64 = this.bufferToBase64URL(credential.rawId);
      const response = credential.response as AuthenticatorAttestationResponse;

      const registrationResponsePayload = {
        id: credential.id,
        rawId: rawIdBase64,
        type: credential.type,
        response: {
          clientDataJSON: this.bufferToBase64URL(response.clientDataJSON),
          attestationObject: this.bufferToBase64URL(response.attestationObject),
          transports: (response as any).getTransports ? (response as any).getTransports() : ['internal', 'hybrid'],
          publicKeyAlgorithm: (response as any).getPublicKeyAlgorithm ? (response as any).getPublicKeyAlgorithm() : -7,
        },
      };

      // 3. Verify with server and receive signed session token
      let sessionToken: string | undefined;
      try {
        const verifyRes = await MpcWalletService.verifyPasskeyRegistration(
          effectiveUserId,
          walletAddress,
          registrationResponsePayload
        );
        sessionToken = verifyRes.sessionToken;
      } catch (err: any) {
        console.warn('Server registration verification note:', err.message);
      }

      const registered: RegisteredPasskey = {
        credentialId: credential.id,
        rawIdBase64,
        createdAt: new Date().toISOString(),
        deviceName: 'Biometric Touch ID / Face ID',
        walletAddress: (walletAddress || '').toLowerCase(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registered));
      return { success: true, passkey: registered, sessionToken };
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'Passkey prompt was cancelled by the user.' };
      }
      return { success: false, error: err.message || 'Passkey registration failed.' };
    }
  }

  /**
   * Authenticates with an existing Passkey and renews the secure session
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

    try {
      const effectiveUserId = userId || MpcWalletService.getUserId();
      let requestOptions: PublicKeyCredentialRequestOptions;

      try {
        const serverOpts = await MpcWalletService.getPasskeyAuthOptions(effectiveUserId, walletAddress);
        requestOptions = {
          ...serverOpts,
          challenge: this.base64URLToBuffer(serverOpts.challenge) as unknown as BufferSource,
          allowCredentials: serverOpts.allowCredentials?.map((c: any) => ({
            ...c,
            id: this.base64URLToBuffer(c.id) as unknown as BufferSource,
          })),
        };
      } catch {
        let challenge: Uint8Array;
        if (customChallenge && customChallenge.length >= 16) {
          challenge = new TextEncoder().encode(customChallenge);
        } else {
          challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
        }

        const registered = this.getRegisteredPasskey(walletAddress);
        requestOptions = {
          challenge,
          rpId: this.getRpId(),
          userVerification: 'preferred',
          timeout: 60000,
        };

        if (registered?.rawIdBase64) {
          try {
            requestOptions.allowCredentials = [
              {
                id: this.base64URLToBuffer(registered.rawIdBase64) as unknown as BufferSource,
                type: 'public-key',
                transports: ['internal', 'hybrid'],
              },
            ];
          } catch {}
        }
      }

      const assertion = (await navigator.credentials.get({
        publicKey: requestOptions,
      })) as PublicKeyCredential | null;

      if (!assertion) {
        return { success: false, error: 'Biometric authorization returned no response.' };
      }

      const response = assertion.response as AuthenticatorAssertionResponse;
      const clientDataJSON = this.bufferToBase64URL(response.clientDataJSON);
      const authenticatorData = this.bufferToBase64URL(response.authenticatorData);
      const signature = this.bufferToBase64URL(response.signature);
      const userHandle = response.userHandle ? this.bufferToBase64URL(response.userHandle) : undefined;

      const assertionPayload = {
        credentialId: assertion.id,
        clientDataJSON,
        authenticatorData,
        signature,
      };

      // Verify on backend
      let sessionToken: string | undefined;
      try {
        const verifyRes = await MpcWalletService.verifyPasskeyAuthentication(
          effectiveUserId,
          walletAddress || '',
          {
            id: assertion.id,
            rawId: this.bufferToBase64URL(assertion.rawId),
            type: assertion.type,
            response: {
              clientDataJSON,
              authenticatorData,
              signature,
              userHandle,
            },
          }
        );
        sessionToken = verifyRes.sessionToken;
      } catch (err: any) {
        console.warn('Server authentication verification note:', err.message);
      }

      return {
        success: true,
        sessionToken,
        assertion: assertionPayload,
      };
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'Biometric authorization was cancelled.' };
      }
      return { success: false, error: err.message || 'WebAuthn biometric authentication error.' };
    }
  }
}
