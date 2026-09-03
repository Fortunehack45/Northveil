import { NorthveilClient } from '../sdk/src/client.js';

async function main() {
  const baseUrl = process.env.NORTHVEIL_API_URL || 'https://mcp.northveil.xyz';

  const nv = new NorthveilClient({
    baseUrl,
    clientKey: process.env.NORTHVEIL_API_KEY,
  });

  console.log(`Connecting to Northveil Control Plane at ${baseUrl}...`);
  const portfolio = await nv.getPortfolio();
  console.log('--- Portfolio Result ---');
  console.log(JSON.stringify(portfolio, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
