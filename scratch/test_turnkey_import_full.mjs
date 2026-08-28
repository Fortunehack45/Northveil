import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

import { getTurnkeyClient } from '../mcp-server/mpcControlPlaneService.ts';

const turnkey = getTurnkeyClient();
const orgId = process.env.TURNKEY_ORGANIZATION_ID;

/**
 * Encrypt a plaintext secret directly for the Turnkey AWS Nitro Enclave
 * Turnkey EncryptedBundle schema:
 * {
 *   "encappedPublic": "<uncompressed or compressed hex of ephemeral public key>",
 *   "ciphertext": "<hex of encrypted payload (ciphertext + tag)>"
 * }
 */
function encryptForTurnkeyEnclave(plaintext, targetPublicKeyHex) {
  const clientEcdh = crypto.createECDH('prime256v1');
  clientEcdh.generateKeys();
  const encappedPublic = clientEcdh.getPublicKey('hex', 'uncompressed'); // 04... 65 bytes

  const sharedSecret = clientEcdh.computeSecret(Buffer.from(targetPublicKeyHex, 'hex'));

  // HKDF-SHA256
  const derivedKeyMaterial = crypto.hkdfSync(
    'sha256',
    sharedSecret,
    Buffer.alloc(0),
    Buffer.from('turnkey_enclave_encryption', 'utf8'),
    28 // 16 bytes key + 12 bytes IV
  );

  const derivedBuffer = Buffer.from(derivedKeyMaterial);
  const aesKey = derivedBuffer.subarray(0, 16);
  const iv = derivedBuffer.subarray(16, 28);

  const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, iv);
  let ciphertext = cipher.update(Buffer.from(plaintext, 'utf8'));
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);
  const authTag = cipher.getAuthTag();

  const fullEncryptedPayload = Buffer.concat([ciphertext, authTag]);

  return JSON.stringify({
    encappedPublic,
    ciphertext: fullEncryptedPayload.toString('hex'),
  });
}

async function testImport() {
  const whoami = await turnkey.getWhoami({ organizationId: orgId });
  const userId = whoami.userId;

  console.log('Turnkey User ID:', userId);

  // 1. Initialize Import Private Key activity
  const initRes = await turnkey.initImportPrivateKey({
    type: 'ACTIVITY_TYPE_INIT_IMPORT_PRIVATE_KEY',
    timestampMs: Date.now().toString(),
    organizationId: orgId,
    parameters: {
      userId,
    },
  });

  const bundleRaw = initRes.activity?.result?.initImportPrivateKeyResult?.importBundle;
  const parsedBundle = JSON.parse(bundleRaw);
  const dataParsed = JSON.parse(Buffer.from(parsedBundle.data, 'hex').toString('utf8'));
  const targetPublicKey = dataParsed.targetPublic;
  console.log('Enclave Target Public Key:', targetPublicKey);

  // Test with a clean 32-byte hex private key (without 0x prefix or with 0x)
  const testRandomWallet = crypto.randomBytes(32).toString('hex');
  const encBundle = encryptForTurnkeyEnclave(testRandomWallet, targetPublicKey);
  console.log('Encrypted Bundle Prepared:', encBundle);

  console.log('Submitting importPrivateKey activity to Turnkey Enclave...');
  const importRes = await turnkey.importPrivateKey({
    type: 'ACTIVITY_TYPE_IMPORT_PRIVATE_KEY',
    timestampMs: Date.now().toString(),
    organizationId: orgId,
    parameters: {
      userId,
      privateKeyName: `Imported Enclave Vault ${Date.now()}`,
      encryptedBundle: encBundle,
      curve: 'CURVE_SECP256K1',
      addressFormats: ['ADDRESS_FORMAT_ETHEREUM'],
    },
  });

  console.log('🎉 REAL TURNKEY ENCLAVE IMPORT SUCCESSFUL!');
  console.log(JSON.stringify(importRes, null, 2));
}

testImport().catch(console.error);
