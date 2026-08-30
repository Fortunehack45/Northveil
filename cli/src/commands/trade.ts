import { postApi, getConfig } from '../utils';

export function registerTradeCommands(program: any) {
  // 1. REAL-TIME PRICES
  program
    .command('prices [symbols...]')
    .description('Fetch live real-time token prices and 24h market metrics')
    .option('-c, --chain <chain>', 'Blockchain network (ethereum, base, solana, polygon, arbitrum, bsc)', 'ethereum')
    .action(async (symbols: string[], options: any) => {
      const targetSymbols = symbols.length > 0 ? symbols : ['ETH', 'BTC', 'SOL', 'USDC'];
      console.log(`\n📈 Fetching real-time market prices for [${targetSymbols.join(', ')}] on ${options.chain}...`);
      try {
        const data = await postApi('/api/v1/tools/get_realtime_prices', {
          symbols: targetSymbols.join(','),
          chain: options.chain,
        });

        console.log('\n📊 Real-Time Market Prices');
        console.log('-------------------------------------------------------------');
        if (data.prices && data.prices.length > 0) {
          data.prices.forEach((p: any) => {
            const change = p.change24h ? ` (${p.change24h >= 0 ? '+' : ''}${p.change24h.toFixed(2)}%)` : '';
            console.log(`• ${p.symbol.padEnd(8)}: $${p.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}${change} [${p.source || 'Aggregated'}]`);
          });
        } else {
          console.log('No price data returned.');
        }
        console.log('-------------------------------------------------------------');
      } catch (err: any) {
        console.error('\n❌ Price Fetch Error:', err.message);
      }
    });

  // 2. TRENDING MEMECOINS
  program
    .command('memecoins')
    .description('Discover trending high-volume meme coins with automated safety and honeypot audit scores')
    .option('-c, --chain <chain>', 'Chain (all, solana, base, ethereum)', 'all')
    .option('-l, --limit <number>', 'Number of tokens to display', '10')
    .action(async (options: any) => {
      console.log(`\n🚀 Discovering trending meme coins on ${options.chain} (limit: ${options.limit})...`);
      try {
        const data = await postApi('/api/v1/tools/get_trending_memecoins', {
          chain: options.chain,
          limit: parseInt(options.limit, 10),
        });

        console.log('\n🔥 Trending Memecoins Intelligence');
        console.log('-------------------------------------------------------------');
        if (data.tokens && data.tokens.length > 0) {
          data.tokens.forEach((t: any, i: number) => {
            const score = t.audit?.score !== undefined ? ` | Safety: ${t.audit.score}/100 [${t.audit.verdict || 'OK'}]` : '';
            console.log(`[${i + 1}] ${t.name} (${t.symbol})`);
            console.log(`    Price:    $${t.priceUsd} | 24h Vol: $${(t.volume24h || 0).toLocaleString()} | Chain: ${t.chain}${score}`);
            console.log(`    Address:  ${t.contractAddress}`);
            console.log('    ---------------------------------------------------------');
          });
        } else {
          console.log('No trending tokens found.');
        }
      } catch (err: any) {
        console.error('\n❌ Memecoin Intelligence Error:', err.message);
      }
    });

  // 3. TOKEN AUDIT
  program
    .command('audit-token <contractAddress>')
    .description('Deep security analysis of a token contract (honeypot, taxes, hidden owners, mintability)')
    .option('-c, --chain <chain>', 'Chain (ethereum, base, bsc, polygon, solana)', 'ethereum')
    .action(async (contractAddress: string, options: any) => {
      console.log(`\n🛡️  Auditing token contract ${contractAddress} on ${options.chain}...`);
      try {
        const data = await postApi('/api/v1/tools/audit_token', {
          contractAddress,
          chain: options.chain,
        });

        console.log(`\n📊 TOKEN AUDIT SCORE: ${data.score}/100 [${data.verdict}]`);
        console.log('-------------------------------------------------------------');
        console.log(`• Honeypot Detected:    ${data.isHoneypot ? '🚨 YES (DANGER)' : '✅ NO'}`);
        console.log(`• Buy Tax / Sell Tax:   ${data.buyTax ?? 0}% / ${data.sellTax ?? 0}%`);
        console.log(`• Mintable:             ${data.isMintable ? '⚠️ Yes' : '✅ No'}`);
        console.log(`• Hidden Owner:         ${data.hiddenOwner ? '🚨 Yes' : '✅ No'}`);
        console.log(`• Open Source Verified: ${data.isOpenSource ? '✅ Yes' : '⚠️ No'}`);
        console.log('-------------------------------------------------------------');
      } catch (err: any) {
        console.error('\n❌ Token Audit Error:', err.message);
      }
    });

  // 4. SEND TRANSFER
  program
    .command('send')
    .description('Prepare and stage a multi-chain native or token transfer')
    .requiredOption('-t, --to <address>', 'Recipient EVM or Solana address')
    .requiredOption('-a, --amount <amount>', 'Amount to transfer')
    .option('--token <symbol>', 'Token symbol (ETH, SOL, USDC, etc.)', 'ETH')
    .option('--network <network>', 'Network (sepolia, base, ethereum, polygon, solana)', 'sepolia')
    .action(async (options: any) => {
      const cfg = getConfig();
      console.log(`\n💸 Staging ${options.amount} ${options.token} transfer to ${options.to} on ${options.network}...`);
      try {
        const data = await postApi('/api/v1/tools/send_transfer', {
          recipient: options.to,
          amount: parseFloat(options.amount),
          token: options.token,
          network: options.network,
          walletAddress: cfg.walletAddress,
        });

        console.log('\n✅ Transfer Staged Successfully!');
        console.log('-------------------------------------------------------------');
        console.log(`Request ID:      ${data.requestId}`);
        console.log(`Approval Token:  ${data.approvalToken}`);
        console.log(`Sender Vault:    ${data.walletAddress}`);
        console.log(`Recipient:       ${data.recipient}`);
        console.log(`Amount:          ${data.amount} ${data.token || data.asset}`);
        console.log(`Network:         ${data.network} (Chain ID: ${data.chainId})`);
        console.log(`Status:          ${data.status}`);
        console.log(`Expires At:      ${data.expiresAt}`);
        console.log('-------------------------------------------------------------');
        console.log('👉 To sign and broadcast, use:');
        console.log(`   northveil tx:broadcast --token ${data.approvalToken} --raw <signedHex>\n`);
      } catch (err: any) {
        console.error('\n❌ Send Transfer Error:', err.message);
      }
    });

  // 5. DEX SWAP
  program
    .command('swap')
    .description('Execute or prepare a multi-chain DEX swap via 1inch/Uniswap')
    .requiredOption('--from <token>', 'Source token symbol (e.g. ETH, USDC)')
    .requiredOption('--to <token>', 'Destination token symbol (e.g. USDC, DAI)')
    .requiredOption('--amount <amount>', 'Amount to swap')
    .option('--slippage <percent>', 'Slippage percentage', '0.5')
    .option('--network <network>', 'Network (base, ethereum, arbitrum, polygon)', 'base')
    .action(async (options: any) => {
      console.log(`\n🔄 Routing optimal DEX swap: ${options.amount} ${options.from} -> ${options.to} on ${options.network}...`);
      try {
        const data = await postApi('/api/v1/tools/execute_swap', {
          fromToken: options.from,
          toToken: options.to,
          amount: options.amount,
          slippagePercent: parseFloat(options.slippage),
          chain: options.network,
        });

        console.log('\n✅ SWAP ROUTE PREPARED');
        console.log('-------------------------------------------------------------');
        console.log(`Output Estimated: ${data.estimatedOutput || data.amountOut} ${options.to}`);
        console.log(`Route Protocol:   ${data.protocol || 'DEX Aggregator'}`);
        if (data.txHash) console.log(`Tx Hash:          ${data.txHash}`);
        if (data.approvalToken) console.log(`Approval Token:   ${data.approvalToken}`);
        console.log('-------------------------------------------------------------');
      } catch (err: any) {
        console.error('\n❌ Swap Error:', err.message);
      }
    });
}
