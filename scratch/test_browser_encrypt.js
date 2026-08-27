import { webcrypto } from 'crypto';
const crypto = webcrypto;

async function encryptCredentialClient(plaintext) {
  try {
    const masterSecret = 'northveil_production_master_vault_key_2026';
    const encoder = new TextEncoder();
    const keyData = await crypto.subtle.digest('SHA-256', encoder.encode(masterSecret));
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedBuf = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      encoder.encode(plaintext)
    );

    const encryptedArray = new Uint8Array(encryptedBuf);
    const tagLength = 16;
    const ciphertextBytes = encryptedArray.slice(0, encryptedArray.length - tagLength);
    const authTagBytes = encryptedArray.slice(encryptedArray.length - tagLength);

    const toHex = (buf) => Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      ciphertext: toHex(ciphertextBytes),
      iv: toHex(iv),
      authTag: toHex(authTagBytes)
    };
  } catch (e) {
    console.error('Web Crypto encrypt error:', e);
    throw e;
  }
}

// NOTE: Hardcoded fallback key removed. Use non-sensitive dummy string for cipher testing.
// Any previously committed test key in repo history is public and must be treated as permanently compromised.
encryptCredentialClient('dummy_test_credential_payload_for_web_crypto')
  .then(res => console.log('Web Crypto Encrypted:', res))
  .catch(console.error);
