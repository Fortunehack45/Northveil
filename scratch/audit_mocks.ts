import fs from 'fs';

const content = fs.readFileSync('mcp-server/index.ts', 'utf8');
const lines = content.split('\n');

console.log('Searching for potential mock or fake patterns in mcp-server/index.ts:');
lines.forEach((line, idx) => {
  if (line.includes('mock') || line.includes('fake') || line.includes('0x7da0c343e3e8a4c3f58d4c2be9b148946d51dcc92c47892b364b0564284cea1c') || line.includes('0x3885')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
