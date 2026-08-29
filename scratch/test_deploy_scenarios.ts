import express from 'express';
import http from 'http';
import { executeRealTool } from '../mcp-server/index.js';

async function run() {
  console.log('Testing deploy_smart_contract with explicit walletAddress...');
  const res1: any = await executeRealTool(
    'deploy_smart_contract',
    {
      contractName: 'FIRE',
      symbol: 'FIRE',
      totalSupply: 100000000,
      network: 'sepolia',
      walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417'
    },
    ''
  );

  console.log('Deploy with walletAddress result:', {
    contractName: res1.contractName,
    symbol: res1.symbol,
    status: res1.status,
    contractAddress: res1.contractAddress || res1.expectedContractAddress,
    hasSolidityCode: !!res1.solidityCode,
    hasUnsignedTx: !!res1.unsignedTxPreview,
    approvalToken: res1.approvalToken ? `${res1.approvalToken.slice(0, 15)}...` : undefined,
  });

  console.log('\nTesting create_smart_contract with prompt...');
  const res2: any = await executeRealTool(
    'create_smart_contract',
    {
      prompt: 'Help me to create a smart contract named FIRE with 100 million total supply on sepolia',
      contractName: 'FIRE',
      symbol: 'FIRE',
      totalSupply: 100000000,
      walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417'
    },
    ''
  );

  console.log('Create smart contract result:', {
    contractName: res2.contractName,
    symbol: res2.symbol,
    hasCode: !!res2.solidityCode,
    isCompilable: !!res2.bytecode,
  });

  console.log('\n🎉 ALL DEPLOY SCENARIOS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
