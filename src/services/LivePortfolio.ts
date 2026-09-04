/**
 * Live Portfolio Service
 * Fetches authenticated user's live multi-chain balances from Northveil MCP
 */

export interface LiveAsset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  balance: number;
  priceUsd: number;
  valueUsd: number;
  icon?: string;
  explorerUrl?: string;
}

export interface LivePortfolioResponse {
  address: string | null;
  assets: LiveAsset[];
  totalUsdValue: number;
}

const MCP_URL = (import.meta as any).env?.VITE_NORTHVEIL_API_URL || (import.meta as any).env?.VITE_MCP_URL || 'https://mcp.northveil.xyz';

export async function fetchLivePortfolio(sessionToken?: string): Promise<LivePortfolioResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = sessionToken || localStorage.getItem('nv_session_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Session-Token'] = token;
  }

  try {
    const res = await fetch(`${MCP_URL}/wallet/portfolio`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { address: null, assets: [], totalUsdValue: 0 };
      }
      throw new Error(`Failed to fetch portfolio: HTTP ${res.status}`);
    }

    return (await res.json()) as LivePortfolioResponse;
  } catch (err) {
    console.warn('[Northveil] fetchLivePortfolio warning:', err);
    return { address: null, assets: [], totalUsdValue: 0 };
  }
}

export async function fetchLiveHistory(sessionToken?: string, chain: string = 'base'): Promise<any[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = sessionToken || localStorage.getItem('nv_session_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Session-Token'] = token;
  }

  try {
    const res = await fetch(`${MCP_URL}/wallet/history?chain=${chain}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('[Northveil] fetchLiveHistory warning:', err);
    return [];
  }
}

export async function fetchLiveMe(sessionToken?: string): Promise<{ user: any; wallet: any } | null> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = sessionToken || localStorage.getItem('nv_session_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Session-Token'] = token;
  }

  try {
    const res = await fetch(`${MCP_URL}/wallet/me`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
