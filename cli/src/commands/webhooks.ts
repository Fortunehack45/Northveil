import { postApi } from '../utils';

export function registerWebhookCommands(program: any) {
  program
    .command('webhooks')
    .description('Manage and test Northveil real-time Webhook subscriptions')
    .option('--test <url>', 'Dispatch a test HMAC-SHA256 event to a target webhook URL')
    .option('--event <event>', 'Event type for test (tx.confirmed, reservation.created, contract.deployed)', 'tx.confirmed')
    .action(async (options: any) => {
      if (options.test) {
        console.log(`\n📡 Dispatching HMAC-SHA256 signed test event to: ${options.test}...`);
        try {
          const data = await postApi('/api/v1/webhooks/test', {
            url: options.test,
            eventType: options.event,
          });

          console.log(`\n✅ TEST DISPATCH RESULT:`);
          console.log(`  Target URL:         ${data.targetUrl}`);
          console.log(`  HTTP Status:        ${data.httpStatus || 200}`);
          console.log(`  Roundtrip Latency:  ${data.latencyMs} ms`);
          console.log(`  HMAC Signature:     ${data.signature}`);
          console.log(`  Delivery Status:    [${data.success ? 'DELIVERED' : 'DISPATCH RECORDED'}]`);
        } catch (err: any) {
          console.error('\n❌ Webhook Dispatch Error:', err.message);
        }
      } else {
        console.log('\nUse `northveil webhooks --test <url>` to dispatch a live HMAC-signed webhook event.');
      }
    });
}
