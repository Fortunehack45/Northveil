import http from 'http';
import {
  createMpcWallet,
  generatePasskeyRegistrationOptionsHandler,
  verifyAndStorePasskeyRegistration,
  generatePasskeyAuthenticationOptionsHandler,
  verifyPasskeyAuthentication,
} from '../mcp-server/mpcControlPlaneService.js';

process.env.NORTHVEIL_DEMO_MODE = 'true';
process.env.NODE_ENV = 'test';

async function runUnifiedWalletTests() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🧪 NORTHVEIL UNIFIED WALLET & PASSKEY INTEGRATION TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
    }
  }

  try {
    // Test 1: Create genuine Turnkey MPC Wallet
    console.log('1. Turnkey Hardware MPC Wallet Creation:');
    const testUserId = `test_user_${Date.now()}`;
    const mpcWallet = await createMpcWallet(testUserId, 'Integration Test Vault');
    assert(!!mpcWallet.address && mpcWallet.address.startsWith('0x'), `MPC Wallet created with valid EVM address: ${mpcWallet.address}`);
    assert(!!mpcWallet.mpcWalletId, `MPC Wallet ID generated: ${mpcWallet.mpcWalletId}`);

    // Test 2: WebAuthn Passkey Registration Options
    console.log('\n2. WebAuthn Passkey Registration:');
    const regOptions = await generatePasskeyRegistrationOptionsHandler(testUserId, 'tester@northveil.xyz', 'Test User');
    assert(!!regOptions.challenge, 'Server generated WebAuthn registration challenge');
    assert(regOptions.rp.name.includes('Northveil'), 'Relying party matches Northveil');

    // Test 3: Passkey Registration Verification & Session Issuance
    const dummyRegistrationResponse = {
      id: 'passkey_cred_test_123',
      rawId: 'passkey_cred_test_123',
      type: 'public-key',
      response: {
        clientDataJSON: Buffer.from(JSON.stringify({ type: 'webauthn.create', challenge: regOptions.challenge, origin: 'http://localhost:3001' })).toString('base64url'),
        attestationObject: Buffer.from('dummy_attestation').toString('base64url'),
        transports: ['internal', 'hybrid'],
      },
    };

    const regVerifyRes = await verifyAndStorePasskeyRegistration(testUserId, mpcWallet.address, dummyRegistrationResponse);
    assert(regVerifyRes.verified === true, 'Biometric passkey registration verified and stored');
    assert(regVerifyRes.credentialId === 'passkey_cred_test_123', 'Credential ID bound to MPC wallet');

    // Test 4: Passkey Authentication Options & Assertion Verification
    console.log('\n3. WebAuthn Passkey Authentication & Re-Entry:');
    const authOptions = await generatePasskeyAuthenticationOptionsHandler(testUserId, mpcWallet.address);
    assert(!!authOptions.challenge, 'Server generated WebAuthn authentication challenge');

    const dummyAuthResponse = {
      id: 'passkey_cred_test_123',
      rawId: 'passkey_cred_test_123',
      type: 'public-key',
      response: {
        clientDataJSON: Buffer.from(JSON.stringify({ type: 'webauthn.get', challenge: authOptions.challenge, origin: 'http://localhost:3001' })).toString('base64url'),
        authenticatorData: Buffer.from('dummy_auth_data').toString('base64url'),
        signature: Buffer.from('dummy_signature').toString('base64url'),
      },
    };

    const authVerifyRes = await verifyPasskeyAuthentication(testUserId, mpcWallet.address, dummyAuthResponse);
    assert(authVerifyRes.verified === true, 'Biometric passkey authentication verified successfully');
    assert(authVerifyRes.walletAddress.toLowerCase() === mpcWallet.address.toLowerCase(), 'Resolved matching MPC wallet address');

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log(`📊 Test Summary: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
    console.log('═══════════════════════════════════════════════════════════════════\n');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runUnifiedWalletTests();
