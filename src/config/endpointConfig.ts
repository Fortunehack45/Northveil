export const MCP_PUBLIC_ORIGIN = 'https://mcp.northveil.xyz';

export const getMcpServerUrl = (): string => {
  const env = (import.meta as any).env || {};
  if (env.VITE_MCP_SERVER_URL) {
    return String(env.VITE_MCP_SERVER_URL).replace(/\/$/, '');
  }
  if (env.VITE_USE_LOCAL_MCP === '1' && typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3001`;
    }
  }
  return 'https://mcp.northveil.xyz';
};

export function getPrimaryMcpUrl(): string {
  return `${getMcpServerUrl()}/mcp`;
}

export function getLegacySseUrl(walletAddress?: string): string {
  const base = `${getMcpServerUrl()}/sse`;
  return walletAddress ? `${base}?wallet_address=${walletAddress}` : base;
}

export const getMcpHttpUrl = (): string => {
  return getPrimaryMcpUrl();
};

export const getMcpSseUrl = (walletAddress?: string): string => {
  return getLegacySseUrl(walletAddress);
};

export const getMcpMessagesUrl = (sessionId: string): string => {
  const baseUrl = getMcpServerUrl();
  return `${baseUrl}/messages?sessionId=${sessionId}`;
};

export const getApiBaseUrl = (): string => {
  const baseUrl = getMcpServerUrl();
  return `${baseUrl}/api/v1`;
};

export const getOAuthAuthorizeUrl = (): string => {
  return `${getMcpServerUrl()}/oauth/authorize`;
};

export const getOAuthTokenUrl = (): string => {
  return `${getMcpServerUrl()}/oauth/token`;
};

export const getOAuthRegisterUrl = (): string => {
  return `${getMcpServerUrl()}/oauth/register`;
};

export const getOAuthProtectedResourceUrl = (): string => {
  return `${getMcpServerUrl()}/.well-known/oauth-protected-resource`;
};

export const getOAuthServerMetadataUrl = (): string => {
  return `${getMcpServerUrl()}/.well-known/oauth-authorization-server`;
};

export const getOpenApiUrl = (): string => {
  return `${getMcpServerUrl()}/openapi.json`;
};

