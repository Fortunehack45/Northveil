import { postApi, getConfig, mcpJsonRpc } from '../utils';

export function registerWalletCommands(program: any) {
  program
    .command('wallet [address]')
    .description('Inspect multi-chain portfolio balances, token assets, and USD valuations')
    .action(async (address?: string) => {
      const targetAddress = address || getConfig().walletAddress;
      console.log(`\n💼 Fetching multi-chain portfolio for: ${targetAddress}...`);

      try {
        const data = await postApi('/api/v1/tools/get_portfolio', {
          walletAddress: targetAddress,
        });

        console.log(`\n📊 Portfolio Summary (Total: $${data.totalUsdValue || '0.00'} USD)`);
        console.log('-------------------------------------------------------------');
        if (data.tokens && data.tokens.length > 0) {
          data.tokens.forEach((t: any) => {
            console.log(`• ${t.symbol.padEnd(8)}: ${t.balance.padEnd(12)} ($${t.valueUsd} USD) [${t.network}]`);
          });
        } else {
          console.log('No token balances detected on indexed networks.');
        }

        console.log('-------------------------------------------------------------');
      } catch (err: any) {
        console.error('\n❌ Wallet Portfolio Error:', err.message);
      }
    });

  program
    .command('register-wallet <address>')
    .description('Register a non-custodial public wallet address')
    .option('--name <name>', 'Custom label for the wallet')
    .option('--chain <chainId>', 'Chain ID (e.g. 8453, 11155111)', '8453')
    .action(async (address: string, options: any) => {
      console.log(`\n📝 Registering public wallet: ${address}...`);
      try {
        const data = await postApi('/api/v1/wallets/register', {
          address,
          walletName: options.name || 'CLI Wallet',
          chainId: options.chain,
        });
        console.log('✅ Wallet Registered Successfully!');
        console.log(`Address:       ${data.address}`);
        console.log(`MPC Wallet ID: ${data.mpcWalletId}`);
      } catch (err: any) {
        console.error('\n❌ Registration Error:', err.message);
      }
    });

  program
    .command('tools')
    .description('List available MCP AI tools from the Northveil Control Plane')
    .action(async () => {
      console.log('\n🛠️  Fetching available MCP tools from Northveil...');
      try {
        const result = await mcpJsonRpc('tools/list');
        const tools = result?.tools || [];
        console.log(`\nFound ${tools.length} available tools:`);
        console.log('-------------------------------------------------------------');
        for (const t of tools) {
          console.log(`• ${t.name.padEnd(26)} : ${t.description?.slice(0, 70)}...`);
        }
        console.log('-------------------------------------------------------------');
        console.log('Usage: northveil call <tool_name> \'{"key":"value"}\'\n');
      } catch (err: any) {
        console.error('\n❌ Failed to list tools:', err.message);
      }
    });

  program
    .command('call <tool> [jsonArgs]')
    .description('Execute an MCP tool via JSON-RPC 2.0 with authenticated agent credentials')
    .action(async (tool: string, jsonArgs?: string) => {
      let argsObj: any = {};
      if (jsonArgs) {
        try {
          argsObj = JSON.parse(jsonArgs);
        } catch (e: any) {
          console.error('\n❌ Invalid JSON arguments:', e.message);
          return;
        }
      }
      console.log(`\n⚡ Invoking MCP tool "${tool}"...`);
      try {
        const result = await mcpJsonRpc('tools/call', {
          name: tool,
          arguments: argsObj,
        });
        console.log('✅ Result:');
        console.log(JSON.stringify(result, null, 2));
      } catch (err: any) {
        console.error(`\n❌ Failed to execute tool "${tool}":`, err.message);
      }
    });

  program
    .command('health [address]')
    .description('Run automated health, gas sufficiency, and diversification audit on a wallet')
    .action(async (address?: string) => {
      const targetAddress = address || getConfig().walletAddress;
      console.log(`\n🩺 Auditing wallet health score for: ${targetAddress}...`);

      try {
        const data = await postApi('/api/v1/tools/check_wallet_health', {
          walletAddress: targetAddress,
        });

        console.log(`\n🛡️  HEALTH SCORE: ${data.healthScore}/100 [${data.status}]`);
        console.log(`  Diversification:    ${data.diversificationScore}/100`);
        console.log(`  Gas Sufficiency:    ${data.gasHealth}`);
        console.log(`  Dust Tokens:        ${data.dustCount}`);
        if (data.recommendations && data.recommendations.length > 0) {
          console.log('\nRecommendations:');
          data.recommendations.forEach((r: string) => console.log(`  - ${r}`));
        }
      } catch (err: any) {
        console.error('\n❌ Health Audit Error:', err.message);
      }
    });
}

