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
  const apiKey = process.env.NORTHVEIL_API_KEY || saved.apiKey || '';
  const walletAddress = process.env.NORTHVEIL_WALLET_ADDRESS || saved.defaultWallet || '';
  return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey, walletAddress };
}

export function printBanner() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   NORTHVEIL DEVELOPER CLI                     ║
║         Multi-Chain Web3 & Autonomous Agent Protocol          ║
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
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const targetWallet = cfg.walletAddress || body?.walletAddress || '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-wallet-address': targetWallet,
        'Bypass-Tunnel-Reminder': 'true',
        ...(cfg.apiKey ? { 'Authorization': `Bearer ${cfg.apiKey}`, 'X-API-Key': cfg.apiKey } : {}),
      };

      const res = await fetch(url, {
        method: 'POST',
        headers,
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

export async function getApi(endpoint: string): Promise<any> {
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
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        ...(cfg.walletAddress ? { 'x-wallet-address': cfg.walletAddress } : {}),
        ...(cfg.apiKey ? { 'Authorization': `Bearer ${cfg.apiKey}`, 'X-API-Key': cfg.apiKey } : {}),
      };

      const res = await fetch(url, {
        method: 'GET',
        headers,
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
