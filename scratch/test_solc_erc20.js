import solc from 'solc';

const nameStr = 'WorkBaseToken';
const symbolStr = 'WBT';
const totalSupplyNum = 1000000;
const ownerAllocNum = 800000;
const imageUrlStr = 'https://northveil.xyz/logo.png';

const solCodeErc20 = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ${nameStr} {
    string public name = "${nameStr}";
    string public symbol = "${symbolStr}";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    uint256 public immutable maxSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        maxSupply = ${totalSupplyNum} * 10**uint256(decimals);
        if (${ownerAllocNum} > 0) {
            uint256 initialAmount = ${ownerAllocNum} * 10**uint256(decimals);
            totalSupply += initialAmount;
            balanceOf[msg.sender] += initialAmount;
            emit Transfer(address(0), msg.sender, initialAmount);
        }
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[msg.sender] >= value, "ERC20: transfer amount exceeds balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[from] >= value, "ERC20: transfer amount exceeds balance");
        require(allowance[from][msg.sender] >= value, "ERC20: transfer amount exceeds allowance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 amount) public onlyOwner returns (bool) {
        require(totalSupply + amount <= maxSupply, "ERC20: Exceeds max supply");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }

    function burn(uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "ERC20: burn amount exceeds balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
        return true;
    }
}
`;

const input = {
  language: 'Solidity',
  sources: { 'Contract.sol': { content: solCodeErc20 } },
  settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log('Compile Errors/Warnings:', output.errors || 'None');
const contractRes = output.contracts?.['Contract.sol']?.[nameStr];
if (contractRes && contractRes.evm?.bytecode?.object) {
  console.log('SUCCESS! Bytecode length:', contractRes.evm.bytecode.object.length);
} else {
  console.log('FAILED to compile!');
}
