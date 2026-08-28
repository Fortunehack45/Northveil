import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __fn = fileURLToPath(import.meta.url);
const __dn = path.dirname(__fn);
dotenv.config({ path: path.resolve(__dn, '..', '.env') });
dotenv.config({ path: path.resolve(__dn, '..', 'mcp-server', '.env') });

import { getTurnkeyClient } from '../mcp-server/mpcControlPlaneService.ts';
import { ethers } from 'ethers';

const turnkey = getTurnkeyClient();
const rawAddr = '0x2ff533350c3fc752d551117ec2dc33ef760b1700';
const checksumAddr = ethers.getAddress(rawAddr);

console.log('Testing Turnkey signing with Checksum Address:', checksumAddr);

const txToSign = {
  to: '0x000000000000000000000000000000000000dEaD',
  value: '1000',
  data: '0x',
  nonce: 0,
  gasLimit: 21000,
  maxFeePerGas: '20000000000',
  maxPriorityFeePerGas: '1500000000',
  chainId: 11155111,
  type: 2,
};

const unsignedSerialized = ethers.Transaction.from(txToSign).unsignedSerialized;

try {
  const signResult = await turnkey.signTransaction({
    type: 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2',
    timestampMs: Date.now().toString(),
    organizationId: process.env.TURNKEY_ORGANIZATION_ID,
    parameters: {
      signWith: checksumAddr,
      unsignedTransaction: unsignedSerialized,
      type: 'TRANSACTION_TYPE_ETHEREUM',
    },
  });
  console.log('🎉 Signed successfully with checksum address!');
  console.log('Sign Result:', signResult);
} catch (e) {
  console.error('Checksum sign error:', e.message);
}
