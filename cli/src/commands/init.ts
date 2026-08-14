import * as fs from 'fs';
import * as path from 'path';

export function registerInitCommand(program: any) {
  program
    .command('init [projectName]')
    .description('Scaffold a new Northveil Web3 dApp, AI Agent, or Smart Contract project')
    .option('-t, --template <template>', 'Template to use: dapp, mcp-agent, smart-contracts', 'dapp')
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
          dev: options.template === 'dapp' ? 'vite' : 'node index.js',
          build: 'tsc',
        },
        dependencies: {
          '@northveil/sdk': '^1.0.0',
          ethers: '^6.13.1',
        },
      };
      fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));

      // 2. .env.example
      const envExample = `NORTHVEIL_API_URL=https://mcp.northveil.xyz
NORTHVEIL_API_KEY=nv_live_your_api_key_here
NORTHVEIL_WALLET_ADDRESS=0xYourWalletAddressHere
`;
      fs.writeFileSync(path.join(targetDir, '.env.example'), envExample);

      // 3. index.ts / starter code
      const starterCode = `import { NorthveilClient } from '@northveil/sdk';

const client = new NorthveilClient({
  baseUrl: process.env.NORTHVEIL_API_URL || 'https://mcp.northveil.xyz',
  apiKey: process.env.NORTHVEIL_API_KEY || 'nv_live_demo',
});

async function main() {
  console.log('🚀 Northveil Project Initialized!');
  
  // Example 1: Search live flights
  const flights = await client.searchFlights({
    origin: 'LHR',
    destination: 'JFK',
    departureDate: '2026-09-20',
  });
  console.log('Found Flights:', flights.offers?.length);

  // Example 2: Check multi-chain portfolio
  const portfolio = await client.getPortfolio();
  console.log('Total Portfolio Value ($):', portfolio.totalUsdValue);
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
