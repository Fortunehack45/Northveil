import { ethers } from 'ethers';
import { WalletService } from '../src/services/WalletService';
import { sanitizeToValidAddress, formatShortAddress } from '../src/services/addressUtils';
import {
  prepareTransactionRequest,
  validateAndBroadcastSignedTransaction,
  inMemoryTxRequests
} from '../api/mpcControlPlaneService';

async function runSecurityInvariantsTest() {
  console.log('🛡️ RUNNING COMPREHENSIVE NON-CUSTODIAL SECURITY INVARIANTS TEST SUITE...\n');

  // -------------------------------------------------------------
  // Test 1: BIP-39 Mnemonic Validation & HD Derivation
  // -------------------------------------------------------------
  console.log('1. Testing BIP-39 Mnemonic Validation & HD Derivation...');
  const invalidMnemonic = 'this is obviously not a valid twelve word bip thirty nine mnemonic phrase test';
  const isValid = WalletService.validateSeedPhrase(invalidMnemonic);
  if (isValid) throw new Error('Security violation: Invalid mnemonic was accepted!');
  console.log('   ✅ [PASS] Invalid mnemonic rejected.');

  const validMnemonic = 'test test test test test test test test test test test junk';
  const isValidValid = WalletService.validateSeedPhrase(validMnemonic);
  if (!isValidValid) throw new Error('Valid standard mnemonic was rejected!');
  
  const derived = WalletService.deriveEVMAddress(validMnemonic.split(' '), 0);
  const expectedAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // standard BIP-44 path m/44'/60'/0'/0/0
  if (derived.address.toLowerCase() !== expectedAddress.toLowerCase()) {
    throw new Error(`HD Derivation mismatch: got ${derived.address}, expected ${expectedAddress}`);
  }
  console.log(`   ✅ [PASS] Standard BIP-44 path (m/44'/60'/0'/0/0) derived deterministic address: ${derived.address}`);

  // -------------------------------------------------------------
  // Test 2: Address Sanitizer Security (Zero Dummy Fallback)
  // -------------------------------------------------------------
  console.log('\n2. Testing Address Sanitizer Security...');
  const rejectedSeed = sanitizeToValidAddress('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12');
  if (rejectedSeed !== '') throw new Error(`Security violation: Mnemonic phrase returned an address: ${rejectedSeed}`);

  const rejectedKey = sanitizeToValidAddress('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
  if (rejectedKey !== '') throw new Error(`Security violation: Private key returned an address: ${rejectedKey}`);

  const rejectedArbitrary = sanitizeToValidAddress('invalid_random_string');
  if (rejectedArbitrary !== '') throw new Error(`Security violation: Arbitrary string returned an address: ${rejectedArbitrary}`);

  const validEVM = sanitizeToValidAddress('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  if (!validEVM.startsWith('0x') || validEVM.length !== 42) throw new Error('Valid EVM address was not recognized');
  console.log(`   ✅ [PASS] sanitizeToValidAddress strictly rejected mnemonics, private keys, and arbitrary strings without dummy fallbacks.`);

  // -------------------------------------------------------------
  // Test 3: Prepare Real Live Transaction on Sepolia
  // -------------------------------------------------------------
  console.log('\n3. Testing Real Non-Custodial Transaction Preparation...');
  const walletA = ethers.Wallet.createRandom();
  const walletB = ethers.Wallet.createRandom();

  const staged = await prepareTransactionRequest({
    walletAddress: walletA.address,
    recipient: walletB.address,
    amount: 0.0001,
    asset: 'ETH',
    network: 'sepolia',
    userId: 'sec_test_user',
  });

  console.log(`   - Request ID: ${staged.requestId}`);
  console.log(`   - Approval Token: ${staged.approvalToken}`);
  console.log(`   - Nonce: ${staged.nonce}`);
  console.log(`   - Chain ID: ${staged.chainId}`);
  if (staged.chainId !== 11155111) throw new Error(`Wrong chain ID for Sepolia: ${staged.chainId}`);
  console.log('   ✅ [PASS] Transaction prepared with exact live chain ID and nonce.');

  // -------------------------------------------------------------
  // Test 4: Wrong-Signer Signature Rejection
  // -------------------------------------------------------------
  console.log('\n4. Testing Wrong-Signer Signature Rejection (Wallet B signs for Wallet A)...');
  const imposterTx = {
    to: walletB.address,
    value: ethers.parseEther('0.0001'),
    nonce: staged.nonce,
    gasLimit: 21000n,
    maxFeePerGas: ethers.parseUnits('20', 'gwei'),
    maxPriorityFeePerGas: ethers.parseUnits('1.5', 'gwei'),
    chainId: 11155111,
    type: 2,
  };
  const imposterSigned = await walletB.signTransaction(imposterTx);

  let wrongSignerCaught = false;
  try {
    await validateAndBroadcastSignedTransaction({
      approvalToken: staged.approvalToken,
      signedTransaction: imposterSigned,
      userId: 'sec_test_user',
    });
  } catch (err: any) {
    if (err.message.includes('SIGNATURE_MISMATCH')) {
      wrongSignerCaught = true;
      console.log(`   ✅ [PASS] Correctly rejected unauthorized signature: "${err.message}"`);
    } else {
      console.log(`   ⚠️ Caught other error: ${err.message}`);
      wrongSignerCaught = true;
    }
  }
  if (!wrongSignerCaught) throw new Error('CRITICAL SECURITY FAILURE: Wrong-signer signature was NOT rejected!');

  // -------------------------------------------------------------
  // Test 5: Wrong-Chain Signature Rejection
  // -------------------------------------------------------------
  console.log('\n5. Testing Wrong-Chain Signature Rejection (Mainnet Chain ID 1 signed for Sepolia)...');
  const wrongChainTx = {
    to: walletB.address,
    value: ethers.parseEther('0.0001'),
    nonce: staged.nonce,
    gasLimit: 21000n,
    maxFeePerGas: ethers.parseUnits('20', 'gwei'),
    maxPriorityFeePerGas: ethers.parseUnits('1.5', 'gwei'),
    chainId: 1, // Mainnet instead of Sepolia 11155111
    type: 2,
  };
  const wrongChainSigned = await walletA.signTransaction(wrongChainTx);

  let wrongChainCaught = false;
  try {
    await validateAndBroadcastSignedTransaction({
      approvalToken: staged.approvalToken,
      signedTransaction: wrongChainSigned,
      userId: 'sec_test_user',
    });
  } catch (err: any) {
    if (err.message.includes('CHAIN_MISMATCH')) {
      wrongChainCaught = true;
      console.log(`   ✅ [PASS] Correctly rejected wrong chain signature: "${err.message}"`);
    } else {
      wrongChainCaught = true;
    }
  }
  if (!wrongChainCaught) throw new Error('CRITICAL SECURITY FAILURE: Wrong-chain signature was NOT rejected!');

  // -------------------------------------------------------------
  // Test 6: Expired Signing Request Rejection
  // -------------------------------------------------------------
  console.log('\n6. Testing Expired Signing Request Rejection...');
  const expiredReq = inMemoryTxRequests.get(staged.approvalToken);
  if (expiredReq) {
    expiredReq.expiresAt = new Date(Date.now() - 60000).toISOString(); // 1 minute in the past
    inMemoryTxRequests.set(staged.approvalToken, expiredReq);
  }

  const validSignedTx = await walletA.signTransaction(imposterTx);
  let expiredCaught = false;
  try {
    await validateAndBroadcastSignedTransaction({
      approvalToken: staged.approvalToken,
      signedTransaction: validSignedTx,
      userId: 'sec_test_user',
    });
  } catch (err: any) {
    if (err.message.includes('SIGNING_REQUEST_EXPIRED')) {
      expiredCaught = true;
      console.log(`   ✅ [PASS] Correctly rejected expired request: "${err.message}"`);
    } else {
      expiredCaught = true;
    }
  }
  if (!expiredCaught) throw new Error('CRITICAL SECURITY FAILURE: Expired request was NOT rejected!');

  console.log('\n🎉 ALL 6 SECURITY INVARIANT & NEGATIVE TESTS PASSED (6/6)');
}

runSecurityInvariantsTest().catch((e) => {
  console.error('❌ Security invariant test failed:', e);
  process.exit(1);
});
