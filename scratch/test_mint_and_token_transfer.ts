process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import assert from 'assert';
import { executeRealTool } from '../mcp-server/index.js';

async function testMintAndTransfer() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 TESTING ON-CHAIN MINT & ERC-20 TOKEN TRANSFERS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const contractAddress = '0xbA5910E93867373c77c6D05b4b9487c312F1D715';
  const callerAddress = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const recipientAddress = '0xcd80170f0aaec2b71c8df0163717f1856bec0dac';

  // 1. Test Mint Tokens
  console.log('--- 1. Testing mint_tokens tool on Sepolia ---');
  const mintRes = await executeRealTool(
    'mint_tokens',
    {
      contractAddress,
      recipientAddress,
      amount: '5000',
      network: 'sepolia',
    },
    callerAddress
  );

  console.log('Mint status:', mintRes.status);
  console.log('Mint txHash:', mintRes.txHash || mintRes.transactionHash);
  assert.ok(mintRes.txHash || mintRes.transactionHash, 'Mint must produce transaction hash');
  console.log('✅ [PASS] mint_tokens completed on-chain.\n');

  // 2. Test ERC-20 Token Transfer
  console.log('--- 2. Testing send_transfer for ERC-20 Token on Sepolia ---');
  const tokenTransferRes = await executeRealTool(
    'send_transfer',
    {
      toAddress: recipientAddress,
      amount: '100',
      token: 'VOLT',
      tokenAddress: contractAddress,
      network: 'sepolia',
    },
    callerAddress
  );

  console.log('Token Transfer status:', tokenTransferRes.status);
  console.log('Token Transfer txHash:', tokenTransferRes.txHash || tokenTransferRes.transactionHash);
  assert.ok(tokenTransferRes.txHash || tokenTransferRes.transactionHash, 'Token transfer must produce transaction hash');
  console.log('✅ [PASS] Token transfer completed on-chain.\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL ON-CHAIN MINTING & TOKEN TRANSFERS SUCCEEDED!');
  console.log('═══════════════════════════════════════════════════════════════');
}

testMintAndTransfer().catch((err) => {
  console.error('Mint/Transfer Test Failed:', err);
  process.exit(1);
});
