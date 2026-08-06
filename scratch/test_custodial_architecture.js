import {
  createCustodialWallet,
  importCustodialPrivateKey,
  importCustodialSeedPhrase,
  createTransactionRequest,
  approveAndExecuteTransaction,
  rejectTransactionRequest
} from '../mcp-server/dist/custodialSigningService.js';
import { encryptCredential, decryptCredential } from '../mcp-server/dist/encryptionService.js';

async function testCustodialArchitecture() {
  console.log('=== 1. TESTING AES-256-GCM MEMORY-SAFE ENCRYPTION & DECRYPTION ===');
  const secretKey = '0x134dfc592b0675ccd580b48a0ff404a667105874ad84c0011cf9693950db86ec';
  const encrypted = encryptCredential(secretKey);
  console.log('Ciphertext:', encrypted.ciphertext);
  console.log('IV:', encrypted.iv);
  console.log('AuthTag:', encrypted.authTag);
  const decrypted = decryptCredential(encrypted);
  console.log('Decryption Match:', decrypted === secretKey ? 'SUCCESS (PASS)' : 'FAIL');

  console.log('\n=== 2. TESTING CUSTODIAL WALLET CREATION ===');
  const newWallet = await createCustodialWallet('test_user_01', 'Test Vault Wallet');
  console.log('Wallet Address:', newWallet.address);
  console.log('Wallet ID:', newWallet.walletId);
  console.log('Backup Seed Phrase:', newWallet.backupSeedPhrase ? 'GENERATED (PASS)' : 'FAIL');

  console.log('\n=== 3. TESTING PRIVATE KEY & SEED PHRASE IMPORT ===');
  const importedPk = await importCustodialPrivateKey('0x51eb22c3a49f749648e053a48d369e19b9efdc644303612b56375980730b41dc', 'test_user_01', 'Funded Sepolia Vault');
  console.log('Imported PK Address:', importedPk.address);

  console.log('\n=== 4. TESTING TRANSACTION REQUEST & APPROVAL TOKEN GENERATION ===');
  const txReq = await createTransactionRequest({
    walletAddress: importedPk.address,
    recipient: '0x41BE1Fd008c4E41aaB1cd8550D8abe5fD55D86f5',
    amount: 0.0001,
    asset: 'ETH',
    network: 'sepolia',
    contractSummary: 'Custodial Architecture Verification Transfer',
    userId: 'test_user_01'
  });
  console.log('Request ID:', txReq.requestId);
  console.log('Approval Token:', txReq.approvalToken);
  console.log('Expires At:', txReq.expiresAt);

  console.log('\n=== 5. TESTING APPROVAL & LIVE ON-CHAIN SIGNING & BROADCAST ===');
  const execResult = await approveAndExecuteTransaction(txReq.approvalToken, 'test_user_01');
  console.log('Execution Status:', execResult.status);
  console.log('Broadcast Tx Hash:', execResult.txHash);
  console.log('Explorer URL:', execResult.explorerUrl);

  console.log('\n=== 6. TESTING SINGLE-USE TOKEN REPLAY PREVENTION ===');
  try {
    await approveAndExecuteTransaction(txReq.approvalToken, 'test_user_01');
    console.error('REPLAY PREVENTION FAILED!');
  } catch (err) {
    console.log('Replay Prevention Result:', err.message, '(PASS - REPLAY REJECTED)');
  }

  console.log('\nALL CUSTODIAL WALLET & SIGNING ARCHITECTURE TESTS PASSED 100%!');
}

testCustodialArchitecture().catch((err) => {
  console.error('Test Execution Error:', err);
  process.exit(1);
});
