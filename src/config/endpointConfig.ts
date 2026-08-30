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

    return window.location.origin;
  }

  return 'https://northveil.xyz';
};

export const getMcpHttpUrl = (): string => {
  const baseUrl = getMcpServerUrl();
  return `${baseUrl}/mcp`;
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

