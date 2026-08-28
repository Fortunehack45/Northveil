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

console.log('Querying Turnkey Users & Whoami...');
try {
  const whoami = await turnkey.getWhoami({ organizationId: orgId });
  console.log('Whoami:', whoami);

  const users = await turnkey.getUsers({ organizationId: orgId });
  console.log('Users:', JSON.stringify(users, null, 2));

  const userId = whoami.userId || users.users?.[0]?.userId;
  console.log('Target User ID:', userId);

  const initWalletRes = await turnkey.initImportWallet({
    type: 'ACTIVITY_TYPE_INIT_IMPORT_WALLET',
    timestampMs: Date.now().toString(),
    organizationId: orgId,
    parameters: {
      userId,
    },
  });
  console.log('🎉 initImportWallet Result:', JSON.stringify(initWalletRes, null, 2));
} catch (e) {
  console.error('Error:', e.message);
}
