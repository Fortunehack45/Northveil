import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';

const __filename_esm = fileURLToPath(import.meta.url);
const __dirname_esm = path.dirname(__filename_esm);

// Build in-memory index of all OpenZeppelin contracts
const ozIndex = new Map<string, string>();

function indexDir(dir: string, basePrefix = '') {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(basePrefix, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      indexDir(fullPath, relPath);
    } else if (entry.name.endsWith('.sol')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      ozIndex.set(relPath, content);
      ozIndex.set('@openzeppelin/contracts/' + relPath, content);
      ozIndex.set(entry.name, content);
    }
  }
}

// Find openzeppelin locations
const candidateBases = [
  path.resolve(__dirname_esm, '..', 'node_modules', '@openzeppelin', 'contracts'),
  path.resolve(__dirname_esm, '..', 'mcp-server', 'node_modules', '@openzeppelin', 'contracts'),
  path.resolve(process.cwd(), 'node_modules', '@openzeppelin', 'contracts'),
];

for (const base of candidateBases) {
  if (fs.existsSync(base)) {
    indexDir(base);
    break;
  }
}

console.log(`Indexed ${ozIndex.size} OpenZeppelin files/aliases.`);

function findImports(importPath: string) {
  const norm = importPath.replace(/\\/g, '/');
  if (ozIndex.has(norm)) {
    return { contents: ozIndex.get(norm)! };
  }
  const clean = norm.replace(/^@openzeppelin\/contracts\//, '').replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
  if (ozIndex.has(clean)) {
    return { contents: ozIndex.get(clean)! };
  }
  const baseName = path.basename(norm);
  if (ozIndex.has(baseName)) {
    return { contents: ozIndex.get(baseName)! };
  }
  return { error: 'File not found: ' + importPath };
}

const waterContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WATER is ERC20, ERC20Burnable, Ownable {
    uint256 public immutable maxSupply;

    constructor() ERC20("WATER", "WAR") Ownable(msg.sender) {
        maxSupply = 100000000 * 10**decimals();
        _mint(msg.sender, maxSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= maxSupply, "WATER: Exceeds max supply limit");
        _mint(to, amount);
    }
}`;

const input = {
  language: 'Solidity',
  sources: { 'Contract.sol': { content: waterContract } },
  settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  const errs = output.errors.filter((e: any) => e.severity === 'error');
  if (errs.length > 0) {
    console.error('Errors:', errs);
    process.exit(1);
  }
}

const contract = output.contracts?.['Contract.sol']?.['WATER'];
if (contract && contract.evm?.bytecode?.object) {
  console.log('SUCCESS! Compiled WATER token bytecode length:', contract.evm.bytecode.object.length);
} else {
  console.error('Failed to find compiled contract WATER');
  process.exit(1);
}
