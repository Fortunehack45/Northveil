import crypto from 'crypto';
import { ethers } from 'ethers';

const MASTER_SECRET = process.env.NORTHVEIL_MASTER_KEY || process.env.SUPABASE_ANON_KEY || 'northveil_production_master_vault_key_2026';

function getMasterKey() {
  return crypto.createHash('sha256').update(MASTER_SECRET).digest();
}

function decryptCredential(payload) {
  const ivBuffer = Buffer.from(payload.iv, 'hex');
  const authTagBuffer = Buffer.from(payload.authTag, 'hex');
  const masterKey = getMasterKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, ivBuffer);
  decipher.setAuthTag(authTagBuffer);

  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const testPayload = {
  ciphertext: "cfdfba8999442f42e92983ed367700bfb9a346fd118cb923686a38d94a8cc8e6f0bd5325ea2e191a350aeac3965ed26674b7b73c1151aeb6df34c256cc7d8a27972818068106",
  iv: "e947ca2453902507fa96a641",
  authTag: "06842730eadd3599f015417f858cfc2a"
};

try {
  const decrypted = decryptCredential(testPayload);
  console.log('Decrypted phrase:', decrypted);
  const wallet = ethers.Wallet.fromPhrase(decrypted);
  console.log('Derived wallet address:', wallet.address);
  console.log('Derived private key:', wallet.privateKey);
} catch (e) {
  console.error('Decryption failed:', e);
}
