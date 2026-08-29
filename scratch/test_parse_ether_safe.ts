import { ethers } from 'ethers';
import { parseEtherSafe } from '../src/services/addressUtils.js';

function testParseEtherSafe() {
  console.log('🧪 Testing parseEtherSafe against scientific notation and edge cases...\n');

  // Test 1: Scientific notation "5e-7"
  const val1 = parseEtherSafe('5e-7');
  console.log(`1. parseEtherSafe("5e-7"): ${val1.toString()} wei (expected: 500000000000 wei)`);
  if (val1 !== 500000000000n) {
    throw new Error(`Test 1 Failed: Expected 500000000000n, got ${val1}`);
  }
  console.log('   ✅ [PASS] "5e-7" correctly converted without FixedNumber crash.');

  // Test 2: Number in scientific notation 5e-7 (0.0000005)
  const val2 = parseEtherSafe(5e-7);
  console.log(`2. parseEtherSafe(5e-7 [number]): ${val2.toString()} wei`);
  if (val2 !== 500000000000n) {
    throw new Error(`Test 2 Failed: Expected 500000000000n, got ${val2}`);
  }
  console.log('   ✅ [PASS] Number 5e-7 correctly converted.');

  // Test 3: String with currency suffix "0.0000005 ETH"
  const val3 = parseEtherSafe('0.0000005 ETH');
  console.log(`3. parseEtherSafe("0.0000005 ETH"): ${val3.toString()} wei`);
  if (val3 !== 500000000000n) {
    throw new Error(`Test 3 Failed: Expected 500000000000n, got ${val3}`);
  }
  console.log('   ✅ [PASS] "0.0000005 ETH" cleaned and converted.');

  // Test 4: Small number 1e-18 (1 wei)
  const val4 = parseEtherSafe(1e-18);
  console.log(`4. parseEtherSafe(1e-18): ${val4.toString()} wei`);
  if (val4 !== 1n) {
    throw new Error(`Test 4 Failed: Expected 1n, got ${val4}`);
  }
  console.log('   ✅ [PASS] 1e-18 correctly equals 1 wei.');

  // Test 5: Standard values
  const val5 = parseEtherSafe('1.5');
  console.log(`5. parseEtherSafe("1.5"): ${val5.toString()} wei`);
  if (val5 !== ethers.parseEther('1.5')) {
    throw new Error(`Test 5 Failed: Expected ${ethers.parseEther('1.5')}, got ${val5}`);
  }
  console.log('   ✅ [PASS] Standard "1.5" matches ethers.parseEther.');

  // Test 6: Zero / undefined / null / invalid
  if (parseEtherSafe(undefined) !== 0n || parseEtherSafe(null) !== 0n || parseEtherSafe('0') !== 0n || parseEtherSafe('') !== 0n) {
    throw new Error('Test 6 Failed: Zero handling');
  }
  console.log('   ✅ [PASS] Falsy / zero amounts return 0n safely.');

  console.log('\n🎉 ALL 6 PARSE_ETHER_SAFE TESTS PASSED (6/6)\n');
}

testParseEtherSafe();
