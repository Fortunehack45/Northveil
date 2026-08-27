import solc from 'solc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ozRoot = path.resolve(__dirname, '..', 'node_modules', '@openzeppelin', 'contracts');

function findImports(importPath: string) {
  console.log('solc requested import:', importPath);
  try {
    const candidates = [
      path.resolve(__dirname, '..', 'node_modules', importPath),
      path.resolve(ozRoot, importPath.replace(/^@openzeppelin\/contracts\//, '')),
      path.resolve(ozRoot, importPath),
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
        console.log('Found candidate at:', cand);
        return { contents: fs.readFileSync(cand, 'utf8') };
      }
    }
  } catch (e: any) {
    console.error('Error finding import:', e.message);
  }
  console.warn('NOT FOUND:', importPath);
  return { error: 'File not found: ' + importPath };
}

const solCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FIRE is ERC20, Ownable {
    constructor() ERC20("FIRE", "FIRE") Ownable(msg.sender) {
        _mint(msg.sender, 100000000 * 10**decimals());
    }
}
`;

const input = {
  language: 'Solidity',
  sources: { 'Contract.sol': { content: solCode } },
  settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
};

const compOutput = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
console.log('Errors:', compOutput.errors);
if (compOutput.contracts?.['Contract.sol']?.FIRE) {
  console.log('✅ Bytecode generated! Length:', compOutput.contracts['Contract.sol'].FIRE.evm.bytecode.object.length);
}
