process.env.NO_SERVER_LISTEN = 'true';
process.env.NODE_ENV = 'test';

import {
  generatePasskeyRegistrationOptionsHandler,
  verifyAndStorePasskeyRegistration,
  generatePasskeyAuthenticationOptionsHandler,
  verifyPasskeyAssertion,
  inMemoryPasskeyCredentials,
} from '../mcp-server/mpcControlPlaneService.js';
import { executeRealTool } from '../mcp-server/index.js';
import assert from 'assert';

async function testPasskeyOneToOneBinding() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔐 TESTING STRICT 1-TO-1 PASSKEY-TO-WALLET BINDING & SECURITY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const WALLET_A = '0x1111111111111111111111111111111111111111';
  const WALLET_B = '0x2222222222222222222222222222222222222222';

  // --- Step 1: Register Passkey for Wallet A ---
  console.log('--- Step 1: Registering Passkey for Wallet A (0x1111...1111) ---');
  const regOptionsA = await generatePasskeyRegistrationOptionsHandler('user_alice', 'alice@northveil.xyz', 'Alice Vault', WALLET_A);
  assert.ok(regOptionsA.challenge, 'Must generate challenge for Wallet A');
  console.log('Wallet A Challenge generated:', regOptionsA.challenge.slice(0, 16) + '...');

  const credResA = await verifyAndStorePasskeyRegistration('user_alice', WALLET_A, {
    id: 'demo_cred_alice_passkey_vault_a',
    rawId: 'demo_raw_alice_vault_a',
    type: 'public-key',
    response: {
      clientDataJSON: 'demo_client_data_a',
      attestationObject: 'demo_attestation_a',
    },
    authenticatorAttachment: 'platform',
  });

  console.log('Registered Passkey A:', credResA);
  assert.strictEqual(credResA.verified, true);
  assert.strictEqual(credResA.walletAddress, WALLET_A.toLowerCase());
  console.log('✅ [PASS] Passkey A registered and bound to Wallet A!\n');

  // --- Step 2: Register Passkey for Wallet B ---
  console.log('--- Step 2: Registering Separate Passkey for Wallet B (0x2222...2222) ---');
  const regOptionsB = await generatePasskeyRegistrationOptionsHandler('user_alice', 'alice@northveil.xyz', 'Alice Vault B', WALLET_B);
  assert.ok(regOptionsB.challenge, 'Must generate challenge for Wallet B');

  const credResB = await verifyAndStorePasskeyRegistration('user_alice', WALLET_B, {
    id: 'demo_cred_bob_passkey_vault_b',
    rawId: 'demo_raw_bob_vault_b',
    type: 'public-key',
    response: {
      clientDataJSON: 'demo_client_data_b',
      attestationObject: 'demo_attestation_b',
    },
    authenticatorAttachment: 'platform',
  });

  console.log('Registered Passkey B:', credResB);
  assert.strictEqual(credResB.verified, true);
  assert.strictEqual(credResB.walletAddress, WALLET_B.toLowerCase());
  console.log('✅ [PASS] Passkey B registered and bound to Wallet B!\n');

  // --- Step 3: Verify Isolated Authentication Options per Wallet ---
  console.log('--- Step 3: Testing Isolated Passkey Auth Options per Wallet ---');
  const authOptsA = await generatePasskeyAuthenticationOptionsHandler('user_alice', WALLET_A);
  console.log('Auth Options for Wallet A allowCredentials:', authOptsA.allowCredentials);
  assert.ok(authOptsA.allowCredentials && authOptsA.allowCredentials.length === 1, 'Wallet A must have exactly 1 credential');
  assert.strictEqual(authOptsA.allowCredentials[0].id, credResA.credentialId, 'Wallet A must only return Passkey A');

  const authOptsB = await generatePasskeyAuthenticationOptionsHandler('user_alice', WALLET_B);
  console.log('Auth Options for Wallet B allowCredentials:', authOptsB.allowCredentials);
  assert.ok(authOptsB.allowCredentials && authOptsB.allowCredentials.length === 1, 'Wallet B must have exactly 1 credential');
  assert.strictEqual(authOptsB.allowCredentials[0].id, credResB.credentialId, 'Wallet B must only return Passkey B');
  console.log('✅ [PASS] Authentication options strictly isolated 1-to-1 per wallet!\n');

  // --- Step 4: Verify Cross-Wallet Passkey Assertion Rejection ---
  console.log('--- Step 4: Testing Cross-Wallet Security Enforcement ---');
  // Attempt to use Passkey A to authorize Wallet B
  let crossWalletRejected = false;
  try {
    await verifyPasskeyAssertion(
      {
        credentialId: credResA.credentialId,
        clientDataJSON: 'demo_client_data_json',
        authenticatorData: 'demo_auth_data',
        signature: 'demo_sig',
      },
      authOptsB.challenge,
      'user_alice',
      WALLET_B // Requesting authorization for Wallet B with Passkey A
    );
  } catch (err: any) {
    crossWalletRejected = true;
    console.log('Expected Cross-Wallet Rejection Caught:', err.message);
    assert.ok(err.message.includes('bound strictly to wallet') || err.message.includes('control a single wallet'));
  }
  assert.strictEqual(crossWalletRejected, true, 'Cross-wallet passkey authorization MUST be rejected');
  console.log('✅ [PASS] Cross-wallet passkey assertion strictly blocked by security policy!\n');

  // --- Step 5: Test Matching Wallet Passkey Assertion Success ---
  console.log('--- Step 5: Testing Valid Same-Wallet Passkey Assertion ---');
  const verifyResA = await verifyPasskeyAssertion(
    {
      credentialId: credResA.credentialId,
      clientDataJSON: 'demo_client_data_json',
      authenticatorData: 'demo_auth_data',
      signature: 'demo_sig',
    },
    authOptsA.challenge,
    'user_alice',
    WALLET_A
  );
  assert.strictEqual(verifyResA.verified, true);
  console.log('Passkey A Assertion for Wallet A Result:', verifyResA);
  console.log('✅ [PASS] Valid same-wallet passkey assertion succeeded!\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL 1-TO-1 PASSKEY BINDING & SECURITY TESTS PASSED!');
  console.log('═══════════════════════════════════════════════════════════════');
}

testPasskeyOneToOneBinding().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
