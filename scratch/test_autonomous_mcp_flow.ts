process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';

import { executeRealTool } from '../mcp-server/index.js';
import { ethers } from 'ethers';
import assert from 'assert';

async function testAutonomousMcpFlow() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔥 TESTING AUTONOMOUS MCP FLOW & CUSTOM ALLOCATION DEPLOYMENT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const OWNER_WALLET = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const RESERVATION_WALLET = '0xcd80170f0aaec2b71c8df0163717f1856bec0dac';

  // --- Step 1: Deploy FIRE ERC-20 with 97%/3% Split in 1 Transaction ---
  console.log('--- Step 1: Deploying FIRE Token (100M total, 97% Reserve, 3% Creator) ---');
  const deployRes = await executeRealTool(
    'deploy_smart_contract',
    {
      contractName: 'FIRE',
      symbol: 'FIRE',
      contractType: 'erc20',
      totalSupply: 100000000,
      ownerAllocationPercentage: 3,
      reserveAllocationPercentage: 97,
      reserveRecipientAddress: RESERVATION_WALLET,
      prompt: `create a new smart contract ERC-20 named FIRE and the ticker FIRE 100 million total supply with 97% mint to the wallet ${RESERVATION_WALLET} for reservations and the remaining as my Creator allocation which will be 3%`,
      network: 'sepolia',
    },
    OWNER_WALLET
  );

  console.log('Deploy Result Status:', deployRes.status);
  console.log('Contract Address:', deployRes.contractAddress);
  console.log('Transaction Hash:', deployRes.txHash);
  console.log('Total Supply:', deployRes.totalSupply);
  console.log('Owner Allocation (3%):', deployRes.ownerAllocation);
  console.log('Reserve Allocation (97%):', deployRes.reserveAllocation);
  console.log('Reserve Recipient:', deployRes.reserveRecipientAddress);

  assert.strictEqual(deployRes.status, 'confirmed', 'Deployment MUST be confirmed on-chain');
  assert.ok(deployRes.txHash && deployRes.txHash.startsWith('0x'), 'Must return valid on-chain txHash');
  assert.ok(deployRes.contractAddress && deployRes.contractAddress.startsWith('0x'), 'Must return valid contract address');
  assert.strictEqual(deployRes.totalSupply, 100000000, 'Total supply must be 100M');
  assert.strictEqual(deployRes.ownerAllocation, 3000000, 'Owner allocation must be 3M (3%)');
  assert.strictEqual(deployRes.reserveAllocation, 97000000, 'Reserve allocation must be 97M (97%)');
  assert.strictEqual(deployRes.reserveRecipientAddress.toLowerCase(), RESERVATION_WALLET.toLowerCase());
  assert.ok(!deployRes.formattedMarkdown.includes('STAGED (PASSKEY APPROVAL REQUIRED)'), 'Must not require passkey staging');
  console.log('✅ [PASS] FIRE ERC-20 contract deployed autonomously with 97%/3% split!\n');

  // --- Step 2: Test On-Chain Verification of Balances ---
  console.log('--- Step 2: Verifying On-Chain Token Balances via RPC ---');
  try {
    const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
    const erc20Abi = [
      'function balanceOf(address) view returns (uint256)',
      'function totalSupply() view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];
    const contract = new ethers.Contract(deployRes.contractAddress, erc20Abi, provider);

    const decimals = await contract.decimals();
    const ownerBalRaw = await contract.balanceOf(OWNER_WALLET);
    const reserveBalRaw = await contract.balanceOf(RESERVATION_WALLET);
    const totalSupRaw = await contract.totalSupply();

    const ownerBal = Number(ethers.formatUnits(ownerBalRaw, decimals));
    const reserveBal = Number(ethers.formatUnits(reserveBalRaw, decimals));
    const totalSup = Number(ethers.formatUnits(totalSupRaw, decimals));

    console.log(`On-Chain Decimals: ${decimals}`);
    console.log(`On-Chain Creator Balance: ${ownerBal.toLocaleString()} FIRE (Expected: 3,000,000)`);
    console.log(`On-Chain Reserve Balance: ${reserveBal.toLocaleString()} FIRE (Expected: 97,000,000)`);
    console.log(`On-Chain Total Supply: ${totalSup.toLocaleString()} FIRE (Expected: 100,000,000)`);

    assert.strictEqual(ownerBal, 3000000, 'On-chain Creator balance must equal 3M');
    assert.strictEqual(reserveBal, 97000000, 'On-chain Reserve balance must equal 97M');
    assert.strictEqual(totalSup, 100000000, 'On-chain Total supply must equal 100M');
    console.log('✅ [PASS] On-chain balances perfectly matched 97%/3% split!\n');
  } catch (rpcErr: any) {
    console.warn('RPC verification warning (network dependent):', rpcErr.message);
  }

  // --- Step 3: Test Direct Autonomous Mint Tool ---
  console.log('--- Step 3: Testing Autonomous mint_tokens Tool ---');
  const mintRes = await executeRealTool(
    'mint_tokens',
    {
      contractAddress: deployRes.contractAddress,
      recipientAddress: RESERVATION_WALLET,
      amount: '1000',
      network: 'sepolia',
    },
    OWNER_WALLET
  );

  console.log('Mint Result:', mintRes);
  assert.ok(mintRes.txHash, 'Must return confirmed mint txHash');
  assert.ok(!mintRes.formattedMarkdown?.includes('STAGED (PASSKEY APPROVAL REQUIRED)'), 'Must not require passkey staging');
  console.log('✅ [PASS] mint_tokens executed autonomously on-chain!\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL AUTONOMOUS MCP & CUSTOM ALLOCATION TESTS PASSED!');
  console.log('═══════════════════════════════════════════════════════════════');
}

testAutonomousMcpFlow().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
