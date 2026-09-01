import { Command } from 'commander';
import { printBanner, getApi } from './utils';
import { registerInitCommand } from './commands/init';
import { registerTradeCommands } from './commands/trade';
import { registerWalletCommands } from './commands/wallet';
import { registerContractCommands } from './commands/contracts';
import { registerAuditCommand } from './commands/audit';
import { registerWebhookCommands } from './commands/webhooks';
import { registerMcpCommands } from './commands/mcp';
import { registerTravelCommands } from './commands/travel';
import { loginCommand, whoamiCommand, logoutCommand } from './commands/auth';

const program = new Command();

printBanner();

program
  .name('northveil')
  .description('Official Northveil CLI for Web3 development, smart contracts & MCP AI tools')
  .version('1.2.1');

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

program
  .command('server-health')
  .description('Verify live Northveil API Gateway and Supabase Database connectivity')
  .action(async () => {
    console.log('\n🩺 Checking Northveil API Gateway & Database health...');
    try {
      const data = await getApi('/health');
      console.log('✅ Gateway Status:  ', data.status?.toUpperCase());
      console.log('📦 Service:         ', data.service || 'northveil-api');
      console.log('🗄️  Supabase DB:     ', data.supabase?.connected ? 'CONNECTED (Healthy)' : 'DEGRADED (' + (data.supabase?.error || 'Unavailable') + ')');
      console.log('⏱️  Server Time:     ', data.timestamp);
    } catch (e: any) {
      console.error('❌ Health Check Failed:', e.message);
    }
  });

// Register all modular commands
registerInitCommand(program);
registerTradeCommands(program);
registerWalletCommands(program);
registerContractCommands(program);
registerAuditCommand(program);
registerWebhookCommands(program);
registerMcpCommands(program);
registerTravelCommands(program);

program.parse(process.argv);
