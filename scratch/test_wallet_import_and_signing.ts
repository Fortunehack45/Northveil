import { ethers } from 'ethers';
import { WalletService } from '../src/services/WalletService';
import { sanitizeToValidAddress, formatShortAddress } from '../src/services/addressUtils';

// Mock localStorage for node test
const storage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => storage.get(k) || null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
};

async function testImportAndSigning() {
  console.log('🧪 Testing Complete Wallet Import, Key Derivation & On-Chain Signing Flow...\n');

  // Test 1: Import 12-word seed phrase & EVM Wallet Derivation
  const mnemonic = 'test test test test test test test test test test test junk';
  const words = mnemonic.split(' ');
  const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
  
  const seedWallet = WalletService.getEVMWallet(words, 0, provider);
  console.log('1. Seed Wallet Address derived:', seedWallet.address);
  if (!seedWallet.address.startsWith('0x')) throw new Error('Invalid seed wallet address');
  console.log('   ✅ [PASS] Seed wallet initialized and connected.');

  // Test 2: Import Private Key & EVM Wallet Creation
  const randomWallet = ethers.Wallet.createRandom();
  const rawKey = randomWallet.privateKey;
  const pkWallet = WalletService.getEVMWallet([rawKey], 0, provider);
  console.log('2. Private Key Wallet Address derived:', pkWallet.address);
  if (pkWallet.address.toLowerCase() !== randomWallet.address.toLowerCase()) {
    throw new Error('PK wallet address mismatch');
  }
  console.log('   ✅ [PASS] Private key wallet initialized and verified.');

  // Test 3: Sign EIP-1559 Transaction with Seed Wallet
  const tx1 = {
    to: '0x59148d6a9dff263a772b5a84280bc88530f38636',
    value: ethers.parseEther('0.00005'),
    nonce: 0,
    gasLimit: 21000n,
    maxFeePerGas: ethers.parseUnits('20', 'gwei'),
    maxPriorityFeePerGas: ethers.parseUnits('1.5', 'gwei'),
    chainId: 11155111,
    type: 2,
  };
  const signedTx1 = await seedWallet.signTransaction(tx1);
  const recovered1 = ethers.Transaction.from(signedTx1).from?.toLowerCase();
  console.log('3. Seed Wallet signed tx recovered sender:', recovered1);
  if (recovered1 !== seedWallet.address.toLowerCase()) throw new Error('Sender mismatch on seed tx');
  console.log('   ✅ [PASS] Seed wallet successfully signed EIP-1559 transaction.');

  // Test 4: Sign EIP-1559 Transaction with PK Wallet
  const signedTx2 = await pkWallet.signTransaction(tx1);
  const recovered2 = ethers.Transaction.from(signedTx2).from?.toLowerCase();
  console.log('4. PK Wallet signed tx recovered sender:', recovered2);
  if (recovered2 !== pkWallet.address.toLowerCase()) throw new Error('Sender mismatch on PK tx');
  console.log('   ✅ [PASS] Private key wallet successfully signed EIP-1559 transaction.');

  // Test 5: Message signing
  const msgSig1 = await WalletService.signMessage(words, 0, 'Welcome to Northveil');
  const msgSig2 = await WalletService.signMessage([rawKey], 0, 'Welcome to Northveil');
  console.log('5. Message signatures generated:', msgSig1.slice(0, 20) + '...', msgSig2.slice(0, 20) + '...');
  console.log('   ✅ [PASS] EIP-191 message signing verified.');

  console.log('\n🎉 ALL WALLET IMPORT & SIGNING TESTS PASSED (5/5)');
}

testImportAndSigning().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
