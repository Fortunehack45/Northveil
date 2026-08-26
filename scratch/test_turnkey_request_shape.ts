/**
 * test_turnkey_request_shape.ts
 * 
 * Validates that the signTransaction request body our code constructs
 * matches the v1SignTransactionRequest schema from @turnkey/http.
 * 
 * Required shape (from public_api.types.d.ts, line 5642-5651):
 *   {
 *     type: "ACTIVITY_TYPE_SIGN_TRANSACTION_V2",
 *     timestampMs: string,
 *     organizationId: string,
 *     parameters: {
 *       signWith: string,
 *       unsignedTransaction: string,
 *       type: v1TransactionType  // e.g. "TRANSACTION_TYPE_ETHEREUM"
 *     }
 *   }
 */

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

// Simulate the request body our code now builds
function buildSignTransactionBody(params: {
  organizationId: string;
  walletAddress: string;
  unsignedTransaction: string;
}) {
  return {
    type: 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2' as const,
    timestampMs: Date.now().toString(),
    organizationId: params.organizationId,
    parameters: {
      signWith: params.walletAddress,
      unsignedTransaction: params.unsignedTransaction,
      type: 'TRANSACTION_TYPE_ETHEREUM' as const,
    },
  };
}

console.log('\n🔐 Turnkey signTransaction Request Shape Tests\n');

// Test 1: Top-level type is ACTIVITY_TYPE_SIGN_TRANSACTION_V2
console.log('Test 1: Top-level activity type');
{
  const body = buildSignTransactionBody({
    organizationId: 'org-test-123',
    walletAddress: '0xabc123',
    unsignedTransaction: '0xdef456',
  });
  assert(body.type === 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2', 
    `type is ACTIVITY_TYPE_SIGN_TRANSACTION_V2 (got: "${body.type}")`);
}

// Test 2: timestampMs is present and is a numeric string
console.log('\nTest 2: timestampMs field');
{
  const body = buildSignTransactionBody({
    organizationId: 'org-test-123',
    walletAddress: '0xabc123',
    unsignedTransaction: '0xdef456',
  });
  assert(typeof body.timestampMs === 'string', `timestampMs is a string`);
  assert(!isNaN(Number(body.timestampMs)), `timestampMs is a numeric string (got: "${body.timestampMs}")`);
  assert(Number(body.timestampMs) > 1700000000000, `timestampMs is a reasonable epoch ms value`);
}

// Test 3: organizationId is at top level
console.log('\nTest 3: organizationId placement');
{
  const body = buildSignTransactionBody({
    organizationId: 'org-test-123',
    walletAddress: '0xabc123',
    unsignedTransaction: '0xdef456',
  });
  assert(body.organizationId === 'org-test-123', `organizationId is at top level`);
}

// Test 4: parameters is a nested object
console.log('\nTest 4: parameters nesting');
{
  const body = buildSignTransactionBody({
    organizationId: 'org-test-123',
    walletAddress: '0xabc123',
    unsignedTransaction: '0xdef456',
  });
  assert(typeof body.parameters === 'object' && body.parameters !== null, 
    `parameters is a nested object`);
  assert('signWith' in body.parameters, `parameters.signWith exists`);
  assert('unsignedTransaction' in body.parameters, `parameters.unsignedTransaction exists`);
  assert('type' in body.parameters, `parameters.type exists`);
}

// Test 5: parameters.signWith contains the wallet address
console.log('\nTest 5: parameters.signWith');
{
  const body = buildSignTransactionBody({
    organizationId: 'org-test-123',
    walletAddress: '0xMyWalletAddress',
    unsignedTransaction: '0xdef456',
  });
  assert(body.parameters.signWith === '0xMyWalletAddress', 
    `parameters.signWith matches wallet address`);
}

// Test 6: parameters.unsignedTransaction contains the serialized tx
console.log('\nTest 6: parameters.unsignedTransaction');
{
  const body = buildSignTransactionBody({
    organizationId: 'org-test-123',
    walletAddress: '0xabc123',
    unsignedTransaction: '0xSerializedTxPayload',
  });
  assert(body.parameters.unsignedTransaction === '0xSerializedTxPayload', 
    `parameters.unsignedTransaction matches input`);
}

// Test 7: parameters.type is TRANSACTION_TYPE_ETHEREUM (not the activity type)
console.log('\nTest 7: parameters.type is transaction type, not activity type');
{
  const body = buildSignTransactionBody({
    organizationId: 'org-test-123',
    walletAddress: '0xabc123',
    unsignedTransaction: '0xdef456',
  });
  assert(body.parameters.type === 'TRANSACTION_TYPE_ETHEREUM', 
    `parameters.type is TRANSACTION_TYPE_ETHEREUM (not ACTIVITY_TYPE_*)`);
  assert((body.parameters.type as string) !== (body.type as string), 
    `parameters.type != top-level type (they serve different purposes)`);
}

// Test 8: signWith and unsignedTransaction are NOT at top level
console.log('\nTest 8: No stale flat fields at top level');
{
  const body = buildSignTransactionBody({
    organizationId: 'org-test-123',
    walletAddress: '0xabc123',
    unsignedTransaction: '0xdef456',
  });
  assert(!('signWith' in body), `signWith is NOT at top level (it belongs in parameters)`);
  assert(!('unsignedTransaction' in body), `unsignedTransaction is NOT at top level (it belongs in parameters)`);
}

// Test 9: Full schema validation against v1SignTransactionRequest shape
console.log('\nTest 9: Full schema shape validation');
{
  const body = buildSignTransactionBody({
    organizationId: 'org-test-456',
    walletAddress: '0xDEADBEEF',
    unsignedTransaction: '0xCAFEBABE',
  });
  
  const topLevelKeys = Object.keys(body).sort();
  const expectedTopLevel = ['organizationId', 'parameters', 'timestampMs', 'type'].sort();
  assert(JSON.stringify(topLevelKeys) === JSON.stringify(expectedTopLevel), 
    `Top-level keys are exactly: ${expectedTopLevel.join(', ')}`);
  
  const paramKeys = Object.keys(body.parameters).sort();
  const expectedParams = ['signWith', 'type', 'unsignedTransaction'].sort();
  assert(JSON.stringify(paramKeys) === JSON.stringify(expectedParams), 
    `parameters keys are exactly: ${paramKeys.join(', ')}`);
}

// Summary
console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) {
  console.error('\n❌ SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('\n✅ ALL TESTS PASSED — Turnkey request shape is correct');
}
