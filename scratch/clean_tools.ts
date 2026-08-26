import fs from 'fs';

function cleanTools(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const endMarker = "name: 'deactivate_kill_switch'";
  const idx = content.indexOf(endMarker);
  if (idx === -1) {
    console.error(`Marker not found in ${filePath}`);
    return;
  }
  const closeBraceIdx = content.indexOf('  },', idx);
  if (closeBraceIdx === -1) {
    console.error(`Closing brace not found in ${filePath}`);
    return;
  }
  const cleaned = content.slice(0, closeBraceIdx + 4) + '\n];\n';
  fs.writeFileSync(filePath, cleaned, 'utf8');
  console.log(`Cleaned ${filePath}`);
}

cleanTools('mcp-server/tools.ts');
cleanTools('api/tools.ts');
