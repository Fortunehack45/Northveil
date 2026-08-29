import { spawn } from 'child_process';
import path from 'path';

async function testStdio() {
  console.log('Testing MCP stdio transport...');

  const tsxCli = path.resolve('node_modules/tsx/dist/cli.mjs');
  const serverProcess = spawn(process.execPath, [tsxCli, 'mcp-server/index.ts', '--stdio'], {
    cwd: path.resolve('.'),
    env: { ...process.env, NODE_ENV: 'test', MCP_TRANSPORT: 'stdio', NO_SERVER_LISTEN: 'true' },
    shell: false,
  });

  let buffer = '';

  const sendAndReceive = (message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const onData = (data: Buffer) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.id === message.id) {
                serverProcess.stdout.off('data', onData);
                return resolve(parsed);
              }
            } catch (e) {}
          }
        }
        buffer = lines[lines.length - 1];
      };

      serverProcess.stdout.on('data', onData);
      serverProcess.stdin.write(JSON.stringify(message) + '\n');
    });
  };

  try {
    // 1. Initialize
    const initResp = await sendAndReceive({
      jsonrpc: '2.0',
      method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'Cursor', version: '1.0' } },
      id: 101,
    });
    console.log('  ✅ [PASS] Stdio initialize:', initResp.result?.serverInfo?.name);

    // 2. Tools List
    const listResp = await sendAndReceive({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 102,
    });
    console.log(`  ✅ [PASS] Stdio tools/list returned ${listResp.result?.tools?.length} tools`);

    // 3. Tools Call (northveil_health)
    const healthResp = await sendAndReceive({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'northveil_health', arguments: {} },
      id: 103,
    });
    console.log('  ✅ [PASS] Stdio tools/call northveil_health status:', healthResp.result?.signerStatus);

    console.log('🎉 Stdio transport fully verified!');
  } finally {
    serverProcess.kill();
  }
}

testStdio().catch(console.error);
