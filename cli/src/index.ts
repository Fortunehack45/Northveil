import { Command } from 'commander';
import { printBanner } from './utils';
import { registerInitCommand } from './commands/init';
import { registerTravelCommands } from './commands/travel';
import { registerWalletCommands } from './commands/wallet';
import { registerContractCommands } from './commands/contracts';
import { registerAuditCommand } from './commands/audit';
import { registerWebhookCommands } from './commands/webhooks';
import { registerMcpCommands } from './commands/mcp';

const program = new Command();

printBanner();

program
  .name('northveil')
  .description('Official Northveil CLI for Web3 development, travel booking, smart contracts & MCP AI tools')
  .version('1.0.0');

// Register all modular commands
registerInitCommand(program);
registerTravelCommands(program);
registerWalletCommands(program);
registerContractCommands(program);
registerAuditCommand(program);
registerWebhookCommands(program);
registerMcpCommands(program);

program.parse(process.argv);
