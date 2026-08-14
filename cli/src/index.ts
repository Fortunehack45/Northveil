import { Command } from 'commander';
import { printBanner } from './utils';
import { registerInitCommand } from './commands/init';
import { registerTravelCommands } from './commands/travel';
import { registerWalletCommands } from './commands/wallet';
import { registerContractCommands } from './commands/contracts';
import { registerAuditCommand } from './commands/audit';
import { registerWebhookCommands } from './commands/webhooks';
import { registerMcpCommands } from './commands/mcp';
import { loginCommand, whoamiCommand, logoutCommand } from './commands/auth';

const program = new Command();

printBanner();

program
  .name('northveil')
  .description('Official Northveil CLI for Web3 development, travel booking, smart contracts & MCP AI tools')
  .version('1.0.0');

// Authentication & Identity Commands
program
  .command('login')
  .description('Authenticate CLI with your Northveil API Key to access private wallets and data')
  .option('-k, --key <apiKey>', 'Northveil API key (nv_live_...)')
  .option('-u, --url <apiUrl>', 'Custom API Gateway URL')
  .action(loginCommand);

program
  .command('whoami')
  .description('Display current authenticated developer account, bound wallets, and permission tier')
  .action(whoamiCommand);

program
  .command('logout')
  .description('Clear saved local authentication credentials')
  .action(logoutCommand);

// Register all modular commands
registerInitCommand(program);
registerTravelCommands(program);
registerWalletCommands(program);
registerContractCommands(program);
registerAuditCommand(program);
registerWebhookCommands(program);
registerMcpCommands(program);

program.parse(process.argv);
