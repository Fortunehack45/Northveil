#!/usr/bin/env node
/**
 * Northveil Official Production Webhook Receiver (Node.js / Express)
 * Run: node examples/webhook_receiver.js
 */

import express from 'express';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 4050;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'whsec_northveil_test_secret_998124';

// Capture raw body buffer for bit-for-bit HMAC verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Northveil Custom Domain Webhook Receiver',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.post(['/webhook', '/events'], (req, res) => {
  const signature = req.headers['x-northveil-signature'];
  const timestamp = req.headers['x-northveil-timestamp'];

  if (!signature || !req.rawBody) {
    return res.status(400).json({ error: 'Missing X-Northveil-Signature or request body' });
  }

  // 1. Calculate HMAC-SHA256
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const expectedSignature = 'sha256=' + hmac.update(req.rawBody).digest('hex');

  // 2. Constant-time comparison
  let isValid = false;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    isValid = false;
  }

  if (!isValid) {
    console.warn(`[!] Unauthorized Webhook Attempt: Signature mismatch.`);
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  // 3. Process Verified Event
  const event = req.body;
  console.log(`\n[+] VERIFIED NORTHVEIL WEBHOOK RECEIVED:`);
  console.log(`    Event ID:   ${event.id}`);
  console.log(`    Event Type: ${event.type}`);
  console.log(`    Payload:    ${JSON.stringify(event.data, null, 2)}`);

  return res.status(200).json({
    success: true,
    eventId: event.id,
    receivedAt: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ Northveil Webhook Receiver running on port ${PORT}`);
  console.log(`🔗 Endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🔑 Secret:   ${WEBHOOK_SECRET}`);
  console.log(`=======================================================`);
});
