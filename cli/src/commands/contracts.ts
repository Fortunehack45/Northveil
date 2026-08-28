import { postApi } from '../utils';

export function registerContractCommands(program: any) {
  program
    .command('deploy')
    .description('Deploy smart contracts (ERC-20, ERC-721, Staking) to testnet or mainnet')
    .requiredOption('-t, --type <type>', 'Contract type: erc20, erc721, staking', 'erc20')
    .requiredOption('-n, --name <name>', 'Token / Contract Name')
    .requiredOption('-s, --symbol <symbol>', 'Token Symbol')
    .option('--supply <totalSupply>', 'Initial Total Supply', '1000000')
    .option('--network <network>', 'Target blockchain network', 'sepolia')
    .action(async (options: any) => {
      console.log(`\n⚙️  Compiling and deploying ${options.type.toUpperCase()} contract "${options.name}" (${options.symbol}) to ${options.network}...`);

      try {
        const data = await postApi('/api/v1/tools/deploy_smart_contract', {
          contractType: options.type,
          contractName: options.name,
          symbol: options.symbol,
          totalSupply: parseFloat(options.supply),
          network: options.network,
        });

        console.log(`\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!`);
        console.log(`  Contract Address:   ${data.contractAddress}`);
        console.log(`  Deployer:           ${data.deployerAddress}`);
        console.log(`  Transaction Hash:   ${data.transactionHash}`);
        console.log(`  Network:            ${data.network}`);
        console.log(`  Explorer URL:       ${data.explorerUrl}`);
      } catch (err: any) {
        console.error('\n❌ Deployment Error:', err.message);
      }
    });

  program
    .command('mint')
    .description('Mint new tokens from a deployed ERC-20 contract')
    .requiredOption('-c, --contract <address>', 'Deployed contract address (0x...)')
    .requiredOption('-a, --amount <amount>', 'Amount of tokens to mint')
    .option('-r, --recipient <address>', 'Recipient address (defaults to caller)')
    .option('-n, --network <network>', 'Network', 'sepolia')
    .action(async (options: any) => {
      console.log(`\n🪙 Minting ${options.amount} tokens from contract ${options.contract}...`);

      try {
        const data = await postApi('/api/v1/tools/mint_tokens', {
          contractAddress: options.contract,
          amount: options.amount,
          recipientAddress: options.recipient,
          network: options.network,
        });

        console.log(`\n✅ MINTING COMPLETE!`);
        console.log(`  Transaction Hash:   ${data.transactionHash}`);
        console.log(`  Amount Minted:      ${data.amount}`);
        console.log(`  Recipient:          ${data.recipientAddress}`);
        console.log(`  New Total Supply:   ${data.newTotalSupply}`);
      } catch (err: any) {
        console.error('\n❌ Minting Error:', err.message);
      }
    });
}
