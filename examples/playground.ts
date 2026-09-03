import { NorthveilClient } from '../sdk/src/client.js';

async function main() {
  const apiUrl = process.env.NORTHVEIL_API_URL || 'https://mcp.northveil.xyz';
  const clientKey = process.env.NORTHVEIL_API_KEY;

  if (!clientKey) {
    throw new Error('MISSING_CLIENT_KEY: Set NORTHVEIL_API_KEY in your environment to run playground.');
  }

  const nv = new NorthveilClient({
    apiUrl,
    clientKey,
  });

  console.log(`Connecting to Northveil Control Plane at ${apiUrl}...`);
  const portfolio = await nv.callTool('nv_get_portfolio', {});
  console.log('--- Portfolio Result ---');
  console.log(JSON.stringify(portfolio, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
