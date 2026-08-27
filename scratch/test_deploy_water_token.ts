import 'dotenv/config';
import { ethers } from 'ethers';
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

async function main() {
  const rpcUrl = 'https://1rpc.io/sepolia';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const wallet1 = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const wallet2 = '0x2de14bb9264acd0346e122c4bb2f0614f79a1670';

  const bal1 = await provider.getBalance(wallet1);
  const bal2 = await provider.getBalance(wallet2);

  console.log(`Balance of wallet1 (${wallet1}):`, ethers.formatEther(bal1), 'ETH');
  console.log(`Balance of wallet2 (${wallet2}):`, ethers.formatEther(bal2), 'ETH');

  // Test compilation of WATER token contract
  const nameStr = 'WATER';
  const symbolStr = 'WAR';
  const totalSupplyNum = 100000000;
  const ownerAllocNum = 100000000;

  const solCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WATER is ERC20, ERC20Burnable, Ownable {
    uint256 public immutable maxSupply;

    constructor() ERC20("${nameStr}", "${symbolStr}") Ownable(msg.sender) {
        maxSupply = ${totalSupplyNum} * 10**decimals();
        _mint(msg.sender, ${ownerAllocNum} * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= maxSupply, "WATER: Exceeds max supply limit");
        _mint(to, amount);
    }
}`;

  console.log('Compiling WATER contract with solc...');
  const input = {
    language: 'Solidity',
    sources: { 'Contract.sol': { content: solCode } },
    settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
  };

  const compOutput = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  if (compOutput.errors) {
    const errs = compOutput.errors.filter((e: any) => e.severity === 'error');
    if (errs.length > 0) {
      console.error('Compilation failed:', errs);
      process.exit(1);
    }
  }

  const contractRes = compOutput.contracts?.['Contract.sol']?.['WATER'];
  if (!contractRes || !contractRes.evm?.bytecode?.object) {
    console.error('No bytecode generated');
    process.exit(1);
  }

  const bytecode = '0x' + contractRes.evm.bytecode.object;
  const abi = contractRes.abi;
  console.log('Successfully compiled WATER token! Bytecode length:', bytecode.length);

  // Deploy using the configured private key if available in env
  const privKey = process.env.ETH_PRIVATE_KEY || process.env.TESTNET_PRIVATE_KEY || '';
  if (privKey) {
    const signer = new ethers.Wallet(privKey, provider);
    console.log('Deploying from signer address:', signer.address);

    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const deployTx = await factory.deploy({ gasLimit: 2500000 });
    console.log('Broadcasted deployment tx:', deployTx.deploymentTransaction()?.hash);
    await deployTx.waitForDeployment();
    const contractAddress = await deployTx.getAddress();
    console.log('CONFIRMED ON-CHAIN! WATER Contract Address:', contractAddress);
  } else {
    console.log('No ETH_PRIVATE_KEY in env, compilation verified 100% successfully.');
  }
}

main().catch(err => {
  console.error('Error in main:', err);
  process.exit(1);
});
