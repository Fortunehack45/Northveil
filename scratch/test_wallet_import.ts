import { ethers } from 'ethers';
import { WalletService } from '../src/services/WalletService';
import { sanitizeToValidAddress, formatShortAddress } from '../src/services/addressUtils';

async function testWalletImport() {
  console.log('🧪 Testing Wallet Import & Address Derivation...\n');

  // Test 1: Standard 12-word seed phrase import
  const testMnemonic = 'test test test test test test test test test test test junk';
  const words = testMnemonic.split(' ');
  const derived = WalletService.deriveEVMAddress(words, 0);
  console.log('1. Derived EVM Address from seed:', derived.address);
  if (!derived.address.startsWith('0x') || derived.address.length !== 42) {
    throw new Error('Invalid derived address from seed');
  }
  console.log('   ✅ [PASS] 12-word seed successfully derived valid 0x EVM address:', derived.address);

  // Test 2: Sanitize address from raw mnemonic string
  const sanitizedFromMnemonic = sanitizeToValidAddress(testMnemonic, 0);
  console.log('2. Sanitized from raw mnemonic string:', sanitizedFromMnemonic);
  if (sanitizedFromMnemonic.toLowerCase() !== derived.address.toLowerCase()) {
    throw new Error(`Sanitized address ${sanitizedFromMnemonic} does not match derived ${derived.address}`);
  }
  console.log('   ✅ [PASS] Raw mnemonic string sanitized to exact derived public address');

  // Test 3: Private key import
  const testWallet = ethers.Wallet.createRandom();
  const rawKey = testWallet.privateKey;
  const sanitizedFromKey = sanitizeToValidAddress(rawKey, 0);
  console.log('3. Sanitized from raw private key:', sanitizedFromKey);
  if (sanitizedFromKey.toLowerCase() !== testWallet.address.toLowerCase()) {
    throw new Error(`Sanitized address ${sanitizedFromKey} does not match wallet address ${testWallet.address}`);
  }
  console.log('   ✅ [PASS] Raw private key sanitized to exact public address');

  // Test 4: formatShortAddress
  const formatted = formatShortAddress(testMnemonic, 0);
  console.log('4. formatShortAddress from mnemonic:', formatted);
  if (formatted.includes('test') || !formatted.startsWith('0x')) {
    throw new Error(`Formatted address exposed seed word: ${formatted}`);
  }
  console.log('   ✅ [PASS] Short address formatted cleanly without exposing seed words:', formatted);

  console.log('\n🎉 ALL WALLET IMPORT TESTS PASSED SUCCESSFULLY (4/4)');
}

testWalletImport().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
