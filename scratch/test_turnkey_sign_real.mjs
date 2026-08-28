import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

import {
  stageTransactionRequest,
  approveAndExecuteWithPasskey,
  getTurnkeyClient
} from '../mcp-server/mpcControlPlaneService.ts';

const turnkeyWalletAddress = '0x2ff533350c3fc752d551117ec2dc33ef760b1700';

console.log('Testing Real Turnkey Hardware TEE Signing on Sepolia...');
console.log('Using newly created Turnkey MPC Wallet:', turnkeyWalletAddress);

try {
  const staged = await stageTransactionRequest(
    turnkeyWalletAddress,
    '0x000000000000000000000000000000000000dEaD',
    0.0001,
    'ETH',
    'sepolia',
    {
      to: '0x000000000000000000000000000000000000dEaD',
      value: '0.0001'
    },
    'test_admin_user'
  );

  console.log('Staged Request ID:', staged.requestId);
  console.log('Approval Token:', staged.approvalToken);

  console.log('\nExecuting Turnkey Hardware Signing via approveAndExecuteWithPasskey...');
  const result = await approveAndExecuteWithPasskey(staged.approvalToken, undefined, 'test_admin_user');
  console.log('🎉 Execution Result:', result);
} catch (err) {
  console.log('Result/Notice:', err.message);
}
