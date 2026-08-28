import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

import { getTurnkeyClient } from '../mcp-server/mpcControlPlaneService.ts';
import { encryptPrivateKeyToBundle, encryptWalletToBundle } from '@turnkey/crypto';
import { ethers } from 'ethers';

const turnkey = getTurnkeyClient();
const orgId = process.env.TURNKEY_ORGANIZATION_ID;

console.log('Testing Official Turnkey In-App Private Key & Mnemonic Import...\n');

async function testOfficialImport() {
  const whoami = await turnkey.getWhoami({ organizationId: orgId });
  const userId = whoami.userId;

  console.log('Turnkey User ID:', userId);

  // Test importing a private key (for example an existing developer/user wallet)
  const sampleWallet = ethers.Wallet.createRandom();
  console.log('Sample Wallet Address to Import:', sampleWallet.address);

  // 1. Initialize Import Private Key activity
  const initRes = await turnkey.initImportPrivateKey({
    type: 'ACTIVITY_TYPE_INIT_IMPORT_PRIVATE_KEY',
    timestampMs: Date.now().toString(),
    organizationId: orgId,
    parameters: {
      userId,
    },
  });

  const importBundle = initRes.activity?.result?.initImportPrivateKeyResult?.importBundle;
  console.log('Obtained Import Bundle from Enclave');

  // 2. Encrypt using official Turnkey HPKE crypto
  const encryptedBundle = await encryptPrivateKeyToBundle({
    privateKey: sampleWallet.privateKey.replace(/^0x/, ''),
    keyFormat: 'HEXADECIMAL',
    importBundle,
    userId,
    organizationId: orgId,
  });

  console.log('Encrypted bundle generated via @turnkey/crypto');

  // 3. Submit importPrivateKey to Turnkey Enclave
  const importRes = await turnkey.importPrivateKey({
    type: 'ACTIVITY_TYPE_IMPORT_PRIVATE_KEY',
    timestampMs: Date.now().toString(),
    organizationId: orgId,
    parameters: {
      userId,
      privateKeyName: `Imported Vault (${sampleWallet.address.slice(0, 8)})`,
      encryptedBundle,
      curve: 'CURVE_SECP256K1',
      addressFormats: ['ADDRESS_FORMAT_ETHEREUM'],
    },
  });

  console.log('\n🎉 SUCCESS! Wallet imported directly into Turnkey Hardware TEE:');
  console.log('Status:', importRes.activity?.status);
  console.log('Imported Address:', importRes.activity?.result?.importPrivateKeyResult?.addresses?.[0]);
  console.log('Turnkey Private Key ID:', importRes.activity?.result?.importPrivateKeyResult?.privateKeyId);
}

testOfficialImport().catch(console.error);
