const displayCap = Number(import.meta.env.VITE_MAX_LOGS_PER_TOPIC) || 500;

const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/logs';
const httpBaseUrl = wsUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://').replace(/\/ws\/.*$/, '');

const config = {
  httpBaseUrl,
  storageApiUrl: import.meta.env.VITE_STORAGE_API_URL || 'http://localhost:8081',
  sso: {
    loginUrl:    import.meta.env.VITE_SSO_LOGIN_URL    || '',
    logoutUrl:   import.meta.env.VITE_SSO_LOGOUT_URL   || '',
    tokenUrl:    import.meta.env.VITE_SSO_TOKEN_URL     || '',
    clientId:    import.meta.env.VITE_SSO_CLIENT_ID     || '',
    redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI  || `${window.location.origin}/callback`,
  },
  ws: {
    url: wsUrl,
    maxLogsPerTopic: displayCap,
    // Raw buffer is larger so filtered views have enough data to fill the display cap.
    // Server-side filtering limits bandwidth, so the extra memory is negligible.
    rawBufferPerTopic: displayCap * 4,
    maxMessageLength: Number(import.meta.env.VITE_MAX_MESSAGE_LENGTH) || 50_000,
  },
};

export default config;
