import solc from 'solc';

const solCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestToken {
    string public name = "TestToken";
    string public symbol = "TST";
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
console.log('Compile Errors/Warnings:', output.errors || 'None');
const contractRes = output.contracts?.['Contract.sol']?.['TestToken'];
if (contractRes) {
  console.log('Bytecode length:', contractRes.evm.bytecode.object.length);
  console.log('ABI:', JSON.stringify(contractRes.abi));
} else {
  console.log('Compilation failed to produce contract object!');
}
