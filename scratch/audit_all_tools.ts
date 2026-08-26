import { MCP_TOOLS } from '../mcp-server/tools.js';

async function main() {
  console.log(`Auditing ${MCP_TOOLS.length} MCP tools...`);
  for (const tool of MCP_TOOLS) {
    console.log(`- ${tool.name}`);
  }
}

main().catch(console.error);
