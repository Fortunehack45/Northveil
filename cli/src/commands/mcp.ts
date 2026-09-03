import readline from 'node:readline';
import { getConfig } from '../utils';

export function registerMcpCommands(program: any) {
  program
    .command('mcp')
    .description('Run Northveil MCP stdio proxy for Claude Desktop or view configuration snippets')
    .option('--cursor', 'Generate Cursor IDE MCP configuration')
    .option('--claude', 'Generate Claude Desktop configuration')
    .option('--windsurf', 'Generate Windsurf MCP configuration')
    .option('--http', 'Display streamable HTTP (POST /mcp) connection URL')
    .option('--sse', 'Display Server-Sent Events (GET /sse) connection URL')
    .action(async (options: any) => {
      const hasFlags = options.cursor || options.claude || options.windsurf || options.http || options.sse;
      if (!hasFlags) {
        const apiUrl = process.env.NORTHVEIL_API_URL || 'https://mcp.northveil.xyz';
        const apiKey = process.env.NORTHVEIL_API_KEY || '';

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          terminal: false,
        });

        rl.on('line', async (line) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          try {
            const res = await fetch(`${apiUrl}/mcp`, {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'X-API-Key': apiKey,
                'Authorization': `Bearer ${apiKey}`,
              },
              body: trimmed,
            });
            const data = await res.json();
            process.stdout.write(JSON.stringify(data) + '\n');
          } catch (err: any) {
            process.stdout.write(
              JSON.stringify({
                jsonrpc: '2.0',
                id: null,
                error: { code: -32603, message: err.message || 'Internal proxy error' },
              }) + '\n'
            );
          }
        });
        return;
      }

      // Interactive terminal mode: Print configuration snippets
      const cfg = getConfig();
      console.log(`\n🤖 NORTHVEIL MODEL CONTEXT PROTOCOL (MCP) CONFIG`);
      console.log(`HTTP Endpoint: ${cfg.baseUrl}/mcp`);
      console.log(`SSE Endpoint:  ${cfg.baseUrl}/sse\n`);

      if (options.cursor) {
        const cursor = {
          mcpServers: {
            northveil: {
              url: `${cfg.baseUrl}/mcp`,
              headers: {
                'X-API-Key': cfg.apiKey,
                Authorization: `Bearer ${cfg.apiKey}`,
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
                'X-API-Key': cfg.apiKey,
                Authorization: `Bearer ${cfg.apiKey}`,
              },
            },
          },
        };
        console.log('Paste this in `~/.codeium/windsurf/mcp_config.json`:');
        console.log(JSON.stringify(windsurf, null, 2));
      } else if (options.http) {
        console.log(`Streamable HTTP MCP JSON-RPC 2.0 URL:`);
        console.log(`curl -X POST ${cfg.baseUrl}/mcp -H "X-API-Key: ${cfg.apiKey}" -H "Content-Type: application/json"`);
      } else if (options.sse) {
        console.log(`Server-Sent Events (SSE) Stream URL:`);
        console.log(`${cfg.baseUrl}/sse?apiKey=${cfg.apiKey}`);
      } else {
        const claude = {
          mcpServers: {
            northveil: {
              command: 'npx',
              args: ['-y', 'northveil-cli', 'mcp'],
              env: {
                NORTHVEIL_API_KEY: cfg.apiKey || 'YOUR_NORTHVEIL_CLIENT_KEY',
                NORTHVEIL_API_URL: cfg.baseUrl || 'https://mcp.northveil.xyz',
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
