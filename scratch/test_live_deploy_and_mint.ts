import { ethers } from 'ethers';
import solc from 'solc';

// LOCAL_TEST_PRIVATE_KEY is strictly required. No hardcoded or silent fallback.
const RELAYER_KEY = process.env.LOCAL_TEST_PRIVATE_KEY;
if (!RELAYER_KEY) {
  console.error('❌ ERROR: LOCAL_TEST_PRIVATE_KEY environment variable is required to run live Sepolia deployment tests.');
  console.error('Please set LOCAL_TEST_PRIVATE_KEY="0x..." in your environment and rerun.');
  process.exit(1);
}
const RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

const erc20Source = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RealToken {
    string public name = "RealNorthveilToken";
    string public symbol = "RNVT";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    uint256 public immutable maxSupply = 1000000 * 10**18;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        uint256 initial = 1000 * 10**18;
        totalSupply = initial;
        balanceOf[msg.sender] = initial;
        emit Transfer(address(0), msg.sender, initial);
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "balance low");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function mint(address to, uint256 amount) public onlyOwner returns (bool) {
        require(totalSupply + amount <= maxSupply, "exceeds max supply");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }
}
`;

const nftSource = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RealNFT {
    string public name = "RealNorthveilNFT";
    string public symbol = "RNNFT";
    uint256 public totalSupply;
    uint256 public immutable maxSupply = 10000;
    address public owner;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function safeMint(address to, string memory uri) public onlyOwner returns (uint256) {
        require(totalSupply < maxSupply, "max supply reached");
        uint256 tokenId = totalSupply++;
        _owners[tokenId] = to;
        _balances[to] += 1;
        _tokenURIs[tokenId] = uri;
        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address o = _owners[tokenId];
        require(o != address(0), "invalid token id");
        return o;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "invalid token id");
        return _tokenURIs[tokenId];
    }
}
`;

async function main() {
  console.log('--- 1. Compiling ERC-20 Token with solc ---');
  const erc20Input = {
    language: 'Solidity',
    sources: { 'Contract.sol': { content: erc20Source } },
    settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
  };
  const erc20Comp = JSON.parse(solc.compile(JSON.stringify(erc20Input)));
  const erc20Bytecode = '0x' + erc20Comp.contracts['Contract.sol']['RealToken'].evm.bytecode.object;
  const erc20Abi = erc20Comp.contracts['Contract.sol']['RealToken'].abi;
  console.log('ERC-20 Bytecode length:', erc20Bytecode.length);

  const provider = new ethers.JsonRpcProvider(RPC_URL, 11155111, { staticNetwork: ethers.Network.from(11155111) });
  const wallet = new ethers.Wallet(RELAYER_KEY, provider);
  console.log('Deployer Wallet:', wallet.address);

  console.log('\n--- 2. Deploying ERC-20 on Sepolia ---');
  const erc20Factory = new ethers.ContractFactory(erc20Abi, erc20Bytecode, wallet);
  const erc20Contract: any = await erc20Factory.deploy();
  console.log('Deployment Tx Hash:', erc20Contract.deploymentTransaction()?.hash);
  await erc20Contract.waitForDeployment();
  const erc20Address = await erc20Contract.getAddress();
  console.log('✅ Real ERC-20 Deployed Address:', erc20Address);

  console.log('\n--- 3. Minting ERC-20 Tokens on Sepolia ---');
  const testRecipient = '0x000000000000000000000000000000000000dEaD';
  const mintAmount = ethers.parseEther('500');
  const mintTx = await erc20Contract.mint(testRecipient, mintAmount);
  console.log('Mint Tx Hash:', mintTx.hash);
  const mintReceipt = await mintTx.wait(1);
  console.log('✅ Mint confirmed in block:', mintReceipt?.blockNumber);
  const bal = await erc20Contract.balanceOf(testRecipient);
  console.log('✅ Recipient Balance verified:', ethers.formatEther(bal), 'RNVT');

  console.log('\n--- 4. Compiling ERC-721 NFT with solc ---');
  const nftInput = {
    language: 'Solidity',
    sources: { 'Contract.sol': { content: nftSource } },
    settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
  };
  const nftComp = JSON.parse(solc.compile(JSON.stringify(nftInput)));
  const nftBytecode = '0x' + nftComp.contracts['Contract.sol']['RealNFT'].evm.bytecode.object;
  const nftAbi = nftComp.contracts['Contract.sol']['RealNFT'].abi;
  console.log('ERC-721 Bytecode length:', nftBytecode.length);

  console.log('\n--- 5. Deploying ERC-721 NFT on Sepolia ---');
  const nftFactory = new ethers.ContractFactory(nftAbi, nftBytecode, wallet);
  const nftContract: any = await nftFactory.deploy();
  console.log('NFT Deployment Tx Hash:', nftContract.deploymentTransaction()?.hash);
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log('✅ Real ERC-721 NFT Deployed Address:', nftAddress);

  console.log('\n--- 6. Minting NFT on Sepolia ---');
  const nftUri = 'https://northveil.xyz/metadata/1.json';
  const nftMintTx = await nftContract.safeMint(wallet.address, nftUri);
  console.log('NFT Mint Tx Hash:', nftMintTx.hash);
  const nftMintReceipt = await nftMintTx.wait(1);
  console.log('✅ NFT Mint confirmed in block:', nftMintReceipt?.blockNumber);
  const ownerOf0 = await nftContract.ownerOf(0);
  const tokenUri0 = await nftContract.tokenURI(0);
  console.log('✅ Token #0 Owner verified:', ownerOf0);
  console.log('✅ Token #0 URI verified:', tokenUri0);

  console.log('\n🎉 ALL REAL CONTRACT DEPLOYMENTS AND REAL TOKEN & NFT MINTS SUCCEEDED ON SEPOLIA!');
}

main().catch(console.error);
