import fetch from 'node-fetch';
import { getCliConfig } from './config.js';

export interface CliConfig {
  baseUrl: string;
  apiKey: string;
  walletAddress: string;
}

export const API_BASE_CANDIDATES = [
  'https://mcp.northveil.xyz',
  'https://northveil-mcp.vercel.app',
  'http://127.0.0.1:3001',
  'http://localhost:3001',
];

export function getConfig(): CliConfig {
  const saved = getCliConfig();
  const baseUrl = process.env.NORTHVEIL_API_URL || saved.apiUrl || process.env.VITE_MCP_SERVER_URL || 'https://mcp.northveil.xyz';
  const apiKey = process.env.NORTHVEIL_API_KEY || saved.apiKey || 'nv_live_default_northveil_key';
  const walletAddress = process.env.NORTHVEIL_WALLET_ADDRESS || saved.defaultWallet || '0x87678de86804c6c3612d66cbd6e2857f1a7d8345';
  return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey, walletAddress };
}

export function printBanner() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   NORTHVEIL DEVELOPER CLI                     ║
║         Multi-Chain Web3 & Autonomous Travel Protocol         ║
╚═══════════════════════════════════════════════════════════════╝`);
}

export async function postApi(endpoint: string, body: any): Promise<any> {
  const cfg = getConfig();
  const endpointsToTry = [
    `${cfg.baseUrl}${endpoint}`,
    'http://127.0.0.1:3001' + endpoint,
    'http://localhost:3001' + endpoint,
    'https://northveil-mcp.vercel.app' + endpoint,
  ];

  let lastErrorMsg = '';
  for (const url of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cfg.apiKey}`,
          'x-wallet-address': cfg.walletAddress,
        },
        body: JSON.stringify(body),
        signal: controller.signal as any,
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      } else {
        const errText = await res.text().catch(() => '');
        lastErrorMsg = `HTTP ${res.status}: ${errText}`;
      }
    } catch (e: any) {
      lastErrorMsg = e.message;
    }
  }

  throw new Error(`Failed to reach Northveil Server (${lastErrorMsg || 'Connection timeout'})`);
}
