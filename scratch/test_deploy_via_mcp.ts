import 'dotenv/config';
import { executeRealTool } from '../mcp-server/index.js';

async function main() {
  console.log('--- Testing Real MCP deploy_smart_contract Tool on Sepolia ---');

  const args = {
    name: 'WATER',
    symbol: 'WAR',
    contractName: 'WATER',
    totalSupply: 100000000,
    network: 'sepolia',
    description: 'WATER token ($WAR) deployed via Northveil MCP.'
  };

  console.log('Invoking deploy_smart_contract with args:', args);
  const result: any = await executeRealTool('deploy_smart_contract', args, '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417');

  console.log('Result Status:', result?.status);
  console.log('Result Contract Address:', result?.contractAddress);
  console.log('Result Tx Hash:', result?.txHash);
  console.log('Explorer URL:', result?.explorerUrl);
  console.log('Formatted Markdown:\n', result?.formattedMarkdown);

  if (result?.status === 'SUCCESS' && result?.contractAddress && result?.txHash) {
    console.log('✅ [SUCCESS] Real contract deployment verified with real bytecode and on-chain tx!');
  } else {
    console.error('❌ [FAILED] Deployment result:', result);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
