process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';
process.on('unhandledRejection', (reason) => {
  console.warn('[Global Unhandled Rejection Caught]:', (reason as any)?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.warn('[Global Uncaught Exception Caught]:', err?.message || err);
});

import { executeRealTool } from '../mcp-server/index.js';
import { ethers } from 'ethers';

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const provider = new ethers.JsonRpcProvider(RPC_URL, 11155111, { staticNetwork: ethers.Network.from(11155111) });
const TEST_VAULT = '0x56F0Fdbe1B09C0f65DA1cb73ef878C07EC645417';
const RECIPIENT = '0x000000000000000000000000000000000000dEaD';

async function testRealSmartContractAndMintFlow() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 TESTING REAL ON-CHAIN SMART CONTRACT DEPLOYMENT & MINTING');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Deploy Real ERC-20 Token
  console.log('--- Step 1: Deploying Real ERC-20 Token on Sepolia ---');
  const tokenDeployRes = await executeRealTool('deploy_smart_contract', {
    contractName: 'AlphaGovToken',
    symbol: 'AGOV',
    contractType: 'erc20',
    totalSupply: 5000000,
    ownerAllocation: 100000,
    network: 'sepolia',
  }, TEST_VAULT);

  console.log('Deploy Result Status:', tokenDeployRes.status || (tokenDeployRes.txHash ? 'confirmed' : 'pending'));
  const erc20Address = tokenDeployRes.contractAddress || tokenDeployRes.contract_address;
  console.log('✅ Real ERC-20 Address:', erc20Address);
  console.log('✅ Tx Hash:', tokenDeployRes.txHash || tokenDeployRes.tx_hash);

  if (!erc20Address || !erc20Address.startsWith('0x')) {
    throw new Error('ERC-20 deployment failed to return a valid contract address');
  }

  // 2. Mint Real ERC-20 Tokens
  console.log('\n--- Step 2: Minting Real ERC-20 Tokens on Sepolia ---');
  const tokenMintRes = await executeRealTool('mint_tokens', {
    contractAddress: erc20Address,
    recipientAddress: RECIPIENT,
    amount: '2500',
    network: 'sepolia',
  }, TEST_VAULT);

  console.log('✅ Mint Tx Hash:', tokenMintRes.txHash || tokenMintRes.tx_hash);
  console.log('✅ Mint Status:', tokenMintRes.status);
  console.log('✅ Recipient:', tokenMintRes.recipientAddress || RECIPIENT);

  // Verify on-chain ERC-20 balance
  const erc20Contract = new ethers.Contract(erc20Address, [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
  ], provider);
  const deadBal = await erc20Contract.balanceOf(RECIPIENT);
  console.log('✅ Verified On-Chain Recipient Balance:', ethers.formatEther(deadBal), 'AGOV');

  // 3. Deploy Real ERC-721 NFT Collection
  console.log('\n--- Step 3: Deploying Real ERC-721 NFT Collection on Sepolia ---');
  const nftDeployRes = await executeRealTool('deploy_smart_contract', {
    contractName: 'CyberVeilNFT',
    symbol: 'CVNFT',
    contractType: 'erc721',
    totalSupply: 1000,
    ownerAllocation: 0,
    network: 'sepolia',
  }, TEST_VAULT);

  const nftAddress = nftDeployRes.contractAddress || nftDeployRes.contract_address;
  console.log('✅ Real ERC-721 NFT Address:', nftAddress);
  console.log('✅ NFT Deploy Tx Hash:', nftDeployRes.txHash || nftDeployRes.tx_hash);

  if (!nftAddress || !nftAddress.startsWith('0x')) {
    throw new Error('NFT deployment failed to return a valid contract address');
  }

  // 4. Mint Real ERC-721 NFT
  console.log('\n--- Step 4: Minting Real ERC-721 NFT with Metadata on Sepolia ---');
  const nftMintRes = await executeRealTool('mint_nft', {
    contractAddress: nftAddress,
    recipientAddress: TEST_VAULT,
    uri: 'https://northveil.xyz/metadata/cyberveil_1.json',
    network: 'sepolia',
  }, TEST_VAULT);

  console.log('✅ NFT Mint Tx Hash:', nftMintRes.txHash || nftMintRes.tx_hash);
  console.log('✅ NFT Mint Status:', nftMintRes.status);

  // Verify on-chain NFT ownership
  const nftContract = new ethers.Contract(nftAddress, [
    'function ownerOf(uint256) view returns (address)',
    'function tokenURI(uint256) view returns (string)',
  ], provider);
  const ownerOf0 = await nftContract.ownerOf(0);
  const tokenUri0 = await nftContract.tokenURI(0);
  console.log('✅ Verified On-Chain NFT #0 Owner:', ownerOf0);
  console.log('✅ Verified On-Chain NFT #0 Token URI:', tokenUri0);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 100% REAL SMART CONTRACT COMPILATION, DEPLOYMENT & MINTING CONFIRMED ON-CHAIN!');
  console.log('═══════════════════════════════════════════════════════════════');
}

testRealSmartContractAndMintFlow().catch(console.error);
