import fetch from 'node-fetch';
import { getCliConfig, saveCliConfig, clearCliConfig } from '../config';
import { printBanner, API_BASE_CANDIDATES } from '../utils';

export async function loginCommand(options: { key?: string; url?: string }) {

  const apiKey = options.key || process.env.NORTHVEIL_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: API Key is required.');
    console.log('👉 Usage: northveil login --key <your_nv_live_key>\n');
    process.exit(1);
  }

  const customUrl = options.url || process.env.NORTHVEIL_API_URL;
  const urlsToTry = customUrl ? [customUrl, ...API_BASE_CANDIDATES] : API_BASE_CANDIDATES;

  console.log('🔑 Authenticating with Northveil Protocol...');

  let authData: any = null;
  let activeUrl = '';

  for (const baseUrl of urlsToTry) {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-API-Key': apiKey,
          'Bypass-Tunnel-Reminder': 'true',
        },
      });

      if (res.ok) {
        authData = await res.json();
        activeUrl = baseUrl;
        break;
      }
    } catch (e) {
      // Try next endpoint
    }
  }

  if (!authData || !authData.authenticated) {
    console.error('❌ Authentication Failed: Invalid or inactive API key.');
    process.exit(1);
  }

  saveCliConfig({
    apiKey,
    apiUrl: activeUrl,
    defaultWallet: authData.walletAddress,
    keyName: authData.keyName,
    tier: authData.tier,
    userId: authData.userId,
  });

  console.log('✅ Login Successful!');
  console.log(`👤 User ID:        ${authData.userId}`);
  console.log(`🏷️  Key Name:       ${authData.keyName}`);
  console.log(`💎 Access Tier:    ${(authData.tier || 'Developer').toUpperCase()}`);
  console.log(`👛 Scoped Wallet:  ${authData.walletAddress}`);
  console.log(`🌐 Active Gateway: ${activeUrl}`);
  console.log('\n🔒 All CLI commands are now authenticated and scoped to your account.\n');
}

export async function whoamiCommand() {

  const config = getCliConfig();
  const apiKey = config.apiKey || process.env.NORTHVEIL_API_KEY;

  if (!apiKey) {
    console.log('ℹ️  Status: Unauthenticated (Guest Public Mode)');
    console.log('👉 Run `northveil login --key <your_key>` to authenticate your CLI session.\n');
    return;
  }

  const targetUrl = config.apiUrl || process.env.NORTHVEIL_API_URL || API_BASE_CANDIDATES[0];

  try {
    const res = await fetch(`${targetUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
        'Bypass-Tunnel-Reminder': 'true',
      },
    });

    if (res.ok) {
      const auth: any = await res.json();
      console.log('👤 Authenticated Identity:');
      console.log(`• User / Org ID:   ${auth.userId}`);
      console.log(`• Key Identifier:  ${auth.keyName}`);
      console.log(`• Permission Tier: ${(auth.tier || 'Developer').toUpperCase()}`);
      console.log(`• Scoped Wallet:   ${auth.walletAddress}`);
      console.log(`• Allowed Wallets: ${(auth.allowedWallets || []).join(', ')}`);
      console.log(`• API Gateway:     ${targetUrl}\n`);
    } else {
      console.log('⚠️ Saved API key returned an invalid authentication status.');
    }
  } catch (e: any) {
    console.log(`• Cached Key:      ${apiKey.slice(0, 10)}...`);
    console.log(`• Bound Wallet:    ${config.defaultWallet || 'Not Set'}`);
    console.log(`• Tier:            ${config.tier || 'Developer'}\n`);
  }
}

export function logoutCommand() {
  clearCliConfig();
  console.log('👋 Logged out successfully. Local authentication credentials cleared.');
  console.log('ℹ️  CLI has reverted to Guest Public mode.\n');
}
