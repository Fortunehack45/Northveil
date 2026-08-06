import { ethers } from 'ethers';
import solc from 'solc';
import fs from 'fs';
import path from 'path';

const sepoliaProvider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
const pk = '0xfe01b8b0c9334a6f5386690ecc6f238b5e53f7b8a04914e618fdacac2217fdb9'; // PK of 0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417

function findImports(importPath) {
  try {
    if (importPath.startsWith('@openzeppelin/')) {
      const fullPath = path.resolve('node_modules', importPath);
      if (fs.existsSync(fullPath)) {
        return { contents: fs.readFileSync(fullPath, 'utf8') };
      }
    }
  } catch (e) {}
  return { error: 'File not found: ' + importPath };
}

async function deployTest() {
  const signer = new ethers.Wallet(pk, sepoliaProvider);
  console.log('Deployer Wallet Address:', signer.address);

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

  console.log('Compiling Solidity code...');
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  
  if (output.errors && output.errors.some(e => e.severity === 'error')) {
    console.error('Compilation errors:', output.errors.map(e => e.formattedMessage).join('\n'));
    return;
  }

  const contractObj = output.contracts['Contract.sol']['FortuneToken'];
  const abi = contractObj.abi;
  const bytecode = '0x' + contractObj.evm.bytecode.object;

  console.log('Deploying FortuneToken (FTN) to Sepolia for 0x56f0...');
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const deployTx = await factory.deploy();
  console.log('Deploy Tx Hash:', deployTx.deploymentTransaction()?.hash);
  await deployTx.waitForDeployment();
  const contractAddress = await deployTx.getAddress();
  console.log('DEPLOYED SUCCESS! Contract Address:', contractAddress);

  // Check token balance of deployer (0x56f0...)
  const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider);
  const bal = await contract.balanceOf(signer.address);
  console.log(`\n🎉 Balance of user owner ${signer.address}: ${ethers.formatUnits(bal, 18)} FTN`);
}

deployTest().catch(console.error);
