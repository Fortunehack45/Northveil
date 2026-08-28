import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

import { getTurnkeyClient } from '../mcp-server/mpcControlPlaneService.ts';

const turnkey = getTurnkeyClient();
const orgId = process.env.TURNKEY_ORGANIZATION_ID;

console.log('Testing Turnkey initImportPrivateKey and initImportWallet...');

try {
  const initRes = await turnkey.initImportPrivateKey({
    type: 'ACTIVITY_TYPE_INIT_IMPORT_PRIVATE_KEY',
    timestampMs: Date.now().toString(),
    organizationId: orgId,
    parameters: {
      userId: process.env.TURNKEY_API_PUBLIC_KEY ? undefined : undefined,
    },
  });
  console.log('initImportPrivateKey response:', JSON.stringify(initRes, null, 2));
} catch (e) {
  console.error('initImportPrivateKey error:', e.message);
}

try {
  const initWalletRes = await turnkey.initImportWallet({
    type: 'ACTIVITY_TYPE_INIT_IMPORT_WALLET',
    timestampMs: Date.now().toString(),
    organizationId: orgId,
    parameters: {
      userId: undefined,
    },
  });
  console.log('initImportWallet response:', JSON.stringify(initWalletRes, null, 2));
} catch (e) {
  console.error('initImportWallet error:', e.message);
}
