import { getConfig } from '../utils';

export function registerMcpCommands(program: any) {
  program
    .command('mcp')
    .description('Generate Model Context Protocol (MCP) configuration for Claude Desktop, Cursor IDE, Windsurf, and Claude Code')
    .option('--cursor', 'Generate Cursor IDE MCP configuration')
    .option('--claude', 'Generate Claude Desktop configuration')
    .option('--windsurf', 'Generate Windsurf MCP configuration')
    .option('--http', 'Display streamable HTTP (POST /mcp) connection URL')
    .option('--sse', 'Display Server-Sent Events (GET /sse) connection URL')
    .action((options: any) => {
      const cfg = getConfig();
      console.log(`\n🤖 NORTHVEIL MODEL CONTEXT PROTOCOL (MCP) CONFIG`);
      console.log(`HTTP Endpoint: ${cfg.baseUrl}/mcp`);
      console.log(`SSE Endpoint:  ${cfg.baseUrl}/sse?wallet_address=${cfg.walletAddress || '0x...'}\n`);

      if (options.cursor) {
        const cursor = {
          mcpServers: {
            northveil: {
              url: `${cfg.baseUrl}/mcp`,
              headers: {
                Authorization: `Bearer ${cfg.apiKey}`,
                'x-wallet-address': cfg.walletAddress || '0x...',
              },
            },
          },
        };
        console.log('Paste this in your `.cursor/mcp.json`:');
        console.log(JSON.stringify(cursor, null, 2));
      } else if (options.windsurf) {
        const windsurf = {
          mcpServers: {
            northveil: {
              url: `${cfg.baseUrl}/mcp`,
              headers: {
                Authorization: `Bearer ${cfg.apiKey}`,
                'x-wallet-address': cfg.walletAddress || '0x...',
              },
            },
          },
        };
        console.log('Paste this in `~/.codeium/windsurf/mcp_config.json`:');
        console.log(JSON.stringify(windsurf, null, 2));
      } else if (options.http) {
        console.log(`Streamable HTTP MCP JSON-RPC 2.0 URL:`);
        console.log(`curl -X POST ${cfg.baseUrl}/mcp -H "Authorization: Bearer ${cfg.apiKey}" -H "Content-Type: application/json"`);
      } else if (options.sse) {
        console.log(`Server-Sent Events (SSE) Stream URL:`);
        console.log(`${cfg.baseUrl}/sse?wallet_address=${cfg.walletAddress || '0x...'}`);
      } else {
        const claude = {
          mcpServers: {
            'northveil-wallet': {
              command: 'npx',
              args: ['-y', '@northveil/cli', 'mcp'],
              env: {
                NORTHVEIL_API_KEY: cfg.apiKey,
                NORTHVEIL_WALLET_ADDRESS: cfg.walletAddress,
                NORTHVEIL_API_URL: cfg.baseUrl,
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

