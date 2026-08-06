import solc from 'solc';
import { ethers } from 'ethers';

const sepoliaProvider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');

// Wallet 0x87678de86804c6c3612d66cbd6e2857f1a7d8345 with 0.051 SepoliaETH
const pk = '0x51eb22c3a49f749648e053a48d369e19b9efdc644303612b56375980730b41dc';
const signer = new ethers.Wallet(pk, sepoliaProvider);

const solCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WorkBaseToken {
    string public name = "WorkBaseToken";
    string public symbol = "WBT";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**18;
    mapping(address => uint256) public balanceOf;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
}
`;

const input = {
  language: 'Solidity',
  sources: { 'Contract.sol': { content: solCode } },
  settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contractRes = output.contracts['Contract.sol']['WorkBaseToken'];
const abi = contractRes.abi;
const bytecode = '0x' + contractRes.evm.bytecode.object;

async function runLiveDeploy() {
  console.log('Deployer Signer Address:', signer.address);
  const bal = await sepoliaProvider.getBalance(signer.address);
  console.log('Deployer Gas Balance:', ethers.formatEther(bal), 'SepoliaETH');

  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  console.log('Broadcasting deployment transaction to Sepolia testnet...');
  const contract = await factory.deploy();
  const txHash = contract.deploymentTransaction().hash;
  console.log('Transaction Broadcast Hash:', txHash);

  await contract.waitForDeployment();
  const contractAddr = await contract.getAddress();
  console.log('CONFIRMED ON-CHAIN! Deployed Contract Address:', contractAddr);
  console.log('Etherscan URL:', `https://sepolia.etherscan.io/tx/${txHash}`);
}

runLiveDeploy().catch(console.error);
