import 'dotenv/config';
import { executeRealTool } from '../mcp-server/index.js';

async function main() {
  console.log('--- Testing Real MCP send_transfer Tool on Sepolia ---');

  const args = {
    recipientAddress: '0x2de14bb9264acd0346e122c4bb2f0614f79a1670',
    amount: '0.0001',
    token: 'ETH',
    network: 'sepolia'
  };

  console.log('Invoking send_transfer with args:', args);
  const result: any = await executeRealTool('send_transfer', args, '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417');

  console.log('Result Status:', result?.status);
  console.log('Result Tx Hash:', result?.txHash);
  console.log('Explorer URL:', result?.explorerUrl);
  console.log('Block Number:', result?.blockNumber);
  console.log('Gas Used:', result?.gasUsed);
  console.log('Formatted Markdown:\n', result?.formattedMarkdown);

  if (result?.txHash && result.txHash.startsWith('0x') && result.txHash.length === 66 && result?.blockNumber) {
    console.log('✅ [SUCCESS] Real on-chain transfer verified with real block number and hash!');
  } else {
    console.error('❌ [FAILED] Transfer result:', result);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
