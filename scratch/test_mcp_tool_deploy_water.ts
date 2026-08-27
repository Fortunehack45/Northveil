import 'dotenv/config';
import { executeRealTool } from '../mcp-server/index.js';

async function main() {
  console.log('--- Testing Real MCP deploy_smart_contract Tool for WATER Token ---');

  const args = {
    name: 'WATER',
    symbol: 'WAR',
    totalSupply: 100000000,
    network: 'sepolia',
    walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
    ownerAllocation: 100000000
  };

  console.log('Invoking deploy_smart_contract with args:', args);
  const result: any = await executeRealTool('deploy_smart_contract', args);

  console.log('Result Status:', result?.status);
  console.log('Result Contract Address:', result?.contractAddress || result?.predictedAddress);
  console.log('Result Tx Hash:', result?.txHash);
  console.log('Explorer URL:', result?.explorerUrl);
  console.log('Formatted Markdown:\n', result?.formattedMarkdown);

  if (result?.status === 'SUCCESS' || result?.txHash) {
    console.log('✅ [SUCCESS] Real on-chain deployment verified!');
  } else {
    console.error('❌ [FAILED] Deployment result:', result);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
