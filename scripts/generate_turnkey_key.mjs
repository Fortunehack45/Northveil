import crypto from 'crypto';
import { ApiKeyStamper } from '@turnkey/api-key-stamper';

// Turnkey API keys use SECP256R1 / P-256 (prime256v1) ECDSA keypairs.
const ecdh = crypto.createECDH('prime256v1');
ecdh.generateKeys();

const apiPublicKey = ecdh.getPublicKey('hex', 'compressed');
const apiPrivateKey = ecdh.getPrivateKey('hex');

const organizationId = process.argv[2] || '9db86321-535c-4b2a-baea-686537851f8d';

// Verify that the generated key works with Turnkey ApiKeyStamper
const stamper = new ApiKeyStamper({
  apiPublicKey,
  apiPrivateKey,
});

const testPayload = JSON.stringify({ type: 'ACTIVITY_TYPE_CREATE_WALLET', timestampMs: Date.now().toString() });
await stamper.stamp(testPayload);

console.log('\n=============================================================');
console.log('🔑 TURNKEY API KEY GENERATED SUCCESSFULLY');
console.log('=============================================================\n');

console.log('📌 1. TURNKEY PUBLIC KEY (Copy & paste into Turnkey Dashboard):');
console.log('-------------------------------------------------------------');
console.log(apiPublicKey);
console.log('\n📌 2. TURNKEY PRIVATE KEY (Keep secret, put in your .env):');
console.log('-------------------------------------------------------------');
console.log(apiPrivateKey);
console.log('\n📌 3. YOUR .env CONFIGURATION SNIPPET:');
console.log('-------------------------------------------------------------');
console.log(`TURNKEY_ORGANIZATION_ID=${organizationId}`);
console.log(`TURNKEY_API_PUBLIC_KEY=${apiPublicKey}`);
console.log(`TURNKEY_API_PRIVATE_KEY=${apiPrivateKey}`);
console.log('TURNKEY_API_BASE_URL=https://api.turnkey.com');
console.log('\n=============================================================');
console.log('📋 NEXT STEPS IN TURNKEY DASHBOARD:');
console.log('1. Go to https://app.turnkey.com');
console.log('2. Log in and select your Organization (ID: ' + organizationId + ')');
console.log('3. Navigate to: Organization Settings -> Users (or API Keys)');
console.log('4. Click "Add API Key" (or create a Service User / API Key)');
console.log('5. Paste the TURNKEY PUBLIC KEY above and click Save/Approve');
console.log('6. Add the .env configuration snippet to your local .env and server environments.');
console.log('=============================================================\n');
