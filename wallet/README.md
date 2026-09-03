# Northveil Wallet Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Official web frontend and biometric passkey control plane for **Northveil**, deployed at [wallet.northveil.xyz](https://wallet.northveil.xyz).

Northveil is a non-custodial agent wallet control plane. The AI never holds keys. The server never holds a full key. Passkey assertions approve on-chain operations using isolated threshold MPC.

---

## 🛠 Features

- **Authentication**: Google OAuth identity + WebAuthn hardware passkey enrollment.
- **Enclave Provisioning**: Threshold MPC wallet partitions with zero server-held keys or seeds.
- **Autonomous Configuration**: Granular capability limits, daily spending caps, and recipient allowlists with passkey step-up.
- **Claude Connection Wizard**: Scrypt/argon2 client key generator (`nv_live_...`) and Claude Desktop JSON config generator.
- **Passkey Ceremony**: Cryptographically commits the WebAuthn challenge to `sha256(canonicalUnsignedTx)`.

---

## 💻 Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📄 License
MIT License © 2026 Northveil Protocol.
