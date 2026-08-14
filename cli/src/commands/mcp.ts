import { getConfig } from '../utils';

export function registerMcpCommands(program: any) {
  program
    .command('mcp')
    .description('Generate Model Context Protocol (MCP) configuration for Claude Desktop and Cursor IDE')
    .option('--cursor', 'Generate Cursor MCP config')
    .option('--claude', 'Generate Claude Desktop config')
    .action((options: any) => {
      const cfg = getConfig();
      console.log(`\n🤖 NORTHVEIL MCP CONFIGURATION GENERATOR`);
      console.log(`Server Endpoint: ${cfg.baseUrl}/mcp\n`);

      if (options.cursor) {
        const cursor = {
          mcpServers: {
            northveil: {
              url: `${cfg.baseUrl}/sse?wallet_address=${cfg.walletAddress}`,
              headers: {
                Authorization: `Bearer ${cfg.apiKey}`,
                'x-wallet-address': cfg.walletAddress,
              },
            },
          },
        };
        console.log('Paste this in your `.cursor/mcp.json`:');
        console.log(JSON.stringify(cursor, null, 2));
      } else {
        const claude = {
          mcpServers: {
            'northveil-wallet': {
              command: 'npx',
              args: ['-y', '@northveil/cli', 'mcp-daemon'],
              env: {
                NORTHVEIL_API_KEY: cfg.apiKey,
                NORTHVEIL_WALLET_ADDRESS: cfg.walletAddress,
              },
            },
          },
        };
        console.log('Paste this in your `claude_desktop_config.json`:');
        console.log(JSON.stringify(claude, null, 2));
      }
      console.log('');
    });
}
