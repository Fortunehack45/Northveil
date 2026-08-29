/**
 * Northveil Multi-Chain & Mainnet Comprehensive Test Suite
 * Validates Token Balances, NFTs, Transfers & Deployments across:
 * Ethereum Mainnet, Solana, BNB Smart Chain, Polygon, Arbitrum, Optimism, Avalanche, Base, Sepolia.
 */

async function runMultiChainTests() {
  console.log('🧪 [TEST] Starting Northveil Multi-Chain & Mainnet Verification Suite...\n');

  const BASE_URL = 'http://localhost:3001';
  let passedCount = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // Test 1: Query All Networks Balances (Simultaneous Multi-Chain Scan)
    console.log('1️⃣ Testing Multi-Chain Balances ("all" / multi)...');
    const resAll = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'northveil_get_balances',
          arguments: {
            walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
            network: 'all',
          },
        },
      }),
    });
    const dataAll: any = await resAll.json();
    const parsedAll = typeof dataAll.result?.content?.[0]?.text === 'string'
      ? JSON.parse(dataAll.result.content[0].text)
      : dataAll.result;

    assert(parsedAll?.ok === true, 'All networks balance query returns ok: true');
    assert(Array.isArray(parsedAll?.chains) && parsedAll.chains.length >= 6, 'Contains multi-chain breakdown across 6+ networks');
    assert(parsedAll?.chains?.some((c: any) => c.network === 'solana'), 'Includes Solana network scan');
    assert(parsedAll?.chains?.some((c: any) => c.network === 'bsc'), 'Includes BNB Smart Chain network scan');
    assert(parsedAll?.chains?.some((c: any) => c.network === 'ethereum'), 'Includes Ethereum Mainnet network scan');
    console.log(`     -> Total Portfolio Valuation: $${parsedAll?.totalNetWorthUsd || '0.00'} USD across ${parsedAll?.chains?.length} chains\n`);

    // Test 2: Query Solana Balance & SPL Tokens
    console.log('2️⃣ Testing Solana Balance & SPL Token Lookup...');
    const resSol = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'northveil_get_balances',
          arguments: {
            walletAddress: 'J1S9H3Q52KaTNGwMfywhtDwv78PhTmaRfZFU3guUMw5x',
            network: 'solana',
          },
        },
      }),
    });
    const dataSol: any = await resSol.json();
    const parsedSol = typeof dataSol.result?.content?.[0]?.text === 'string'
      ? JSON.parse(dataSol.result.content[0].text)
      : dataSol.result;

    assert(parsedSol?.ok === true, 'Solana balance query returns ok: true');
    assert(parsedSol?.network === 'solana', 'Network correctly identified as Solana');
    assert(parsedSol?.native?.symbol === 'SOL', 'Native asset identified as SOL');
    console.log(`     -> Solana Native: ${parsedSol?.native?.balance} SOL (~$${parsedSol?.native?.balanceUsd})\n`);

    // Test 3: Query BNB Smart Chain & ERC-20 Tokens
    console.log('3️⃣ Testing BNB Smart Chain Balance & Token Lookup...');
    const resBsc = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'northveil_get_balances',
          arguments: {
            walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
            network: 'bsc',
          },
        },
      }),
    });
    const dataBsc: any = await resBsc.json();
    const parsedBsc = typeof dataBsc.result?.content?.[0]?.text === 'string'
      ? JSON.parse(dataBsc.result.content[0].text)
      : dataBsc.result;

    assert(parsedBsc?.ok === true, 'BSC balance query returns ok: true');
    assert(parsedBsc?.native?.symbol === 'BNB', 'Native asset identified as BNB');
    console.log(`     -> BSC Native: ${parsedBsc?.native?.balance} BNB (~$${parsedBsc?.native?.balanceUsd})\n`);

    // Test 4: Multi-Chain NFT Holdings
    console.log('4️⃣ Testing Multi-Chain NFT Holdings...');
    const resNfts = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'northveil_list_nfts',
          arguments: {
            walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
            network: 'all',
          },
        },
      }),
    });
    const dataNfts: any = await resNfts.json();
    const parsedNfts = typeof dataNfts.result?.content?.[0]?.text === 'string'
      ? JSON.parse(dataNfts.result.content[0].text)
      : dataNfts.result;

    assert(parsedNfts?.ok === true, 'NFT query returns ok: true');
    assert(Array.isArray(parsedNfts?.nfts) && parsedNfts.nfts.length >= 4, 'Returns multi-chain NFT list (Ethereum, Base, BSC, Solana, etc.)');
    assert(parsedNfts.nfts.some((n: any) => n.network === 'ethereum'), 'Includes Ethereum NFTs');
    assert(parsedNfts.nfts.some((n: any) => n.network === 'solana'), 'Includes Solana NFTs');
    assert(parsedNfts.nfts.some((n: any) => n.network === 'bsc'), 'Includes BSC NFTs');
    console.log(`     -> Found ${parsedNfts.nfts?.length} NFTs across multiple chains\n`);

    // Test 5: Multi-Chain Native Transfer (e.g. BNB on BSC)
    console.log('5️⃣ Testing BSC Native Transfer Staging...');
    const resTransferBsc = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'northveil_prepare_transfer',
          arguments: {
            to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            amount: 0.25,
            asset: 'BNB',
            network: 'bsc',
            reason: 'Treasury allocation on BNB Smart Chain',
          },
        },
      }),
    });
    const dataTransferBsc: any = await resTransferBsc.json();
    const parsedTransferBsc = typeof dataTransferBsc.result?.content?.[0]?.text === 'string'
      ? JSON.parse(dataTransferBsc.result.content[0].text)
      : dataTransferBsc.result;

    assert(parsedTransferBsc?.ok === true, 'BSC transfer staged successfully');
    assert(Boolean(parsedTransferBsc?.approval?.id), 'Generates valid approval token');
    assert(parsedTransferBsc?.wallet?.chain === 'bsc', 'Target chain set to bsc');
    console.log(`     -> Approval ID: ${parsedTransferBsc?.approval?.id}\n`);

    // Test 6: Multi-Chain ERC-20 Transfer (e.g. USDT on Ethereum Mainnet)
    console.log('6️⃣ Testing Ethereum Mainnet USDT ERC-20 Transfer...');
    const resTransferUsdt = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'northveil_prepare_transfer',
          arguments: {
            to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            amount: 150,
            asset: 'USDT',
            network: 'ethereum',
            reason: 'Payment in USDT on Ethereum Mainnet',
          },
        },
      }),
    });
    const dataTransferUsdt: any = await resTransferUsdt.json();
    const parsedTransferUsdt = typeof dataTransferUsdt.result?.content?.[0]?.text === 'string'
      ? JSON.parse(dataTransferUsdt.result.content[0].text)
      : dataTransferUsdt.result;

    assert(parsedTransferUsdt?.ok === true, 'USDT ERC-20 transfer staged successfully');
    assert(Boolean(parsedTransferUsdt?.tokenAddress), 'Resolved USDT contract address automatically');
    assert(Boolean(parsedTransferUsdt?.approval?.id), 'Approval ID created for ERC-20 transfer');
    console.log(`     -> USDT Contract: ${parsedTransferUsdt?.tokenAddress}\n`);

    // Test 7: Multi-Chain Contract Deployment (e.g. Polygon / BSC)
    console.log('7️⃣ Testing Contract Deployment on Polygon & BSC with Predicted Address...');
    const resDeploy = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'northveil_prepare_deploy',
          arguments: {
            contractName: 'YieldVault',
            network: 'polygon',
            sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract YieldVault {
    string public name = "Yield Vault";
}`,
          },
        },
      }),
    });
    const dataDeploy: any = await resDeploy.json();
    const parsedDeploy = typeof dataDeploy.result?.content?.[0]?.text === 'string'
      ? JSON.parse(dataDeploy.result.content[0].text)
      : dataDeploy.result;

    assert(parsedDeploy?.ok === true, 'Polygon deployment staged successfully');
    assert(Boolean(parsedDeploy?.predictedContractAddress), 'Calculates deterministic deployed contract address');
    assert(Boolean(parsedDeploy?.approval?.id), 'Approval ID generated for contract deployment');
    console.log(`     -> Predicted Contract Address: ${parsedDeploy?.predictedContractAddress}\n`);

  } catch (err: any) {
    console.error('⚠️ Test suite execution error:', err.message);
  }

  console.log('====================================================');
  console.log(`🎯 Multi-Chain Test Results: ${passedCount} / ${totalTests} Passed`);
  console.log('====================================================');
}

runMultiChainTests();
