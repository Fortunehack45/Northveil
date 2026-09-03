import * as fs from 'fs';
import * as path from 'path';

export function registerInitCommand(program: any) {
  program
    .command('init [projectName]')
    .description('Scaffold a new Northveil Agent Wallet & MCP integration project')
    .option('-t, --template <template>', 'Template to use: dapp, mcp-agent', 'mcp-agent')
    .action((projectName = 'my-northveil-app', options: any) => {
      const targetDir = path.resolve(process.cwd(), projectName);
      console.log(`\n📦 Scaffolding new Northveil project: ${projectName} (Template: ${options.template})...`);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // 1. package.json
      const pkg = {
        name: projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          start: 'node index.js',
          build: 'tsc',
        },
        dependencies: {
          'northveil-sdk': '^1.1.0',
        },
      };
      fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));

      // 2. .env.example
      const envExample = `NORTHVEIL_API_URL=https://mcp.northveil.xyz
NORTHVEIL_API_KEY=YOUR_NORTHVEIL_CLIENT_KEY
NORTHVEIL_WALLET_ADDRESS=0xYOUR_WALLET_ADDRESS
`;
      fs.writeFileSync(path.join(targetDir, '.env.example'), envExample);

      // 3. index.ts / starter code
      const starterCode = `import { NorthveilClient } from 'northveil-sdk';

const client = new NorthveilClient({
  apiUrl: process.env.NORTHVEIL_API_URL || 'https://mcp.northveil.xyz',
  clientKey: process.env.NORTHVEIL_API_KEY || 'YOUR_NORTHVEIL_CLIENT_KEY',
});

async function main() {
  console.log('🚀 Northveil Project Initialized!');
  
  // 1. Check multi-chain portfolio
  const portfolio = await client.getPortfolio();
  console.log('Portfolio Summary:', portfolio.markdownSummary);

  // 2. Stage non-custodial transfer (Always Ask generates passkey ticket)
  const transfer = await client.prepareTransfer({
    to: '0xYOUR_WALLET_ADDRESS',
    amount: '0.01',
    chain: 'eip155:8453',
    asset: 'ETH',
  });
  console.log('Transfer Status:', transfer.status);
  if (transfer.approveUrl) {
    console.log('Passkey Approval Required:', transfer.approveUrl);
  }
}

main().catch(console.error);
`;
      fs.writeFileSync(path.join(targetDir, 'index.ts'), starterCode);

      console.log(`✅ Project scaffolded successfully at: ${targetDir}`);
      console.log(`\nNext Steps:`);
      console.log(`  1. cd ${projectName}`);
      console.log(`  2. npm install`);
      console.log(`  3. npx tsx index.ts\n`);
    });
}
