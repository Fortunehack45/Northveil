import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

import { getTurnkeyClient } from '../mcp-server/mpcControlPlaneService.ts';
import { encryptWalletToBundle } from '@turnkey/crypto';
import { ethers } from 'ethers';

const turnkey = getTurnkeyClient();
const orgId = process.env.TURNKEY_ORGANIZATION_ID;

console.log('Testing Official Turnkey In-App Seed Phrase (Mnemonic) Import...\n');

async function testMnemonicImport() {
  const whoami = await turnkey.getWhoami({ organizationId: orgId });
  const userId = whoami.userId;

  console.log('Turnkey User ID:', userId);

  // Generate a random 12-word mnemonic
  const sampleWallet = ethers.Wallet.createRandom();
  const mnemonic = sampleWallet.mnemonic.phrase;
  console.log('Sample Wallet Address to Import:', sampleWallet.address);

  // 1. Initialize Import Wallet activity
  const initRes = await turnkey.initImportWallet({
    type: 'ACTIVITY_TYPE_INIT_IMPORT_WALLET',
    timestampMs: Date.now().toString(),
    organizationId: orgId,
    parameters: {
      userId,
    },
  });

  const importBundle = initRes.activity?.result?.initImportWalletResult?.importBundle;
  console.log('Obtained Import Wallet Bundle from Enclave');

  // 2. Encrypt using official Turnkey HPKE crypto
  const encryptedBundle = await encryptWalletToBundle({
    mnemonic,
    importBundle,
    userId,
    organizationId: orgId,
  });

  console.log('Encrypted wallet bundle generated via @turnkey/crypto');

  // 3. Submit importWallet to Turnkey Enclave
  const importRes = await turnkey.importWallet({
    type: 'ACTIVITY_TYPE_IMPORT_WALLET',
    timestampMs: Date.now().toString(),
    organizationId: orgId,
    parameters: {
      userId,
      walletName: `Imported Seed Vault (${sampleWallet.address.slice(0, 8)})`,
      encryptedBundle,
      accounts: [
        {
          curve: 'CURVE_SECP256K1',
          pathFormat: 'PATH_FORMAT_BIP32',
          path: "m/44'/60'/0'/0/0",
          addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
        },
      ],
    },
  });

  console.log('\n🎉 SUCCESS! Seed Phrase Wallet imported directly into Turnkey Hardware TEE:');
  console.log('Status:', importRes.activity?.status);
  console.log('Imported Address:', importRes.activity?.result?.importWalletResult?.addresses?.[0]);
  console.log('Turnkey Wallet ID:', importRes.activity?.result?.importWalletResult?.walletId);
}

testMnemonicImport().catch(console.error);
