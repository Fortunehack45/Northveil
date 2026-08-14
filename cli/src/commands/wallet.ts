import { postApi, getConfig } from '../utils';

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
