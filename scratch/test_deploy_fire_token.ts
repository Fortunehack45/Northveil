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

async function testDeployFireToken() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 TESTING LIVE SMART CONTRACT DEPLOYMENT: FIRE TOKEN');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const ownerWallet = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const reserveWallet = '0xcd80170f0aaec2b71c8df0163717f1856bec0dac';

  console.log('Deploying FIRE token (100M total supply, 97% to reserve, 3% to owner)...');
  const deployRes = await executeRealTool(
    'deploy_smart_contract',
    {
      name: 'FIRE',
      symbol: 'FIRE',
      totalSupply: 100000000,
      network: 'sepolia',
      reserveRecipientAddress: reserveWallet,
      reserveAllocationPercentage: 97,
      ownerAllocationPercentage: 3,
    },
    ownerWallet
  );

  console.log('\n--- DEPLOYMENT RESULT ---');
  console.log('Status:', deployRes.status);
  console.log('Contract Address:', deployRes.contractAddress);
  console.log('Transaction Hash:', deployRes.txHash);
  console.log('Explorer URL:', deployRes.explorerUrl);
  console.log('\nMarkdown output preview:\n', deployRes.formattedMarkdown?.slice(0, 500));

  assert.ok(deployRes.contractAddress, 'Must return a valid contract address');
  assert.ok(deployRes.txHash, 'Must return a valid transaction hash');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 FIRE SMART CONTRACT COMPILED AND DEPLOYED ON-CHAIN FLAWLESSLY!');
  console.log('═══════════════════════════════════════════════════════════════');
}

testDeployFireToken().catch((err) => {
  console.error('FIRE Token Deployment Test Failed:', err);
  process.exit(1);
});
