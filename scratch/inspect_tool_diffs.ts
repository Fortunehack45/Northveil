import { MCP_TOOLS } from '../mcp-server/tools.js';
import fs from 'fs';

console.log('Tools in MCP_TOOLS:', MCP_TOOLS.map(t => t.name));

const indexCode = fs.readFileSync('mcp-server/index.ts', 'utf8');
const caseMatches = [...indexCode.matchAll(/case\s+'([^']+)'\s*:/g)].map(m => m[1]);
console.log('\nCases in executeRealTool / handlers:', caseMatches);

const toolSet = new Set(MCP_TOOLS.map(t => t.name));
const caseSet = new Set(caseMatches);

console.log('\nTools in MCP_TOOLS but NOT in case statement:');
MCP_TOOLS.forEach(t => {
  if (!caseSet.has(t.name)) {
    console.log(` - ${t.name}`);
  }
});

console.log('\nCases in index.ts but NOT in MCP_TOOLS:');
caseMatches.forEach(c => {
  if (!toolSet.has(c)) {
    console.log(` - ${c}`);
  }
});
