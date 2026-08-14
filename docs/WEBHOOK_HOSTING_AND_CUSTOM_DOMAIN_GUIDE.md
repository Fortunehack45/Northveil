# Hosting Northveil Webhooks on Your Own Custom Domain

[![Webhooks](https://img.shields.io/badge/Webhooks-HMAC--SHA256-emerald.svg?style=flat-square)](https://northveil.xyz)
[![Security](https://img.shields.io/badge/Signature-X--Northveil--Signature-blue.svg?style=flat-square)](https://csrc.nist.gov/)
[![Deployment](https://img.shields.io/badge/Hosting-VPS%20%7C%20Cloudflare%20%7C%20Vercel-purple.svg?style=flat-square)](https://cloudflare.com)

This complete guide explains how to build, secure, and host a **Northveil Real-Time Webhook Receiver** on your own custom domain (e.g. `https://webhook.yourdomain.com/events` or `https://api.yourdomain.com/northveil-webhook`).

---

## 📑 Table of Contents
1. [How Northveil Webhooks Work](#1-how-northveil-webhooks-work)
2. [Webhook Payload & Header Specification](#2-webhook-payload--header-specification)
3. [HMAC-SHA256 Cryptographic Verification](#3-hmac-sha256-cryptographic-verification)
4. [Production Webhook Receiver Code](#4-production-webhook-receiver-code)
   - [Node.js / Express](#a-nodejs--express-receiver)
   - [Python / FastAPI](#b-python--fastapi-receiver)
   - [Go (Golang)](#c-go-golang-receiver)
5. [How to Host on Your Own Custom Domain](#5-how-to-host-on-your-own-custom-domain)
   - [Option 1: Self-Hosted Linux VPS (Ubuntu + Nginx + Certbot SSL)](#option-1-self-hosted-linux-vps-ubuntu--nginx--certbot-ssl)
   - [Option 2: Cloudflare Workers (Edge Serverless + Custom Domain)](#option-2-cloudflare-workers-edge-serverless--custom-domain)
   - [Option 3: Vercel / Railway / Render (Zero-Config HTTPS)](#option-3-vercel--railway--render-zero-config-https)
   - [Option 4: Local Development via Cloudflare Tunnel (`cloudflared`)](#option-4-local-development-via-cloudflare-tunnel-cloudflared)
6. [Testing Your Custom Domain Webhook with Northveil CLI & API](#6-testing-your-custom-domain-webhook)

---

## 1. How Northveil Webhooks Work

Whenever an on-chain or real-world action occurs on Northveil (e.g., flight ticket issued, trade order matched, crypto deposit finalized, contract deployed), the Northveil Gateway dispatches an HTTP POST event to your registered webhook URL.

```
┌───────────────────────────────┐
│   NORTHVEIL PROTOCOL GATEWAY  │
│  • Flight Ticket Confirmed    │
│  • Trade Matched on Uniswap   │
└───────────────┬───────────────┘
                │
                │ HTTP POST + HMAC-SHA256 Signature
                ▼
┌───────────────────────────────┐
│  YOUR CUSTOM DOMAIN WEBHOOK   │
│  https://webhook.yourdomain.com
│  • Verifies HMAC Signature    │
│  • Updates Your DB & CRM      │
└───────────────────────────────┘
```

---

## 2. Webhook Payload & Header Specification

### Request Headers
Every webhook dispatch from Northveil includes these headers:
- `Content-Type: application/json`
- `X-Northveil-Signature: sha256=<hex_digest>`
- `X-Northveil-Timestamp: <unix_timestamp_ms>`
- `User-Agent: Northveil-Webhook-Dispatcher/1.0.1`

### Event Payload Schema
```json
{
  "id": "evt_test_1723639800000",
  "object": "event",
  "type": "reservation.created",
  "created": 1723639800,
  "data": {
    "bookingReference": "NV-FLT-2452-ELSM",
    "pnr": "TXAKQ8",
    "airline": "British Airways",
    "route": "London (LHR) -> New York (JFK)",
    "passengerName": "Alex Northveil",
    "fareCrypto": "0.5194 ETH",
    "fareUsd": 1792.00,
    "status": "CONFIRMED",
    "timestamp": "2026-08-14T10:30:00Z"
  }
}
```

---

## 3. HMAC-SHA256 Cryptographic Verification

To protect your webhook receiver against spoofing, replay attacks, and man-in-the-middle tampering, verify the `X-Northveil-Signature` header using your Webhook Secret (`WEBHOOK_SECRET` or `whsec_...`):

$$	ext{Expected Signature} = 	ext{"sha256="} + 	ext{HMAC-SHA256}(	ext{Raw Payload Body}, 	ext{Secret})$$

Always use **constant-time string comparison** (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.

---

## 4. Production Webhook Receiver Code

### A. Node.js / Express Receiver
```javascript
// server.js
import express from 'express';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'whsec_northveil_test_secret_998124';

// Use raw buffer body parser for exact HMAC computation
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-northveil-signature'];
  const timestamp = req.headers['x-northveil-timestamp'];

  if (!signature || !req.rawBody) {
    return res.status(400).json({ error: 'Missing webhook signature or body' });
  }

  // 1. Verify HMAC-SHA256 Signature
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const expectedSignature = 'sha256=' + hmac.update(req.rawBody).digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    console.warn('⚠️ [Northveil Webhook]: Invalid HMAC signature rejected!');
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  // 2. Process Verified Event
  const event = req.body;
  console.log(`✅ [Northveil Webhook Verified]: Event ${event.type} (${event.id})`);

  switch (event.type) {
    case 'reservation.created':
      console.log(`✈️ Flight Confirmed! PNR: ${event.data.pnr} for ${event.data.passengerName}`);
      break;
    case 'tx.confirmed':
      console.log(`💰 Transaction Confirmed! TxHash: ${event.data.transactionHash}`);
      break;
    case 'contract.deployed':
      console.log(`📄 Contract Deployed! Address: ${event.data.contractAddress}`);
      break;
    default:
      console.log(`ℹ️ Received event: ${event.type}`);
  }

  // 3. Return 200 OK
  return res.status(200).json({ received: true });
});

app.listen(PORT, () => {
  console.log(`⚡ Northveil Webhook Receiver listening on port ${PORT}`);
});
```

---

### B. Python / FastAPI Receiver
```python
# main.py
import hmac
import hashlib
import json
import os
from fastapi import FastAPI, Request, HTTPException, Header
import uvicorn

app = FastAPI(title="Northveil Webhook Receiver")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "whsec_northveil_test_secret_998124")

@app.post("/webhook")
async def handle_webhook(
    request: Request,
    x_northveil_signature: str = Header(None),
    x_northveil_timestamp: str = Header(None)
):
    if not x_northveil_signature:
        raise HTTPException(status_code=400, detail="Missing signature header")

    body_bytes = await request.body()

    # 1. Compute HMAC-SHA256
    expected_sig = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode(),
        body_bytes,
        hashlib.sha256
    ).hexdigest()

    # 2. Constant-Time Verification
    if not hmac.compare_digest(x_northveil_signature, expected_sig):
        raise HTTPException(status_code=401, detail="Invalid HMAC signature")

    # 3. Process Payload
    event = json.loads(body_bytes.decode())
    print(f"✅ Verified Northveil Event: {event.get('type')} (ID: {event.get('id')})")
    
    return {"status": "success", "received": True}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4000)
```

---

## 5. How to Host on Your Own Custom Domain

### Option 1: Self-Hosted Linux VPS (Ubuntu + Nginx + Certbot SSL)

This gives you a dedicated endpoint like `https://webhook.yourdomain.com/webhook`:

#### Step 1: Deploy Node.js Receiver on VPS
```bash
# SSH into your VPS
ssh root@your-server-ip

# Install Node.js & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2

# Clone or upload your receiver
mkdir -p /var/www/webhook && cd /var/www/webhook
# (Save the server.js file above)
npm init -y && npm install express

# Start with PM2 daemon
pm2 start server.js --name "northveil-webhook"
pm2 save && pm2 startup
```

#### Step 2: Configure DNS Record
In your DNS provider (Cloudflare, Namecheap, GoDaddy):
- **Type**: `A`
- **Name**: `webhook` (or `@` for root)
- **Content**: `YOUR_VPS_PUBLIC_IPV4`
- **TTL**: Auto

#### Step 3: Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/webhook.yourdomain.com`:
```nginx
server {
    server_name webhook.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/webhook.yourdomain.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

#### Step 4: Issue Free SSL Certificate with Certbot
```bash
certbot --nginx -d webhook.yourdomain.com
```
Your webhook is now live at `https://webhook.yourdomain.com/webhook` with automatic HTTPS!

---

### Option 2: Cloudflare Workers (Edge Serverless + Custom Domain)

1. In Cloudflare Dashboard, create a **Cloudflare Worker**:
```javascript
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const sig = request.headers.get('x-northveil-signature');
    const secret = env.WEBHOOK_SECRET || 'whsec_northveil_test_secret_998124';
    const body = await request.text();

    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
    const expectedSig = 'sha256=' + Array.from(new Uint8Array(signatureBytes)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (sig !== expectedSig) {
      return new Response(JSON.stringify({ error: 'Invalid HMAC signature' }), { status: 401 });
    }

    return new Response(JSON.stringify({ status: 'ok', message: 'Webhook received on custom domain!' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```
2. Go to **Worker Settings** ➔ **Domains & Routes** ➔ **Add Custom Domain**.
3. Type `webhook.yourdomain.com`. Cloudflare automatically routes traffic and issues SSL certificates!

---

### Option 3: Local Testing with Cloudflare Tunnels or ngrok

During local development, expose your localhost webhook server:
```bash
# Using Cloudflare Tunnel
npx cloudflared tunnel --url http://localhost:4000
```
This gives you an instant HTTPS address (e.g. `https://random-subdomain.trycloudflare.com/webhook`).

---

## 6. Testing Your Custom Domain Webhook

You can test your live webhook endpoint anytime using the **Northveil CLI**:

```bash
# Test your custom domain
northveil webhooks --test https://webhook.yourdomain.com/webhook --event reservation.created
```

Or via `curl`:
```bash
curl -X POST https://mcp.northveil.xyz/api/v1/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"url": "https://webhook.yourdomain.com/webhook", "eventType": "reservation.created"}'
```

Output:
```
📡 Dispatching HMAC-SHA256 signed test event to: https://webhook.yourdomain.com/webhook...

✅ TEST DISPATCH RESULT:
  Target URL:         https://webhook.yourdomain.com/webhook
  HTTP Status:        200 OK
  Roundtrip Latency:  42 ms
  HMAC Signature:     sha256=3f89a1c...
  Delivery Status:    [DELIVERED]
```

---

*Northveil Core Engineering Team © 2026. Built with precision for enterprise webhooks and decentralized events.*
