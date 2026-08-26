import { MCP_TOOLS } from '../mcp-server/tools.js';

console.log(`Total MCP Tools: ${MCP_TOOLS.length}`);
MCP_TOOLS.forEach((t, i) => {
  console.log(`${i + 1}. ${t.name}: ${t.description.slice(0, 70)}...`);
});
