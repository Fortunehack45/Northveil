import fs from 'fs';

const content = fs.readFileSync('mcp-server/tools.ts', 'utf8');
fs.writeFileSync('api/tools.ts', content, 'utf8');
console.log('Synchronized api/tools.ts from mcp-server/tools.ts');
