import fs from 'fs';

const lines = fs.readFileSync('mcp-server/mpcControlPlaneService.ts', 'utf8').split('\n');
lines.forEach((line, idx) => {
  if (line.trim().startsWith('export function') || line.trim().startsWith('export async function') || line.trim().startsWith('export const') || line.trim().startsWith('export let')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
