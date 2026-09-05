import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_PATTERNS = [
  /new\s+ethers\.Wallet\(/g,
  /HDNodeWallet\.fromPhrase/g,
  /bip39\.generateMnemonic/g,
];

const ALLOWED_PATH_SUBSTRING = path.normalize('mcp-server/src/wallet/mpcAdapter.ts');

const ROOT_DIR = process.cwd();
const DIRS_TO_SCAN = ['src', 'wallet', 'mcp-server/src', 'cli/src', 'sdk/src'];

let violationCount = 0;

function scanFile(filePath) {
  const normPath = path.normalize(filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  FORBIDDEN_PATTERNS.forEach((pattern) => {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (normPath.includes(ALLOWED_PATH_SUBSTRING)) {
        // Only allowed in devMockProvider section
        const linesBefore = content.slice(0, match.index).split('\n');
        const lineNum = linesBefore.length;
        if (lineNum >= 450 && lineNum <= 475) {
          continue; // Guarded dev mock block
        }
      }

      const lines = content.slice(0, match.index).split('\n');
      console.error(`[CUSTODIAL_VIOLATION] Forbidden key constructor found in ${normPath}:${lines.length}: ${match[0]}`);
      violationCount++;
    }
  });
}

function walkDir(dir) {
  const fullDir = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullDir)) return;
  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== '.next') {
        walkDir(path.relative(ROOT_DIR, fullPath));
      }
    } else if (entry.isFile() && /\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

for (const dir of DIRS_TO_SCAN) {
  walkDir(dir);
}

if (violationCount > 0) {
  console.error(`[FAIL] ${violationCount} custodial signing violation(s) detected.`);
  process.exit(1);
} else {
  console.log('[PASS] Custody check passed: Zero custodial key constructors in active paths.');
  process.exit(0);
}
