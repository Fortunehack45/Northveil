import fs from 'fs';
import path from 'path';
import solc from 'solc';

function findImports(importPath) {
  try {
    if (importPath.startsWith('@openzeppelin/')) {
      const fullPath = path.resolve('node_modules', importPath);
      if (fs.existsSync(fullPath)) {
        return { contents: fs.readFileSync(fullPath, 'utf8') };
      }
    }
  } catch (e) {
    console.error('findImports error:', e);
  }
  return { error: 'File not found: ' + importPath };
}

const solCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract FortuneToken is ERC20, ERC20Burnable {
    constructor() ERC20("FortuneToken", "FTN") {
        _mint(msg.sender, 100000000 * 10**decimals());
    }
}`;

const input = {
  language: 'Solidity',
  sources: { 'Contract.sol': { content: solCode } },
  settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
};

console.log('Compiling with OpenZeppelin import callback...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors && output.errors.some(e => e.severity === 'error')) {
  console.error('Compilation ERRORS:', output.errors.filter(e => e.severity === 'error').map(e => e.formattedMessage).join('\n'));
} else {
  const contract = output.contracts['Contract.sol']['FortuneToken'];
  console.log('COMPILATION SUCCESSFUL!');
  console.log('Bytecode length:', contract.evm.bytecode.object.length);
  console.log('ABI methods:', contract.abi.length);
}
