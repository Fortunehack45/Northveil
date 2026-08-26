import fs from 'fs';

const lines = fs.readFileSync('mcp-server/index.ts', 'utf8').split('\n');
lines.forEach((line, idx) => {
  if (line.trim().startsWith("case '") || line.trim().startsWith('case "')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
