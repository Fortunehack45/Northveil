import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

import {
  createMpcWallet,
  validateTurnkeyConfiguration,
  getTurnkeyClient
} from '../mcp-server/mpcControlPlaneService.ts';

console.log('Testing Live Turnkey API Connection & Hardware Wallet Creation...');
console.log('TURNKEY_ORGANIZATION_ID:', process.env.TURNKEY_ORGANIZATION_ID);
console.log('TURNKEY_API_PUBLIC_KEY:', process.env.TURNKEY_API_PUBLIC_KEY);

try {
  const wallet = await createMpcWallet('test_admin_user', 'Northveil Production Enclave Vault');
  console.log('\n🎉 SUCCESS! Real Turnkey Hardware Wallet Provisioned:');
  console.log('Address:', wallet.address);
  console.log('MPC Wallet ID:', wallet.mpcWalletId);
  console.log('MPC Provider:', wallet.mpcProvider);
  console.log('Status:', wallet.status);
} catch (err) {
  console.error('\n❌ Turnkey API Error:', err.message);
  if (err.cause) console.error('Cause:', err.cause);
}
