import fetch from 'node-fetch';
import { getCliConfig } from './config.js';

export interface CliConfig {
  baseUrl: string;
  apiKey: string;
  walletAddress: string;
}

export function getConfig(): CliConfig {
  const saved = getCliConfig();
  const baseUrl = process.env.NORTHVEIL_API_URL || saved.apiUrl || 'https://mcp.northveil.xyz';
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

export async function mcpJsonRpc(method: string, params: any = {}): Promise<any> {
  const cfg = getConfig();
  const res = await fetch(`${cfg.baseUrl}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': cfg.apiKey,
      'Authorization': `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`MCP Error ${res.status}: ${errText}`);
  }

  const data: any = await res.json();
  if (data.error) {
    throw new Error(`MCP JSON-RPC Error: ${data.error.message || JSON.stringify(data.error)}`);
  }
  return data.result;
}

export async function postApi(endpoint: string, body: any): Promise<any> {
  const cfg = getConfig();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const targetWallet = cfg.walletAddress || body?.walletAddress || body?.fromAddress || body?.ownerAddress || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      ...(targetWallet ? { 'x-wallet-address': targetWallet } : {}),
      ...(cfg.apiKey ? { 'Authorization': `Bearer ${cfg.apiKey}`, 'X-API-Key': cfg.apiKey } : {}),
    };

    const res = await fetch(`${cfg.baseUrl}${endpoint}`, {
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
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
  } catch (e: any) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to reach Northveil Server at ${cfg.baseUrl}: ${e.message}`);
  }
}

export async function getApi(endpoint: string): Promise<any> {
  const cfg = getConfig();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      ...(cfg.walletAddress ? { 'x-wallet-address': cfg.walletAddress } : {}),
      ...(cfg.apiKey ? { 'Authorization': `Bearer ${cfg.apiKey}`, 'X-API-Key': cfg.apiKey } : {}),
    };

    const res = await fetch(`${cfg.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    } else {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
  } catch (e: any) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to reach Northveil Server at ${cfg.baseUrl}: ${e.message}`);
  }
}
