import fs from 'fs';
import { MCP_TOOLS } from '../mcp-server/tools.js';

const indexContent = fs.readFileSync('mcp-server/index.ts', 'utf8');

const missingHandlers: string[] = [];

for (const tool of MCP_TOOLS) {
  const casePattern = new RegExp(`case ['"\`]${tool.name}['"\`]`, 'i');
  if (!casePattern.test(indexContent)) {
    missingHandlers.push(tool.name);
  }
}

console.log(`Total Tools: ${MCP_TOOLS.length}`);
console.log(`Missing Handlers (${missingHandlers.length}):`, missingHandlers);
