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
    .command('tx:prepare')
    .description('Non-custodially stage an unsigned transaction for local client signing')
    .requiredOption('--to <address>', 'Recipient address')
    .requiredOption('--amount <amount>', 'Amount to transfer')
    .option('--asset <symbol>', 'Token asset symbol (ETH, USDC)', 'ETH')
    .option('--network <network>', 'Network (base, sepolia, ethereum)', 'base')
    .action(async (options: any) => {
      const cfg = getConfig();
      console.log(`\n⚙️ Staging non-custodial transaction for ${cfg.walletAddress || 'active wallet'}...`);
      try {
        const data = await postApi('/api/v1/transactions/prepare', {
          walletAddress: cfg.walletAddress,
          recipient: options.to,
          amount: parseFloat(options.amount),
          asset: options.asset,
          network: options.network,
        });

        console.log('✅ Transaction Staged Successfully!');
        console.log('-------------------------------------------------------------');
        console.log(`Request ID:      ${data.requestId}`);
        console.log(`Approval Token:  ${data.approvalToken}`);
        console.log(`Nonce:           ${data.nonce}`);
        console.log(`Chain ID:        ${data.chainId}`);
        console.log(`Expires At:      ${data.expiresAt}`);
        console.log('\nUnsigned Payload (Sign locally via client):');
        console.log(JSON.stringify(data.unsignedTransaction, null, 2));
        console.log('-------------------------------------------------------------');
      } catch (err: any) {
        console.error('\n❌ Stage Transaction Error:', err.message);
      }
    });

  program
    .command('tx:broadcast')
    .description('Verify recovered signature and broadcast signed raw transaction on-chain')
    .requiredOption('--token <approvalToken>', 'Approval token from tx:prepare')
    .requiredOption('--raw <signedHex>', 'Client-signed raw transaction hex string (0x...)')
    .action(async (options: any) => {
      console.log(`\n🚀 Broadcasting client-signed transaction on-chain...`);
      try {
        const data = await postApi('/api/v1/transactions/broadcast', {
          approvalToken: options.token,
          signedTransaction: options.raw,
        });

        console.log('✅ Transaction Broadcasted Successfully!');
        console.log('-------------------------------------------------------------');
        console.log(`Status:       ${data.status}`);
        console.log(`Tx Hash:      ${data.txHash}`);
        console.log(`Block Number: ${data.blockNumber}`);
        console.log(`Gas Used:     ${data.gasUsed}`);
        console.log(`Explorer:     ${data.explorerUrl}`);
        console.log('-------------------------------------------------------------');
      } catch (err: any) {
        console.error('\n❌ Broadcast Error:', err.message);
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

