/**
 * Dynamic Endpoint Resolution Utility for Northveil Wallet & MCP AI Server
 * Resolves live URLs dynamically based on environment, current host, or VITE_MCP_SERVER_URL
 */

export const getMcpServerUrl = (): string => {
  const env = (import.meta as any).env || {};
  if (env.VITE_MCP_SERVER_URL) {
    return env.VITE_MCP_SERVER_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
      return `${protocol}//${hostname}:3001`;
    }

    return 'https://mcp.northveil.xyz';
  }

  return 'https://mcp.northveil.xyz';
};

export const getMcpSseUrl = (walletAddress?: string): string => {
  const baseUrl = getMcpServerUrl();
  const walletParam = walletAddress ? `?wallet_address=${walletAddress}` : '';
  return `${baseUrl}/sse${walletParam}`;
};

export const getMcpMessagesUrl = (sessionId: string): string => {
  const baseUrl = getMcpServerUrl();
  return `${baseUrl}/messages?sessionId=${sessionId}`;
};

export const getApiBaseUrl = (): string => {
  const baseUrl = getMcpServerUrl();
  return `${baseUrl}/api/v1`;
};
